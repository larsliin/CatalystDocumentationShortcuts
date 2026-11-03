/**
 * Link builders utility
 * Provides functions to build dynamic documentation links based on current URL or config
 */

interface LinkBuilderResult {
    url: string;
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
 * Extract the base hostname and replace 'brief' with 'umbraco'
 * Example: "dev1.brief.wppes-map-dev.com" -> "dev1.umbraco.wppes-map-dev.com"
 */
function getUmbracoHostname(currentUrl: string): string {
    try {
        const url = new URL(currentUrl);
        return url.hostname.replace('brief', 'umbraco');
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
export function buildUmbracoLink(currentUrl: string, localhostConfig?: any): LinkBuilderResult {
    if (localhostConfig?.tenantHost) {
        return {
            url: `https://${localhostConfig.tenantHost}/umbraco`,
        };
    }

    const hostname = getUmbracoHostname(currentUrl);
    return {
        url: hostname ? `https://${hostname}/umbraco` : '',
    };
}

/**
 * Build Swagger documentation link from current URL or config
 * Example: "https://dev1.brief.wppes-map-dev.com/" -> "https://dev1.umbraco.wppes-map-dev.com/swagger/"
 * When on localhost, uses the tenantHost from appConfig.json if available
 */
export function buildSwaggerLink(currentUrl: string, localhostConfig?: any): LinkBuilderResult {
    if (localhostConfig?.tenantHost) {
        return {
            url: `https://${localhostConfig.tenantHost}/swagger/`,
        };
    }

    const hostname = getUmbracoHostname(currentUrl);
    return {
        url: hostname ? `https://${hostname}/swagger/` : '',
    };
}

