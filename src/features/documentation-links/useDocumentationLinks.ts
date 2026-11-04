import { onMounted, ref } from 'vue';
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
    data?: {
        localhost?: LocalhostConfig;
    };
}

export function useDocumentationLinks() {
    const links = ref<DocumentationLink[]>([]);

    onMounted(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: Array<{ url?: string }>) => {
            const currentUrl = tabs[0]?.url;
            if (!currentUrl) return;

            if (isLocalhost(currentUrl)) {
                chrome.runtime.sendMessage(
                    { action: 'getAppConfig' },
                    (response: AppConfigResponse) => {
                        links.value = buildLinks(
                            currentUrl,
                            response?.success ? response.data?.localhost : undefined,
                        );
                    },
                );
                return;
            }

            links.value = buildLinks(currentUrl);
        });
    });

    return { links };
}

function buildLinks(currentUrl: string, localhostConfig?: LocalhostConfig): DocumentationLink[] {
    const links: DocumentationLink[] = [];
    const isUmbraco = currentUrl.includes('.umbraco.');
    const isBrief = currentUrl.includes('.brief.');
    const onDocPortal = isOnDocumentationPortal(currentUrl);

    const appDocLinks = buildApplicationDocumentationLinks(currentUrl, localhostConfig);
    
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

    if (links.length === 0) {
        const swaggerLink = buildSwaggerLink(currentUrl, localhostConfig);
        if (swaggerLink.url) {
            links.push({
                id: 'swagger-docs',
                title: 'Swagger Documentation',
                url: swaggerLink.url,
            });
        }
    }

    const applicationHost = localhostConfig?.applicationHost?.trim();
    if (applicationHost) {
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
                links.unshift({
                    id: 'application',
                    title: 'Configured Environment',
                    url: applicationUrl.href,
                });
            } else {
                console.error('Invalid localhost applicationHost in appConfig.json.');
            }
        } catch (error) {
            console.error('Invalid localhost applicationHost in appConfig.json:', error);
        }
    }

    return links;
}
