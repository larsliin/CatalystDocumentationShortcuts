<script setup lang="ts">
    import { useTheme } from './composables/useTheme';
    import DocumentationLinksPopup from './features/documentation-links/DocumentationLinksPopup.vue';

    useTheme();
</script>

<template>
    <DocumentationLinksPopup />
</template>
