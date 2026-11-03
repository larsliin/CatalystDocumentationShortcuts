<!-- eslint-disable vue/multi-word-component-names -->
<!-- eslint-disable-next-line vue/multi-word-component-names -->
<script setup lang="ts">
    import BaseButton from './components/bascomponents/BaseButton.vue';
    import ClipboardIcon from 'bootstrap-icons/icons/clipboard.svg?raw';
    import { useDocumentationLinks } from '@/composables/useDocumentationLinks';

    const { links } = useDocumentationLinks();

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
                    <BaseButton @click="openDocumentation(link.url)" class="action-button">
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
                            v-html="ClipboardIcon"
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

    .action-button {
        white-space: nowrap;
        font-size: 12px;
        padding: 6px 12px;
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
