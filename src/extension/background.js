// Background Service Worker for Documentation Shortcuts Extension

const SUPPORTED_DOMAINS = [
    'wppes-map-dev.com',
    'wppes-map-stage.com',
    'catalyst.online',
];

const DOCUMENTATION_PORTALS = [
    'oes.wppes-map-stage.com',
];

const SUPPORTED_APPS = [
    'companion',
    'studio',
    'segment',
    'umbraco',
    'brief',
    'analytics',
    'qa',
    'inbox',
    'monitor',
    'toolbox',
    'management',
    'promptlab',
];

const ENABLE_ON_ALL_DOMAINS = false;

const USER_FRIENDLY_ERRORS = {
    'Could not establish connection. Receiving end does not exist.':
        'Failed to read appConfig.json. Try reloading the page.',
    'The tab was closed.':
        'The page was closed. Please try again.',
    'Tabs cannot be accessed in this context.':
        'Failed to read appConfig.json. Try reloading the page.',
};

let normalIconImageData = null;
let dimmedIconImageData = null;
let localhostConfig = null;

chrome.action.disable();

chrome.runtime.onInstalled.addListener(async () => {
    await initializeExtension();
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

async function initializeExtension() {
    await loadIconImageData();
    await loadAppConfigAndEnableForDomains();
}

async function loadIconImageData() {
    try {
        // Load normal icon imageData
        const normalIconPath = chrome.runtime.getURL('icons/icon-128.png');
        const normalResponse = await fetch(normalIconPath);
        const normalBitmap = await createImageBitmap(await normalResponse.blob());
        const normalCanvas = new OffscreenCanvas(128, 128);
        const normalContext = normalCanvas.getContext('2d');
        normalContext.drawImage(normalBitmap, 0, 0);
        normalBitmap.close();
        normalIconImageData = {
            16: await getIconImageData('icons/icon-16.png', 16),
            48: await getIconImageData('icons/icon-48.png', 48),
            128: normalContext.getImageData(0, 0, 128, 128),
        };

        // Load dimmed icon imageData
        const dimmedIconPath = chrome.runtime.getURL('icons/icon-128-disabled.png');
        const dimmedResponse = await fetch(dimmedIconPath);
        const dimmedBitmap = await createImageBitmap(await dimmedResponse.blob());
        const dimmedCanvas = new OffscreenCanvas(128, 128);
        const dimmedContext = dimmedCanvas.getContext('2d');
        dimmedContext.drawImage(dimmedBitmap, 0, 0);
        dimmedBitmap.close();
        dimmedIconImageData = {
            16: await getIconImageData('icons/icon-16-disabled.png', 16),
            48: await getIconImageData('icons/icon-48-disabled.png', 48),
            128: dimmedContext.getImageData(0, 0, 128, 128),
        };
    } catch (error) {
        console.error('Failed to load icon image data:', error);
    }
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

async function loadAppConfigAndEnableForDomains() {
    // Try to load appConfig from a common location
    try {
        const response = await fetch('/appConfig.json');
        if (response.ok) {
            const config = await response.json();
            localhostConfig = config.localhost;
                if (localhostConfig?.applicationHost && isSupportedApplication(localhostConfig.applicationHost)) {
                updateDeclarativeRules(localhostConfig);
            } else {
                updateDeclarativeRules(null);
            }
        } else {
            updateDeclarativeRules(null);
        }
    } catch {
        // Fallback to default domains if appConfig can't be loaded
        updateDeclarativeRules(null);
    }
}

function isSupportedApplication(domain) {
    // Check if domain contains any of the supported applications
    return domain && SUPPORTED_APPS.some(app => domain.includes(`.${app}.`));
}

function updateDeclarativeRules(config) {
    if (ENABLE_ON_ALL_DOMAINS) {
        chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
            try {
                chrome.declarativeContent.onPageChanged.addRules([{
                    conditions: [
                        new chrome.declarativeContent.PageStateMatcher({
                            pageUrl: { schemes: ['http', 'https'] },
                        }),
                    ],
                    actions: [
                        new chrome.declarativeContent.ShowAction(),
                    ],
                }]);
            } catch (error) {
                console.error('Failed to set up declarative content rules:', error);
            }
        });
        return;
    }

    const conditions = [
        { hostEquals: 'localhost' },
        { hostEquals: '127.0.0.1' },
    ];

    // For localhost with valid appConfig, add the supported domain
    if (config?.applicationHost && isSupportedApplication(config.applicationHost)) {
        // Extract the base domain part (e.g., "wppes-map-dev.com" from "dev1.analytics.wppes-map-dev.com")
        const parts = config.applicationHost.split('.');
        const lastTwoParts = parts.slice(-2).join('.');
        conditions.push({ hostContains: lastTwoParts });
    } else {
        // For production, add supported apps on known domains
        SUPPORTED_DOMAINS.forEach(domain => {
            SUPPORTED_APPS.forEach(app => {
                conditions.push({ hostContains: `.${app}.${domain}` });
            });
        });

        // Add documentation portal URLs (oes.wppes-map-dev.com/application/scalar)
        DOCUMENTATION_PORTALS.forEach(portal => {
            SUPPORTED_APPS.forEach(app => {
                conditions.push({ urlContains: `${portal}/${app}/` });
            });
        });
    }

    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        try {
            chrome.declarativeContent.onPageChanged.addRules(
                [{
                    conditions: conditions.map((pageUrl) =>
                        new chrome.declarativeContent.PageStateMatcher({ pageUrl }),
                    ),
                    actions: [
                        new chrome.declarativeContent.ShowAction(),
                    ],
                }],
            );
        } catch (error) {
            console.error('Failed to set up declarative content rules:', error);
        }
    });
}

