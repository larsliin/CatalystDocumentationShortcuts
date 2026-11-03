/**
 * useDocumentationLinks composable
 * Handles fetching the current tab URL and building documentation links
 * When on localhost, loads appConfig.json to get the tenantHost
 */

import { ref, onMounted } from 'vue';
import type { Ref } from 'vue';
import { buildUmbracoLink, buildSwaggerLink, isLocalhost } from '@/utils/linkBuilders';

export interface DocumentationLink {
    id: string;
    title: string;
    url: string;
}

export interface UseDocumentationLinksReturn {
    links: Ref<DocumentationLink[]>;
    isLoading: Ref<boolean>;
    error: Ref<string>;
}

/**
 * Composable to manage documentation links
 * Automatically fetches the active tab URL and builds dynamic documentation links
 * For localhost, attempts to load appConfig.json and use localhost.tenantHost
 */
export function useDocumentationLinks(): UseDocumentationLinksReturn {
    const links = ref<DocumentationLink[]>([]);
    const isLoading = ref(true);
    const error = ref('');

    onMounted(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: any[]) => {
            if (tabs[0]?.url) {
                const currentUrl = tabs[0].url;

                // If on localhost, fetch appConfig to get tenantHost
                if (isLocalhost(currentUrl)) {
                    chrome.runtime.sendMessage({ action: 'getAppConfig' }, (response: any) => {
                        if (response?.success && response.data?.localhost?.tenantHost) {
                            const localhostConfig = response.data.localhost;
                            buildLinksFromConfig(currentUrl, localhostConfig);
                        } else {
                            // Fallback to URL-based approach
                            buildLinksFromUrl(currentUrl);
                        }
                        isLoading.value = false;
                    });
                } else {
                    buildLinksFromUrl(currentUrl);
                    isLoading.value = false;
                }
            } else {
                isLoading.value = false;
            }
        });
    });

    function buildLinksFromUrl(currentUrl: string) {
        const umbracoResult = buildUmbracoLink(currentUrl);
        const swaggerResult = buildSwaggerLink(currentUrl);

        links.value = [
            {
                id: 'umbraco-docs',
                title: 'Umbraco',
                url: umbracoResult.url,
            },
            {
                id: 'swagger-docs',
                title: 'Swagger Documentation',
                url: swaggerResult.url,
            },
        ];
    }

    function buildLinksFromConfig(currentUrl: string, localhostConfig: any) {
        const umbracoResult = buildUmbracoLink(currentUrl, localhostConfig);
        const swaggerResult = buildSwaggerLink(currentUrl, localhostConfig);

        links.value = [
            {
                id: 'umbraco-docs',
                title: 'Umbraco',
                url: umbracoResult.url,
            },
            {
                id: 'swagger-docs',
                title: 'Swagger Documentation',
                url: swaggerResult.url,
            },
        ];
    }

    return {
        links,
        isLoading,
        error,
    };
}

