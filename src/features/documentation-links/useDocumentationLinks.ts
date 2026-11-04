import { onMounted, ref } from 'vue';
import { APP } from '@/config/settings';
import {
    buildSwaggerLink,
    buildUmbracoLink,
    isLocalhost,
    buildApplicationDocumentationLinks,
    isOnDocumentationPortal,
} from './utils/linkBuilders';

export interface DocumentationLink {
    id: string;
    title: string;
    url: string;
}

interface LocalhostConfig {
    tenantHost?: string;
    applicationHost?: string;
}

interface AppConfigResponse {
    success?: boolean;
    notFound?: boolean;
    error?: string;
    data?: {
        localhost?: LocalhostConfig;
    };
}

const APP_CONFIG_ERROR = 'Failed to read appConfig.json. Try reloading the page.';

export function useDocumentationLinks() {
    const links = ref<DocumentationLink[]>([]);
    // Only true while waiting for appConfig.json on localhost; other hosts resolve instantly.
    const loading = ref(false);
    const ready = ref(false);
    const error = ref('');
    const warning = ref('');
    const notice = ref('');

    async function loadLinks() {
        ready.value = false;
        error.value = '';
        warning.value = '';
        notice.value = '';

        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            const currentUrl = tab?.url || tab?.pendingUrl;
            if (!currentUrl) {
                error.value = 'Could not read the address of the current page. Try reloading the page.';
                return;
            }

            // applicationHost/tenantHost only exist in appConfig.json when running on localhost.
            let localhostConfig: LocalhostConfig | undefined;
            if (isLocalhost(currentUrl)) {
                loading.value = true;
                const response = await requestAppConfig();
                if (response.success) {
                    localhostConfig = response.data?.localhost;
                } else if (response.notFound) {
                    notice.value = response.error || APP_CONFIG_ERROR;
                } else {
                    warning.value = response.error || APP_CONFIG_ERROR;
                }
            }

            links.value = buildLinks(currentUrl, localhostConfig);
        } catch (err) {
            console.error('Failed to generate documentation links:', err);
            error.value = 'Failed to generate documentation links. Try reloading the page.';
        } finally {
            loading.value = false;
            ready.value = true;
        }
    }

    onMounted(loadLinks);

    return { links, loading, ready, error, warning, notice };
}

function requestAppConfig(): Promise<AppConfigResponse> {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'getAppConfig' }, (response?: AppConfigResponse) => {
            if (chrome.runtime.lastError) {
                resolve({ success: false, error: chrome.runtime.lastError.message });
                return;
            }
            resolve(response ?? { success: false });
        });
    });
}

function buildLinks(currentUrl: string, localhostConfig?: LocalhostConfig): DocumentationLink[] {
    const links: DocumentationLink[] = [];
    const applicationUrl = parseApplicationHost(localhostConfig);
    const isConfiguredBrief = !!applicationUrl && applicationUrl.hostname.split('.').includes(APP.BRIEF);

    // On localhost the page URL has no app name, so detect the app from applicationHost instead.
    // Brief keeps the localhost URL so it falls back to the tenantHost Swagger link below.
    const appSourceUrl = isLocalhost(currentUrl) && applicationUrl && !isConfiguredBrief
        ? applicationUrl.href
        : currentUrl;

    const isUmbraco = appSourceUrl.includes(`.${APP.UMBRACO}.`);
    const isBrief = appSourceUrl.includes(`.${APP.BRIEF}.`);
    const onDocPortal = isOnDocumentationPortal(appSourceUrl);

    const appDocLinks = buildApplicationDocumentationLinks(appSourceUrl, localhostConfig);

    appDocLinks.forEach((linkResult, index) => {
        if (linkResult.url) {
            let title = 'Documentation';

            if (isUmbraco) {
                title = 'Brief';
            } else if (isBrief) {
                title = index === 0 ? 'Umbraco' : 'Swagger Documentation';
            } else if (onDocPortal) {
                title = 'Application';
            } else {
                title = 'API Documentation';
            }

            links.push({
                id: `doc-link-${index}`,
                title,
                url: linkResult.url,
            });
        }
    });

    // Only Brief has Swagger docs; on localhost the app is known only through applicationHost.
    if (links.length === 0 && isConfiguredBrief) {
        const swaggerLink = buildSwaggerLink(currentUrl, localhostConfig);
        if (swaggerLink.url) {
            links.push({
                id: 'swagger-docs',
                title: 'Swagger Documentation',
                url: swaggerLink.url,
            });
        }
    }

    if (applicationUrl) {
        const configuredLinks: DocumentationLink[] = [{
            id: 'application',
            title: 'Configured Environment',
            url: applicationUrl.href,
        }];

        // For Brief, swaps the "brief" host label to "umbraco", as on deployed Brief pages.
        const umbracoLink = isConfiguredBrief ? buildUmbracoLink(applicationUrl.href) : { url: '' };
        if (umbracoLink.url) {
            configuredLinks.push({
                id: 'configured-umbraco',
                title: 'Umbraco',
                url: umbracoLink.url,
            });
        }

        links.unshift(...configuredLinks);
    }

    return links;
}

function parseApplicationHost(localhostConfig?: LocalhostConfig): URL | null {
    const applicationHost = localhostConfig?.applicationHost?.trim();
    if (!applicationHost) return null;

    try {
        const applicationUrl = new URL(`https://${applicationHost}`);
        if (
            applicationUrl.hostname
            && !applicationUrl.username
            && !applicationUrl.password
            && applicationUrl.pathname === '/'
            && !applicationUrl.search
            && !applicationUrl.hash
        ) {
            return applicationUrl;
        }
        console.error('Invalid localhost applicationHost in appConfig.json.');
    } catch (error) {
        console.error('Invalid localhost applicationHost in appConfig.json:', error);
    }
    return null;
}
