/**
 * Link builders utility
 * Provides functions to build dynamic documentation links based on current URL or config
 */

interface LinkBuilderResult {
    url: string;
}

interface LocalhostConfig {
    tenantHost?: string;
}

function getConfiguredTenantHost(localhostConfig?: LocalhostConfig): string {
    const host = localhostConfig?.tenantHost?.trim();
    if (!host) {
        return '';
    }

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

/**
 * Check if URL is on localhost
 */
export function isLocalhost(currentUrl: string): boolean {
    try {
        const url = new URL(currentUrl);
        return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    } catch {
        return false;
    }
}

/**
 * Replace the `brief` hostname label with `umbraco`
 * Example: "dev1.brief.wppes-map-dev.com" -> "dev1.umbraco.wppes-map-dev.com"
 */
function getUmbracoHostname(currentUrl: string): string {
    try {
        const url = new URL(currentUrl);
        if (!['http:', 'https:'].includes(url.protocol)) {
            return '';
        }

        const labels = url.hostname.split('.');
        const briefIndex = labels.indexOf('brief');
        if (briefIndex <= 0 || briefIndex === labels.length - 1) {
            return '';
        }

        labels[briefIndex] = 'umbraco';
        return labels.join('.');
    } catch (err) {
        console.error('Failed to extract hostname:', err);
        return '';
    }
}

/**
 * Build Umbraco documentation link from current URL or config
 * Example: "https://dev1.brief.wppes-map-dev.com/" -> "https://dev1.umbraco.wppes-map-dev.com/umbraco"
 * When on localhost, uses the tenantHost from appConfig.json if available
 */
export function buildUmbracoLink(currentUrl: string, localhostConfig?: LocalhostConfig): LinkBuilderResult {
    const hostname = getConfiguredTenantHost(localhostConfig) || getUmbracoHostname(currentUrl);
    return { url: hostname ? buildHttpsUrl(hostname, '/umbraco') : '' };
}

/**
 * Build Swagger documentation link from current URL or config
 * Example: "https://dev1.brief.wppes-map-dev.com/" -> "https://dev1.umbraco.wppes-map-dev.com/swagger/"
 * When on localhost, uses the tenantHost from appConfig.json if available
 */
export function buildSwaggerLink(currentUrl: string, localhostConfig?: LocalhostConfig): LinkBuilderResult {
    const hostname = getConfiguredTenantHost(localhostConfig) || getUmbracoHostname(currentUrl);
    return { url: hostname ? buildHttpsUrl(hostname, '/swagger/') : '' };
}
