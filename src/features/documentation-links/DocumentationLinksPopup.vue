<script setup lang="ts">
    import { computed, ref } from 'vue';
    import BookIcon from 'bootstrap-icons/icons/book-half.svg?raw';
    import BaseAlert from '@/components/base/BaseAlert.vue';
    import BaseLoadingBar from '@/components/base/BaseLoadingBar.vue';
    import DocumentationLinkItem from './components/DocumentationLinkItem.vue';
    import { useDocumentationLinks } from './useDocumentationLinks';

    const { links, loading, ready, error, warning, notice } = useDocumentationLinks();
    const copyError = ref('');
    const copiedUrl = ref('');
    let copyFeedbackTimeout: ReturnType<typeof setTimeout> | undefined;

    const isEmpty = computed(() => ready.value && !error.value && !notice.value && links.value.length === 0);

    async function copyToClipboard(url: string) {
        copyError.value = '';
        copiedUrl.value = '';
        clearTimeout(copyFeedbackTimeout);
        try {
            await navigator.clipboard.writeText(url);
            copiedUrl.value = url;
            copyFeedbackTimeout = setTimeout(() => {
                copiedUrl.value = '';
            }, 1200);
        } catch (err) {
            console.error('Failed to copy:', err);
            copyError.value = 'Could not copy the link to the clipboard.';
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
            <BaseLoadingBar v-if="loading" class="header-loading" label="Reading appConfig.json" />
        </header>

        <section
            class="links-container"
            :class="{ 'is-loading': loading }"
            aria-label="Documentation links"
            :aria-busy="!ready"
        >
            <template v-if="ready && !loading">
                <BaseAlert :message="error" variant="error" />
                <BaseAlert :message="copyError" variant="error" />
                <BaseAlert :message="warning" variant="warning" />
                <BaseAlert :message="notice" variant="info" />
                <BaseAlert
                    v-if="isEmpty"
                    message="No documentation links are available for this page."
                    variant="info"
                />
                <DocumentationLinkItem
                    v-for="link in links"
                    :key="link.id"
                    :link="link"
                    :copied="copiedUrl === link.url"
                    @open="openDocumentation"
                    @copy="copyToClipboard"
                />
            </template>
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
        position: relative;
        display: flex;
        align-items: center;
        gap: 14px;
        margin: 18px 20px 0;
        padding: 0 0 16px;
        border-bottom: 1px solid var(--color-border);
    }

    .popup-header .header-loading {
        position: absolute;
        right: 0;
        bottom: -1px;
        left: 0;
        width: auto;
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

    .links-container.is-loading {
        padding: 0 20px 20px;
    }
</style>
