import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    server: {
        port: 9001,
    },
    build: {
        rollupOptions: {
            input: {
                popup: path.resolve(__dirname, 'popup.html'),
                background: path.resolve(__dirname, 'src/extension/background.js'),
                content: path.resolve(__dirname, 'src/extension/content.js'),
            },
            output: {
                entryFileNames: '[name].js',
                chunkFileNames: '[name].js',
                assetFileNames: '[name].[ext]',
            },
        },
        outDir: 'dist-extension',
        emptyOutDir: true,
    },
});