function checkAndUpdateIcon(tabId, url) {
    if (!url) return;

    try {
        const urlObj = new URL(url);
        const isRelevant = ['http:', 'https:'].includes(urlObj.protocol)
            && isRelevantDomain(urlObj.hostname, url);

        if (isRelevant) {
            chrome.action.enable(tabId);
            // Use normal icon
            if (normalIconImageData) {
                chrome.action.setIcon({
                    tabId,
                    imageData: normalIconImageData,
                });
            }
        } else {
            chrome.action.disable(tabId);
            // Use dimmed icon
            if (dimmedIconImageData) {
                chrome.action.setIcon({
                    tabId,
                    imageData: dimmedIconImageData,
                });
            }
        }
    } catch {
        chrome.action.disable(tabId);
        // Use dimmed icon on error
        if (dimmedIconImageData) {
            chrome.action.setIcon({
                tabId,
                imageData: dimmedIconImageData,
            });
        }
    }
}

function isRelevantDomain(hostname, fullUrl = '') {
    if (!hostname) return false;
    if (ENABLE_ON_ALL_DOMAINS) return true;

    // For localhost, check if appConfig indicates it's a supported app
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return localhostConfig?.applicationHost && isSupportedApplication(localhostConfig.applicationHost);
    }

    // Check for documentation portal URLs (oes.wppes-map-stage.com/application/scalar)
    if (fullUrl && DOCUMENTATION_PORTALS.some(portal => hostname.includes(portal))) {
        return SUPPORTED_APPS.some(app => fullUrl.includes(`/${app}/`));
    }

    // For other domains, check if it's a supported application on a known domain
    return SUPPORTED_DOMAINS.some(domain => {
        return SUPPORTED_APPS.some(app => hostname.includes(`.${app}.${domain}`));
    });
}

function getUserFriendlyError(techError) {
    // Check for known Chrome errors and map to friendly messages
    for (const [techMsg, friendlyMsg] of Object.entries(USER_FRIENDLY_ERRORS)) {
        if (techError?.includes(techMsg)) {
            return friendlyMsg;
        }
    }
    // Default to standard message
    return 'Failed to read appConfig.json. Try reloading the page.';
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

        const tabId = tabs[0].id;

        try {
            const response = await chrome.tabs.sendMessage(tabId, {
                action: 'getAppConfig',
            });

            if (response?.success && response.data) {
                sendResponse({
                    success: true,
                    data: response.data,
                });
            } else {
                sendResponse({
                    success: false,
                    error: response?.error || 'Failed to read appConfig.json. Try reloading the page.',
                });
            }
        } catch (error) {
            const friendlyError = getUserFriendlyError(error.message);
            sendResponse({
                success: false,
                error: friendlyError,
            });
        }
    } catch {
        sendResponse({
            success: false,
            error: 'Could not access the page. Try reloading the page.',
        });
    }
}
