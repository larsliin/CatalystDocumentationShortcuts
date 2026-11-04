// Background Service Worker for Documentation Shortcuts Extension

import { SETTINGS } from '@/config/settings';

const {
    APP_NAMES,
    APPS_WITH_DEPLOYED_LINKS,
    DOMAINS,
    DOCUMENTATION_PORTAL,
    LOCALHOST_HOSTNAMES,
    ENABLE_ON_ALL_DOMAINS,
    APP_CONFIG,
} = SETTINGS;

const USER_FRIENDLY_ERRORS = {
    'Could not establish connection. Receiving end does not exist.':
        'Failed to read appConfig.json. Try reloading the page.',
    'The tab was closed.':
        'The page was closed. Please try again.',
    'Tabs cannot be accessed in this context.':
        'Failed to read appConfig.json. Try reloading the page.',
};

const DEFAULT_APP_CONFIG_ERROR = 'Failed to read appConfig.json. Try reloading the page.';

const APP_CONFIG_NOT_FOUND = 'not-found';

const APP_CONFIG_NOT_FOUND_MESSAGE = 'No appConfig.json found. This localhost app is not a supported Catalyst application.';

const ICON_SIZES = [16, 48, 128];

let iconImageDataPromise = null;
const iconUpdateTokens = new Map();

chrome.action.disable();

chrome.runtime.onInstalled.addListener(() => {
    clearDeclarativeRules();
});

chrome.runtime.onStartup.addListener(() => {
    clearDeclarativeRules();
});

chrome.tabs.onRemoved.addListener((tabId) => {
    iconUpdateTokens.delete(tabId);
});

chrome.webNavigation.onCommitted.addListener((details) => {
    if (details.frameId === 0) {
        checkAndUpdateIcon(details.tabId, details.url);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        checkAndUpdateIcon(tabId, tab.url);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAppConfig') {
        handleGetAppConfig(sendResponse);
    }
    return true;
});

// Earlier versions registered ShowAction rules that force-enabled the action on every
// localhost page. Enabled state is now driven solely by checkAndUpdateIcon.
function clearDeclarativeRules() {
    chrome.declarativeContent?.onPageChanged.removeRules(undefined);
}

// Cached per service worker lifetime; MV3 workers restart and lose globals.
function getIconImageDataSets() {
    if (!iconImageDataPromise) {
        iconImageDataPromise = Promise.all([
            loadIconSet('icons/icon-{size}.png'),
            loadIconSet('icons/icon-{size}-disabled.png'),
        ])
            .then(([normal, dimmed]) => ({ normal, dimmed }))
            .catch((error) => {
                console.error('Failed to load icon image data:', error);
                iconImageDataPromise = null;
                return null;
            });
    }
    return iconImageDataPromise;
}

async function loadIconSet(pathTemplate) {
    const entries = await Promise.all(ICON_SIZES.map(async (size) => [
        size,
        await getIconImageData(pathTemplate.replace('{size}', size), size),
    ]));
    return Object.fromEntries(entries);
}

async function getIconImageData(iconPath, size) {
    const response = await fetch(chrome.runtime.getURL(iconPath));
    const bitmap = await createImageBitmap(await response.blob());
    const canvas = new OffscreenCanvas(size, size);
    const context = canvas.getContext('2d');
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    return context.getImageData(0, 0, size, size);
}

async function checkAndUpdateIcon(tabId, url) {
    if (!url) return;

    // Discard stale results when navigation events for the same tab overlap.
    const token = (iconUpdateTokens.get(tabId) ?? 0) + 1;
    iconUpdateTokens.set(tabId, token);

    const isCurrent = () => iconUpdateTokens.get(tabId) === token;
    const isRelevant = await isRelevantUrl(tabId, url, isCurrent);
    if (!isCurrent()) return;

    try {
        if (isRelevant) {
            await chrome.action.enable(tabId);
        } else {
            await chrome.action.disable(tabId);
        }

        const iconSets = await getIconImageDataSets();
        if (iconSets && isCurrent()) {
            await chrome.action.setIcon({
                tabId,
                imageData: isRelevant ? iconSets.normal : iconSets.dimmed,
            });
        }
    } catch (error) {
        // The tab may have been closed while the icon was updating.
        console.debug('Failed to update action icon:', error);
    }
}

