<script setup lang="ts">
    import { computed } from 'vue';
    import ErrorIcon from 'bootstrap-icons/icons/exclamation-octagon-fill.svg?raw';
    import WarningIcon from 'bootstrap-icons/icons/exclamation-triangle-fill.svg?raw';
    import InfoIcon from 'bootstrap-icons/icons/info-circle-fill.svg?raw';

    const props = withDefaults(defineProps<{
        variant?: 'error' | 'warning' | 'info';
        message: string;
    }>(), {
        variant: 'error',
    });

    const ICONS = { error: ErrorIcon, warning: WarningIcon, info: InfoIcon };

    const icon = computed(() => ICONS[props.variant]);
    const role = computed(() => (props.variant === 'error' ? 'alert' : 'status'));
</script>

<template>
    <div v-if="message" class="alert" :class="variant" :role="role">
        <span class="alert-icon" aria-hidden="true" v-html="icon" />
        <p class="message">{{ message }}</p>
    </div>
</template>

<style scoped>
    .alert {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px 12px;
        border-radius: var(--radius-button);
        font-size: 12px;
        line-height: 1.4;
        word-break: break-word;
    }

    .alert-icon {
        display: grid;
        flex-shrink: 0;
        place-items: center;
        margin-top: 1px;
    }

    .alert-icon :deep(svg) {
        width: 14px;
        height: 14px;
    }

    .message {
        flex: 1;
        color: inherit;
        font-size: inherit;
    }

    .alert.error {
        color: #ef4444;
        background: rgb(220 38 38 / 15%);
        border: 1px solid rgb(220 38 38 / 30%);
    }

    .alert.warning {
        color: #d97706;
        background: rgb(217 119 6 / 15%);
        border: 1px solid rgb(217 119 6 / 30%);
    }

    .alert.info {
        color: #60a5fa;
        background: rgb(37 99 235 / 15%);
        border: 1px solid rgb(37 99 235 / 30%);
    }
</style>
