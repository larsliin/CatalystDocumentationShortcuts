import { SETTINGS } from './constants';

/**
 * Extract domain from URL
 * Removes protocol and www. but keeps domain extension
 * Example: "https://www.mydomain.com" -> "mydomain.com"
 * Returns empty string if URL is invalid or is a special URL (chrome://, about:, etc.)
 */
export function extractDomain(url: string): string {
    try {
        const urlObj = new URL(url);
        // Don't process special URLs
        if (urlObj.protocol.startsWith('chrome') || urlObj.protocol === 'about:') {
            return '';
        }
        let domain = urlObj.hostname;
        if (!domain) {
            return '';
        }
        if (domain.startsWith('www.')) {
            domain = domain.substring(4);
        }
        return domain;
    } catch {
        return '';
    }
}

/**
 * Check if domain contains any unknown app name (not in SETTINGS.APP_NAMES)
 * Returns the unknown app name if found, null otherwise
 */
function findUnknownAppName(domain: string): string | null {
    const parts = domain.split('.');

    for (const part of parts) {
        // Check if this part looks like an app name (not catalyst, online, com, etc.)
        // but is not in our known list
        if (part !== 'catalyst' && part !== 'online' && part !== 'com'
            && !part.match(/^\d+$/) // skip numeric parts
            && !SETTINGS.APP_NAMES.includes(part)) {
            // Could be an unknown app - check if it's in a typical position (after tenant, before catalyst)
            const partIndex = parts.indexOf(part);
            if (partIndex > 0 && partIndex < parts.length - 1) {
                // Check if "catalyst" exists after this part
                if (parts.slice(partIndex + 1).includes('catalyst')) {
                    return part;
                }
            }
        }
    }
    return null;
}

/**
 * Extract tenantHost by removing the app name from the domain
 * Example: "demo.companion.catalyst.online" with APP_NAMES containing "companion"
 * Result: "demo.catalyst.online"
 *
 * If no known app name matches, returns the domain as-is (including any unknown app name)
 */
export function extractTenantHost(domain: string): string {
    const parts = domain.split('.');

    // Check if any app name exists in the domain parts
    for (const appName of SETTINGS.APP_NAMES) {
        const appIndex = parts.indexOf(appName);
        if (appIndex > 0) {
            // Remove the app name and keep tenant + catalyst onwards
            // Example: ['demo', 'companion', 'catalyst', 'online'] -> ['demo', 'catalyst', 'online']
            parts.splice(appIndex, 1);
            return parts.join('.');
        }
    }

    // No known app name matched - return domain as-is (including any unknown app)
    return domain;
}

/**
 * Build localhost object from current tab URL
 * Returns { data: {...}, unknownApp: "name" } if unknown app detected
 * Returns { data: {...}, unknownApp: null } if successful or fallback
 * Returns null if domain cannot be extracted (invalid URL, special URL, etc.)
 */
export function buildLocalhostObject(tabUrl: string): any {
    if (!tabUrl || typeof tabUrl !== 'string') {
        return null;
    }

    const domain = extractDomain(tabUrl);
    if (!domain) {
        return null;
    }

    // Check for unknown app names
    const unknownApp = findUnknownAppName(domain);

    return {
        data: {
            tenantHost: extractTenantHost(domain),
            applicationHost: domain,
        },
        unknownApp: unknownApp || null,
    };
}
