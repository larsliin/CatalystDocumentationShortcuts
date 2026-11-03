<template>
    <button type="button" class="primary-button">
        <slot />
    </button>
</template>

<style scoped>
    .primary-button {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        background: var(--color-accent);
        border: 1px solid var(--color-accent);
        border-radius: var(--radius-button);
        cursor: pointer;
    }

    .primary-button:hover:not(:disabled) {
        background: #15a86d;
        border-color: #15a86d;
    }

    .primary-button:active:not(:disabled) {
        background: #0f7d54;
        border-color: #0f7d54;
    }

    .primary-button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .primary-button:focus-visible {
        outline: 2px solid var(--color-focus);
        outline-offset: 2px;
    }
</style>
