import { onMounted, onUnmounted } from 'vue';

export function useTheme() {
    let mediaQueryList: MediaQueryList | null = null;
    // eslint-disable-next-line no-unused-vars
    let handleChange: ((event: MediaQueryListEvent) => void) | null = null;

    function applyTheme(isDark: boolean) {
        const root = document.documentElement;
        if (isDark) {
            root.removeAttribute('data-theme');
        } else {
            root.setAttribute('data-theme', 'light');
        }
    }

    onMounted(() => {
        if (!window.matchMedia) return;

        const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
        applyTheme(darkPreference.matches);

        handleChange = (event) => applyTheme(event.matches);
        mediaQueryList = darkPreference;
        mediaQueryList.addEventListener('change', handleChange);
    });

    onUnmounted(() => {
        if (mediaQueryList && handleChange) {
            mediaQueryList.removeEventListener('change', handleChange);
        }
    });
}