async function isRelevantUrl(tabId, url, isCurrent) {
    let urlObj;
    try {
        urlObj = new URL(url);
    } catch {
        return false;
    }

    if (!['http:', 'https:'].includes(urlObj.protocol)) return false;
    if (ENABLE_ON_ALL_DOMAINS) return true;

    if (LOCALHOST_HOSTNAMES.includes(urlObj.hostname)) {
        // Localhost always offers the configured environment link, so every supported app qualifies.
        const applicationHost = await getLocalhostApplicationHost(tabId, isCurrent);
        return isSupportedHost(applicationHost, APP_NAMES);
    }

    // Documentation portal URLs (oes.wppes-map-stage.com/application/scalar)
    if (urlObj.hostname.includes(DOCUMENTATION_PORTAL.HOST)) {
        return APPS_WITH_DEPLOYED_LINKS.some(app => url.includes(`/${app}/`));
    }

    return isSupportedHost(urlObj.hostname, APPS_WITH_DEPLOYED_LINKS);
}

// Reads appConfig.json through the tab's content script, since only the page can fetch it.
async function getLocalhostApplicationHost(tabId, isCurrent) {
    const response = await requestAppConfigFromTab(tabId, isCurrent);
    const applicationHost = response.success ? response.data?.localhost?.applicationHost : '';
    return typeof applicationHost === 'string' ? applicationHost.trim().toLowerCase() : '';
}

// Retries only while the page can't answer yet (content script not injected, dev server
// starting). A definitive "not found" (e.g. another app running on localhost) stops at once.
async function requestAppConfigFromTab(tabId, isCurrent = () => true) {
    const deadline = Date.now() + APP_CONFIG.TIMEOUT_MS;
    let lastError = DEFAULT_APP_CONFIG_ERROR;

    for (let attempt = 0; ; attempt++) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'getAppConfig' });
            if (response?.success && response.data) {
                return { success: true, data: response.data };
            }
            if (response?.status === APP_CONFIG_NOT_FOUND) {
                return { success: false, notFound: true, error: APP_CONFIG_NOT_FOUND_MESSAGE };
            }
            lastError = response?.error || DEFAULT_APP_CONFIG_ERROR;
        } catch (error) {
            lastError = getUserFriendlyError(error?.message);
        }

        const wait = APP_CONFIG.RETRY_DELAYS_MS[Math.min(attempt, APP_CONFIG.RETRY_DELAYS_MS.length - 1)];
        if (Date.now() + wait > deadline || !isCurrent() || !(await tabExists(tabId))) {
            return { success: false, error: lastError };
        }
        await delay(wait);
    }
}

async function tabExists(tabId) {
    try {
        await chrome.tabs.get(tabId);
        return true;
    } catch {
        return false;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// True for "<tenant>.<app>.<supported domain>", e.g. "ikea.analytics.wppes-map-stage.com".
function isSupportedHost(hostname, apps) {
    if (!hostname) return false;
    return DOMAINS.some(domain =>
        apps.some(app => hostname.includes(`.${app}.${domain}`)),
    );
}

function getUserFriendlyError(techError) {
    // Check for known Chrome errors and map to friendly messages
    for (const [techMsg, friendlyMsg] of Object.entries(USER_FRIENDLY_ERRORS)) {
        if (techError?.includes(techMsg)) {
            return friendlyMsg;
        }
    }
    return DEFAULT_APP_CONFIG_ERROR;
}

async function handleGetAppConfig(sendResponse) {
    try {
        // Query for the active tab since message comes from popup, not content script
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

        if (!tabs || tabs.length === 0 || !tabs[0]?.id) {
            sendResponse({
                success: false,
                error: 'Please make sure a webpage is open in this window.',
            });
            return;
        }

        sendResponse(await requestAppConfigFromTab(tabs[0].id));
    } catch {
        sendResponse({
            success: false,
            error: 'Could not access the page. Try reloading the page.',
        });
    }
}
