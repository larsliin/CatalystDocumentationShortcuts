<script setup lang="ts">
    import BookIcon from 'bootstrap-icons/icons/book-half.svg?raw';
    import CopyIcon from 'bootstrap-icons/icons/copy.svg?raw';
    import ExternalLinkIcon from 'bootstrap-icons/icons/box-arrow-up-right.svg?raw';
    import BaseButton from '@/components/base/BaseButton.vue';
    import type { DocumentationLink } from '../useDocumentationLinks';

    defineProps<{
        link: DocumentationLink;
    }>();

    const emit = defineEmits<{
        open: [url: string];
        copy: [url: string];
    }>();
</script>

<template>
    <article class="link-item">
        <div class="link-mark" aria-hidden="true">
            <span class="link-icon" v-html="BookIcon" />
        </div>
        <div class="link-info">
            <h2>{{ link.title }}</h2>
            <p v-if="link.url" class="link-url">{{ link.url }}</p>
        </div>
        <div v-if="link.url" class="link-actions">
            <BaseButton
                class="open-button"
                :aria-label="`Open ${link.title} documentation`"
                :title="`Open ${link.title} documentation`"
                @click="emit('open', link.url)"
            >
                <span class="open-icon" aria-hidden="true" v-html="ExternalLinkIcon" />
            </BaseButton>
            <button
                class="copy-button"
                type="button"
                :title="`Copy ${link.title} link`"
                :aria-label="`Copy ${link.title} link`"
                @click="emit('copy', link.url)"
            >
                <span class="copy-icon" aria-hidden="true" v-html="CopyIcon" />
            </button>
        </div>
    </article>
</template>

<style scoped>
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
        flex: 0 0 auto;
        place-items: center;
        width: 38px;
        height: 38px;
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
        flex-shrink: 0;
        align-items: center;
        gap: 7px;
    }

    .open-button,
    .copy-button {
        display: grid;
        flex: 0 0 auto;
        place-items: center;
        width: 34px;
        height: 34px;
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
        color: var(--color-text);
        background-color: var(--color-button-secondary);
        border: 1px solid var(--color-button-secondary-border);
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
