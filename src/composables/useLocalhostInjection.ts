import { ref, computed } from 'vue';
import { buildLocalhostObject } from '../utils/domain';

export function useLocalhostInjection() {
    const injectLocalhost = ref(false);
    const injectLocalhostDisabled = ref(false);
    const LOCALHOST_OBJECT = ref<any>(null);

    const isCheckboxDisabled = computed(() => {
        return injectLocalhostDisabled.value;
    });

    function setLocalhostObject(tabUrl: string): { success: boolean; error?: string; isWarning?: boolean } {
        try {
            const result = buildLocalhostObject(tabUrl);
            if (!result) {
                return {
                    success: false,
                    error: 'Could not extract domain information from this page.',
                };
            }

            // Set the localhost object (always set it, even with unknown app)
            LOCALHOST_OBJECT.value = result.data;

            // If unknown app detected, return success: true but flag as warning
            if (result.unknownApp) {
                return {
                    success: false,
                    isWarning: true,
                    error: `Unknown application: "${result.unknownApp}". Please add it to the app names list.`,
                };
            }

            return { success: true };
        } catch (_err) { // eslint-disable-line no-unused-vars
            return {
                success: false,
                error: 'Could not set up localhost configuration for this page.',
            };
        }
    }

    return {
        injectLocalhost,
        injectLocalhostDisabled,
        LOCALHOST_OBJECT,
        isCheckboxDisabled,
        setLocalhostObject,
    };
}
