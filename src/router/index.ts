import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/forms',
    name: 'forms',
    component: () => import('@/views/FormsListView.vue')
  },
  {
    path: '/builder/:id',
    name: 'builder',
    component: () => import('@/views/BuilderView.vue')
  },
  {
    path: '/preview/:id',
    name: 'preview',
    component: () => import('@/views/Preview.vue')
  },
  {
    path: '/forms/:id/submissions',
    name: 'submissions',
    component: () => import('@/views/SubmissionsView.vue')
  },
  {
    path: '/f/:slug',
    name: 'public-form',
    component: () => import('@/views/PublicFormView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(
/* import.meta.env.BASE_URL */
),
  routes
})

export default router