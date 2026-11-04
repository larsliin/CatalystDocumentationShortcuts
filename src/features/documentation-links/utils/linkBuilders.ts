import { SETTINGS } from '@/config/settings';

interface LinkBuilderResult {
    url: string;
}

interface LocalhostConfig {
    tenantHost?: string;
}

function getConfiguredTenantHost(localhostConfig?: LocalhostConfig): string {
    const host = localhostConfig?.tenantHost?.trim();
    if (!host) return '';

    try {
        const url = new URL(`https://${host}`);
        if (
            !url.hostname
            || url.username
            || url.password
            || url.pathname !== '/'
            || url.search
            || url.hash
            || url.host.toLowerCase() !== host.toLowerCase()
        ) {
            return '';
        }

        return url.host;
    } catch {
        return '';
    }
}

function buildHttpsUrl(hostname: string, pathname: string): string {
    try {
        return new URL(pathname, `https://${hostname}`).href;
    } catch {
        return '';
    }
}

export function isLocalhost(currentUrl: string): boolean {
    try {
        const url = new URL(currentUrl);
        return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    } catch {
        return false;
    }
}

function getDocumentationHostname(currentUrl: string, localhostConfig?: LocalhostConfig): string {
    const configured = getConfiguredTenantHost(localhostConfig);
    if (configured) return configured;

    try {
        const url = new URL(currentUrl);
        const labels = url.hostname.split('.');
        const briefIndex = labels.indexOf('brief');
        if (briefIndex > 0 && briefIndex < labels.length - 1) {
            labels[briefIndex] = 'umbraco';
            return labels.join('.');
        }
    } catch {
        // fallthrough
    }

    return '';
}

export function buildUmbracoLink(currentUrl: string, localhostConfig?: LocalhostConfig): LinkBuilderResult {
    const hostname = getDocumentationHostname(currentUrl, localhostConfig);
    return { url: hostname ? buildHttpsUrl(hostname, '/umbraco') : '' };
}

export function buildSwaggerLink(currentUrl: string, localhostConfig?: LocalhostConfig): LinkBuilderResult {
    const hostname = getDocumentationHostname(currentUrl, localhostConfig);
    return { url: hostname ? buildHttpsUrl(hostname, '/swagger/') : '' };
}

function detectApplicationFromUrl(url: string): string | null {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        if (hostname.includes('oes.wppes-map-stage.com')) {
            const pathname = urlObj.pathname.replace(/^\//, '').split('/')[0];
            if (pathname && SETTINGS.APP_NAMES.includes(pathname)) {
                return pathname;
            }
        }

        for (const app of SETTINGS.APP_NAMES) {
            if (hostname.includes(app)) {
                return app;
            }
        }

        return null;
    } catch {
        return null;
    }
}

export function isOnDocumentationPortal(currentUrl: string): boolean {
    try {
        const urlObj = new URL(currentUrl);
        const hostname = urlObj.hostname;
        const pathname = urlObj.pathname.replace(/^\//, '').split('/')[0];
        
        return hostname.includes('oes.wppes-map-stage.com') && !!pathname && SETTINGS.APP_NAMES.includes(pathname);
    } catch {
        return false;
    }
}

export function buildApplicationDocumentationLinks(
    currentUrl: string,
    localhostConfig?: LocalhostConfig,
): LinkBuilderResult[] {
    const detectedApp = detectApplicationFromUrl(currentUrl);
    if (!detectedApp) return [];

    if (detectedApp === 'umbraco') {
        const briefLink = buildBriefApplicationLink(currentUrl);
        return briefLink.url ? [briefLink] : [];
    }

    if (isOnDocumentationPortal(currentUrl)) {
        const appLink = buildAppLink(detectedApp);
        return appLink.url ? [appLink] : [];
    }

    const links: LinkBuilderResult[] = [];

    if (SETTINGS.APPS_WITH_UMBRACO.includes(detectedApp)) {
        links.push(buildUmbracoLink(currentUrl, localhostConfig));
    }

    if (detectedApp === 'brief') {
        links.push(buildSwaggerLink(currentUrl, localhostConfig));
    } else {
        links.push(buildScalarLink(detectedApp));
    }

    return links;
}

function buildScalarLink(application: string): LinkBuilderResult {
    return { url: `${SETTINGS.API_DOCS_BASE_URL}/${application}/scalar` };
}

function buildAppLink(application: string): LinkBuilderResult {
    return { url: `https://ikea.${application}.wppes-map-stage.com/` };
}

function buildBriefApplicationLink(currentUrl: string): LinkBuilderResult {
    try {
        const hostname = new URL(currentUrl).hostname.replace('.umbraco.', '.brief.');
        return { url: `https://${hostname}/` };
    } catch {
        return { url: '' };
    }
}
