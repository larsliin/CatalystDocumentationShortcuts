<script setup lang="ts">
    withDefaults(defineProps<{
        label?: string;
    }>(), {
        label: 'Loading',
    });
</script>

<template>
    <div class="loading-bar" role="progressbar" :aria-label="label">
        <span class="loading-bar-indicator" />
    </div>
</template>

<style scoped>
    .loading-bar {
        position: relative;
        width: 100%;
        height: 3px;
        overflow: hidden;
        background: var(--color-border);
        border-radius: 999px;
    }

    .loading-bar-indicator {
        position: absolute;
        inset: 0 auto 0 0;
        width: 40%;
        background: var(--color-accent);
        border-radius: inherit;
        animation: loading-bar-cycle 1.2s ease-in-out infinite;
    }

    @keyframes loading-bar-cycle {
        from {
            transform: translateX(-100%);
        }

        to {
            transform: translateX(250%);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .loading-bar-indicator {
            animation-duration: 3s;
        }
    }
</style>
