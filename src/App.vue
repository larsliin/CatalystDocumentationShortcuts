<script setup lang="ts">
    import BaseButton from './components/bascomponents/BaseButton.vue';
    import BookIcon from 'bootstrap-icons/icons/book-half.svg?raw';
    import ExternalLinkIcon from 'bootstrap-icons/icons/box-arrow-up-right.svg?raw';
    import CopyIcon from 'bootstrap-icons/icons/copy.svg?raw';
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
    <div id="app" class="popup-shell">
        <header class="popup-header">
            <div class="header-mark">
                <span class="header-icon" aria-hidden="true" v-html="BookIcon" />
            </div>
            <div class="header-copy">
                <p class="eyebrow">QUICK ACCESS</p>
                <h1>Environment resources</h1>
            </div>
        </header>

        <section class="links-container" aria-label="Documentation links">
            <article v-for="link in links" :key="link.id" class="link-item">
                <div class="link-mark" aria-hidden="true">
                    <span class="link-icon" v-html="BookIcon" />
                </div>
                <div class="link-info">
                    <h2>{{ link.title }}</h2>
                    <p v-if="link.url" class="link-url">{{ link.url }}</p>
                </div>
                <div v-if="link.url" class="link-actions">
                    <BaseButton
                        variant="primary"
                        class="open-button"
                        :aria-label="`Open ${link.title} documentation`"
                        :title="`Open ${link.title} documentation`"
                        @click="openDocumentation(link.url)"
                    >
                        <span class="open-icon" aria-hidden="true" v-html="ExternalLinkIcon" />
                    </BaseButton>
                    <button
                        @click="copyToClipboard(link.url)"
                        class="copy-button"
                        :title="`Copy ${link.title} link`"
                        aria-label="Copy link"
                    >
                        <span class="copy-icon" aria-hidden="true" v-html="CopyIcon" />
                    </button>
                </div>
            </article>
        </section>
    </div>
</template>

<style scoped>
    .popup-shell {
        width: 100%;
        height: auto;
        max-height: 600px;
        display: flex;
        flex-direction: column;
        background: var(--color-bg);
    }

    .popup-header {
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 18px 20px 0;
        padding: 0 0 16px;
        border-bottom: 1px solid var(--color-border);
    }

    .header-mark {
        display: grid;
        place-items: center;
        width: 50px;
        height: 50px;
        flex: 0 0 auto;
        color: var(--color-accent);
        background: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: 13px;
    }

    .header-icon {
        display: grid;
        place-items: center;
    }

    .header-icon :deep(svg) {
        width: 26px;
        height: 26px;
    }

    .header-copy {
        min-width: 0;
    }

    .eyebrow {
        margin-bottom: 3px;
        color: var(--color-accent);
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
    }

    .popup-header h1 {
        color: var(--color-text);
        font-size: 18px;
        font-weight: 650;
        letter-spacing: -0.02em;
        line-height: 1.25;
    }

    .links-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-height: 480px;
        padding: 14px 20px 20px;
        overflow-y: auto;
    }

    .link-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background-color: var(--color-panel);
        border: 1px solid var(--color-border);
        border-radius: 10px;
        box-shadow: 0 2px 8px rgb(0 0 0 / 8%);
        transition: background-color 0.16s, border-color 0.16s, transform 0.16s;
    }

    .link-item:hover {
        background-color: var(--color-panel-raised);
        border-color: var(--color-focus);
        transform: translateY(-1px);
    }

    .link-mark {
        display: grid;
        place-items: center;
        width: 38px;
        height: 38px;
        flex: 0 0 auto;
        color: var(--color-accent);
        background: var(--color-bg);
        border: 1px solid var(--color-border);
        border-radius: 10px;
    }

    .link-icon {
        display: grid;
        place-items: center;
    }

    .link-icon :deep(svg) {
        width: 20px;
        height: 20px;
    }

    .link-info {
        flex: 1;
        min-width: 0;
    }

    .link-item h2 {
        margin: 0;
        color: var(--color-text);
        font-size: 14px;
        font-weight: 600;
        line-height: 1.35;
    }

    .link-url {
        margin-top: 3px;
        color: var(--color-text-muted);
        font-size: 11px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .link-actions {
        display: flex;
        gap: 7px;
        align-items: center;
        flex-shrink: 0;
    }

    .open-button {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        flex: 0 0 auto;
        padding: 0;
    }

    .open-icon,
    .copy-icon {
        display: grid;
        place-items: center;
    }

    .open-icon :deep(svg),
    .copy-icon :deep(svg) {
        width: 16px;
        height: 16px;
    }

    .copy-button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        padding: 0;
        border: 1px solid var(--color-button-secondary-border);
        background-color: var(--color-button-secondary);
        color: var(--color-text);
        border-radius: var(--radius-button);
        cursor: pointer;
        transition: background-color 0.2s, border-color 0.2s;
    }

    .copy-button:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }

    .copy-button:hover {
        background-color: var(--color-button-secondary-hover);
        border-color: var(--color-button-secondary-border-hover);
    }

    .copy-button:active {
        background-color: var(--color-active);
    }

</style>
