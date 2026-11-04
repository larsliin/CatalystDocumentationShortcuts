import { APP, SETTINGS } from '@/config/settings';

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
        return SETTINGS.LOCALHOST_HOSTNAMES.includes(url.hostname);
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
        const briefIndex = labels.indexOf(APP.BRIEF);
        if (briefIndex > 0 && briefIndex < labels.length - 1) {
            labels[briefIndex] = APP.UMBRACO;
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

        if (hostname.includes(SETTINGS.DOCUMENTATION_PORTAL.HOST)) {
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

        return hostname.includes(SETTINGS.DOCUMENTATION_PORTAL.HOST) && !!pathname && SETTINGS.APP_NAMES.includes(pathname);
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

    const appSettings = SETTINGS.APPS[detectedApp];

    if (appSettings?.linkedApp === APP.BRIEF) {
        const briefLink = buildBriefApplicationLink(currentUrl);
        return briefLink.url ? [briefLink] : [];
    }

    if (isOnDocumentationPortal(currentUrl)) {
        const appLink = buildAppLink(detectedApp);
        return appLink.url ? [appLink] : [];
    }

    const links: LinkBuilderResult[] = [];

    if (appSettings?.linkedApp === APP.UMBRACO) {
        links.push(buildUmbracoLink(currentUrl, localhostConfig));
    }

    if (appSettings?.apiDocs === 'swagger') {
        links.push(buildSwaggerLink(currentUrl, localhostConfig));
    } else if (appSettings?.apiDocs === 'scalar') {
        links.push(buildScalarLink(detectedApp));
    }

    return links;
}

function buildScalarLink(application: string): LinkBuilderResult {
    return { url: `${SETTINGS.DOCUMENTATION_PORTAL.BASE_URL}/${application}/scalar` };
}

function buildAppLink(application: string): LinkBuilderResult {
    const { APP_LINK_TENANT, APP_LINK_DOMAIN } = SETTINGS.DOCUMENTATION_PORTAL;
    return { url: `https://${APP_LINK_TENANT}.${application}.${APP_LINK_DOMAIN}/` };
}

function buildBriefApplicationLink(currentUrl: string): LinkBuilderResult {
    try {
        const hostname = new URL(currentUrl).hostname.replace(`.${APP.UMBRACO}.`, `.${APP.BRIEF}.`);
        return { url: `https://${hostname}/` };
    } catch {
        return { url: '' };
    }
}
