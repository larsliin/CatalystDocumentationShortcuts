<script setup lang="ts">
    import BookIcon from 'bootstrap-icons/icons/book-half.svg?raw';
    import DocumentationLinkItem from './components/DocumentationLinkItem.vue';
    import { useDocumentationLinks } from './useDocumentationLinks';

    const { links } = useDocumentationLinks();

    async function copyToClipboard(url: string) {
        try {
            await navigator.clipboard.writeText(url);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    }

    function openDocumentation(url: string) {
        chrome.tabs.create({ url });
    }
</script>

<template>
    <div class="popup-shell">
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
            <DocumentationLinkItem
                v-for="link in links"
                :key="link.id"
                :link="link"
                @open="openDocumentation"
                @copy="copyToClipboard"
            />
        </section>
    </div>
</template>

<style scoped>
    .popup-shell {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: auto;
        max-height: 600px;
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
        flex: 0 0 auto;
        place-items: center;
        width: 50px;
        height: 50px;
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
</style>
