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

function getUmbracoHostname(currentUrl: string): string {
    try {
        const url = new URL(currentUrl);
        if (!['http:', 'https:'].includes(url.protocol)) return '';

        const labels = url.hostname.split('.');
        const briefIndex = labels.indexOf('brief');
        if (briefIndex <= 0 || briefIndex === labels.length - 1) return '';

        labels[briefIndex] = 'umbraco';
        return labels.join('.');
    } catch (error) {
        console.error('Failed to extract hostname:', error);
        return '';
    }
}

function getDocumentationHostname(currentUrl: string, localhostConfig?: LocalhostConfig): string {
    return getConfiguredTenantHost(localhostConfig) || getUmbracoHostname(currentUrl);
}

export function buildUmbracoLink(currentUrl: string, localhostConfig?: LocalhostConfig): LinkBuilderResult {
    const hostname = getDocumentationHostname(currentUrl, localhostConfig);
    return { url: hostname ? buildHttpsUrl(hostname, '/umbraco') : '' };
}

export function buildSwaggerLink(currentUrl: string, localhostConfig?: LocalhostConfig): LinkBuilderResult {
    const hostname = getDocumentationHostname(currentUrl, localhostConfig);
    return { url: hostname ? buildHttpsUrl(hostname, '/swagger/') : '' };
}
