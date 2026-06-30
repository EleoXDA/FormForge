<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type {
  FormField,
  FieldLogic,
  Condition,
  ConditionOperator
} from '@/types'
import PropertySection from './PropertySection.vue'
import PropertyRow from './PropertyRow.vue'

interface Props {
  field: FormField
  availableFields: FormField[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:logic': [logic: FieldLogic | undefined]
}>()

type RuleKey = 'showIf' | 'requiredIf' | 'disableIf'

const ruleDefs: { key: RuleKey; label: string; hint: string }[] = [
  {
    key: 'showIf',
    label: 'Show this field when',
    hint: 'The field is only shown when these conditions are met.'
  },
  {
    key: 'requiredIf',
    label: 'Make required when',
    hint: 'The field becomes required when these conditions are met.'
  },
  {
    key: 'disableIf',
    label: 'Disable this field when',
    hint: 'The field becomes read-only when these conditions are met.'
  }
]

const operatorOptions: { value: ConditionOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'notEquals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'gt', label: 'greater than' },
  { value: 'lt', label: 'less than' },
  { value: 'isEmpty', label: 'is empty' },
  { value: 'isNotEmpty', label: 'is not empty' }
]

const combinatorOptions = [
  { value: 'and', label: 'All' },
  { value: 'or', label: 'Any' }
]

const fieldOptions = computed(() =>
  props.availableFields.map((f) => ({ value: f.id, label: f.label || f.name || f.id }))
)

function cloneLogic(source?: FieldLogic): FieldLogic {
  return source ? (JSON.parse(JSON.stringify(source)) as FieldLogic) : {}
}

const localLogic = ref<FieldLogic>(cloneLogic(props.field.logic))

// Reset the local working copy whenever a different field is selected.
watch(
  () => props.field.id,
  () => {
    localLogic.value = cloneLogic(props.field.logic)
  }
)

function operatorNeedsValue(operator: ConditionOperator): boolean {
  return operator !== 'isEmpty' && operator !== 'isNotEmpty'
}

function newCondition(): Condition {
  return {
    field: props.availableFields[0]?.id ?? '',
    operator: 'equals',
    value: ''
  }
}

/**
 * Build a cleaned logic object (dropping empty rules) and emit it.
 */
function emitLogic() {
  const cleaned: FieldLogic = {}
  for (const { key } of ruleDefs) {
    const group = localLogic.value[key]
    if (group && group.conditions.length > 0) {
      cleaned[key] = {
        combinator: group.combinator,
        conditions: group.conditions.map((c) => ({ ...c }))
      }
    }
  }
  emit('update:logic', Object.keys(cleaned).length > 0 ? cleaned : undefined)
}

function isRuleEnabled(key: RuleKey): boolean {
  const group = localLogic.value[key]
  return !!group && group.conditions.length > 0
}

function enableRule(key: RuleKey) {
  localLogic.value[key] = { combinator: 'and', conditions: [newCondition()] }
  emitLogic()
}

function removeRule(key: RuleKey) {
  delete localLogic.value[key]
  emitLogic()
}

function setCombinator(key: RuleKey, combinator: 'and' | 'or') {
  const group = localLogic.value[key]
  if (group) {
    group.combinator = combinator
    emitLogic()
  }
}

function addCondition(key: RuleKey) {
  const group = localLogic.value[key]
  if (group) {
    group.conditions.push(newCondition())
    emitLogic()
  }
}

function removeCondition(key: RuleKey, index: number) {
  const group = localLogic.value[key]
  if (!group) return
  group.conditions.splice(index, 1)
  if (group.conditions.length === 0) {
    delete localLogic.value[key]
  }
  emitLogic()
}

function updateConditionField(key: RuleKey, index: number, value: string) {
  const cond = localLogic.value[key]?.conditions[index]
  if (cond) {
    cond.field = value
    emitLogic()
  }
}

function updateConditionOperator(key: RuleKey, index: number, value: ConditionOperator) {
  const cond = localLogic.value[key]?.conditions[index]
  if (cond) {
    cond.operator = value
    if (!operatorNeedsValue(value)) cond.value = undefined
    emitLogic()
  }
}

function updateConditionValue(key: RuleKey, index: number, value: string) {
  const cond = localLogic.value[key]?.conditions[index]
  if (cond) {
    cond.value = value
    emitLogic()
  }
}
</script>

<template>
  <PropertySection title="Conditional Logic" :default-open="false">
    <div
      v-if="availableFields.length === 0"
      class="text-caption text-grey text-center q-py-sm"
    >
      Add other fields to this form to build conditions.
    </div>

    <template v-else>
      <div v-for="rule in ruleDefs" :key="rule.key" class="logic-rule">
        <PropertyRow :label="rule.label" :hint="rule.hint">
          <div v-if="!isRuleEnabled(rule.key)">
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              color="primary"
              icon="add"
              label="Add condition"
              @click="enableRule(rule.key)"
            />
          </div>

          <div v-else class="logic-group">
            <div class="row items-center q-gutter-sm q-mb-sm">
              <span class="text-caption text-grey-7">Match</span>
              <q-btn-toggle
                :model-value="localLogic[rule.key]?.combinator"
                :options="combinatorOptions"
                dense
                no-caps
                unelevated
                size="sm"
                text-color="grey-8"
                toggle-color="primary"
                @update:model-value="(v: 'and' | 'or') => setCombinator(rule.key, v)"
              />
              <span class="text-caption text-grey-7">of the following:</span>
            </div>

            <div
              v-for="(cond, index) in localLogic[rule.key]?.conditions ?? []"
              :key="index"
              class="logic-condition q-mb-sm"
            >
              <div class="row q-col-gutter-xs items-start">
                <div class="col-12">
                  <q-select
                    :model-value="cond.field"
                    :options="fieldOptions"
                    emit-value
                    map-options
                    dense
                    outlined
                    label="Field"
                    @update:model-value="(v: string) => updateConditionField(rule.key, index, v)"
                  />
                </div>
                <div class="col">
                  <q-select
                    :model-value="cond.operator"
                    :options="operatorOptions"
                    emit-value
                    map-options
                    dense
                    outlined
                    label="Condition"
                    @update:model-value="(v: ConditionOperator) => updateConditionOperator(rule.key, index, v)"
                  />
                </div>
                <div v-if="operatorNeedsValue(cond.operator)" class="col">
                  <q-input
                    :model-value="(cond.value as string) ?? ''"
                    dense
                    outlined
                    label="Value"
                    @update:model-value="(v: string | number | null) => updateConditionValue(rule.key, index, String(v ?? ''))"
                  />
                </div>
                <div class="col-auto">
                  <q-btn
                    flat
                    dense
                    round
                    size="sm"
                    icon="close"
                    color="grey-6"
                    @click="removeCondition(rule.key, index)"
                  />
                </div>
              </div>
            </div>

            <div class="row items-center justify-between q-mt-xs">
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="primary"
                icon="add"
                label="Add condition"
                @click="addCondition(rule.key)"
              />
              <q-btn
                flat
                dense
                no-caps
                size="sm"
                color="negative"
                icon="delete_outline"
                label="Clear"
                @click="removeRule(rule.key)"
              />
            </div>
          </div>
        </PropertyRow>
      </div>
    </template>
  </PropertySection>
</template>

<style scoped>
.logic-rule + .logic-rule {
  margin-top: 8px;
}

.logic-group {
  border-left: 2px solid #e0e0e0;
  padding-left: 10px;
}

.logic-condition {
  background: rgba(0, 0, 0, 0.015);
  border-radius: 4px;
  padding: 6px;
}
</style>
