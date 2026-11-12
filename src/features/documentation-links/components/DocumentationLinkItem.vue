<script setup lang="ts">
    import BookIcon from 'bootstrap-icons/icons/book-half.svg?raw';
    import CheckIcon from 'bootstrap-icons/icons/check.svg?raw';
    import CopyIcon from 'bootstrap-icons/icons/copy.svg?raw';
    import ExternalLinkIcon from 'bootstrap-icons/icons/box-arrow-up-right.svg?raw';
    import { BaseIconButton, BaseListItem } from 'chrome-extension-component-library';
    import type { DocumentationLink } from '../useDocumentationLinks';

    defineProps<{
        link: DocumentationLink;
        copied: boolean;
    }>();

    const emit = defineEmits<{
        open: [url: string];
        copy: [url: string];
    }>();
</script>

<template>
    <BaseListItem>
        <template #icon>
            <span class="link-icon" v-html="BookIcon" />
        </template>
        <div class="link-info">
            <h2 class="link-title" :title="link.title">{{ link.title }}</h2>
            <p v-if="link.url" class="link-tagline" :title="link.url">
                {{ link.url }}
            </p>
        </div>
        <div v-if="link.url" class="link-actions">
            <BaseIconButton
                class="open-button"
                variant="primary"
                :label="`Open ${link.title} documentation`"
                @click="emit('open', link.url)"
            >
                <span class="open-icon" aria-hidden="true" v-html="ExternalLinkIcon" />
            </BaseIconButton>
            <BaseIconButton
                class="copy-button"
                variant="secondary"
                :label="copied ? 'Copied' : `Copy ${link.title} link`"
                @click="emit('copy', link.url)"
            >
                <span
                    class="copy-icon"
                    :class="{ 'copy-icon-copied': copied }"
                    aria-hidden="true"
                    v-html="copied ? CheckIcon : CopyIcon"
                />
            </BaseIconButton>
        </div>
    </BaseListItem>
</template>

<style scoped>
    .link-icon {
        display: grid;
        place-items: center;
    }

    .link-icon :deep(svg) {
        width: 20px;
        height: 20px;
    }

    .link-info {
        flex: 1 1 140px;
        min-width: 0;
    }

    .link-title {
        overflow: hidden;
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 14px;
        font-weight: 600;
        line-height: 1.35;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .link-tagline {
        overflow: hidden;
        margin: 3px 0 0;
        font-size: 11px;
        line-height: var(--line-height-base);
        color: var(--color-text-muted);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    .link-actions {
        display: flex;
        flex-wrap: nowrap;
        flex: 0 0 auto;
        align-items: center;
        gap: 7px;
        max-width: 100%;
        margin-left: auto;
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

    .copy-icon-copied :deep(svg) {
        width: 28px;
        height: 28px;
    }
</style>
