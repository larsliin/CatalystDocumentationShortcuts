<script setup lang="ts">
    import { ref } from 'vue';
    import BaseButton from './components/bascomponents/BaseButton.vue';
    import CopyIcon from 'bootstrap-icons/icons/copy.svg?raw';

    interface DocumentationLink {
        id: string
        title: string
        url: string
    }

    const links = ref<DocumentationLink[]>([
        {
            id: 'vue-docs',
            title: 'Vue 3 Documentation',
            url: 'https://vuejs.org',
        },
        {
            id: 'catalyst-docs',
            title: 'Catalyst Documentation',
            url: 'https://docs.catalyst.example.com',
        },
    ]);

    const copyToClipboard = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const openDocumentation = (url: string) => {
        chrome.tabs.create({ url });
    };
</script>

<template>
    <div id="app">
        <div class="links-container">
            <div v-for="link in links" :key="link.id" class="link-item">
                <div class="link-info">
                    <h2>{{ link.title }}</h2>
                    <p class="link-url">{{ link.url }}</p>
                </div>
                <div class="link-actions">
                    <BaseButton variant="primary" @click="openDocumentation(link.url)">
                        Open Documentation
                    </BaseButton>
                    <button
                        @click="copyToClipboard(link.url)"
                        class="copy-button"
                        :title="`Copy ${link.title} link`"
                        aria-label="Copy link"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            class="copy-icon"
                            v-html="CopyIcon"
                        />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
    #app {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .links-container {
        flex: 1;
        display: flex;
        flex-direction: column;
        padding: 12px;
        gap: 12px;
        overflow-y: auto;
    }

    .link-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px;
        background-color: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-button);
        transition: background-color 0.2s;
    }

    .link-item:hover {
        background-color: var(--color-panel-raised);
    }

    .link-info {
        flex: 1;
        min-width: 0;
    }

    .link-item h2 {
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 500;
    }

    .link-url {
        font-size: 12px;
        color: var(--color-text-muted);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .link-actions {
        display: flex;
        gap: 6px;
        align-items: center;
        flex-shrink: 0;
    }

    .copy-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        padding: 0;
        border: 1px solid var(--color-button-secondary-border);
        background-color: var(--color-button-secondary);
        color: var(--color-text);
        border-radius: var(--radius-button);
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
    }

    .copy-button:hover {
        background-color: var(--color-button-secondary-hover);
        border-color: var(--color-button-secondary-border-hover);
    }

    .copy-button:active {
        background-color: var(--color-active);
    }

    .copy-icon {
        flex-shrink: 0;
    }
</style>
