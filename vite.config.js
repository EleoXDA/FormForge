import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import { quasar, transformAssetUrls } from "@quasar/vite-plugin";
const quasarVariables = fileURLToPath(new URL('./src/styles/quasar-variables.scss', import.meta.url));
export default defineConfig({
    plugins: [
        vue({
            template: { transformAssetUrls },
        }),
        quasar({
            sassVariables: quasarVariables
        }),
    ],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
        },
    },
});
