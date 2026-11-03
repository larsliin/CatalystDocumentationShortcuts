// Background Service Worker for Documentation Shortcuts Extension

const DEFAULT_BRIEF_DOMAINS = [
    'wppes-map-dev.com',
    'wppes-map-stage.com',
    'catalyst.online',
];

const BRIEF_APP_IDENTIFIER = 'brief';

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
        handleGetConfig(sendResponse);
    } else if (request.action === 'isExtensionEnabled') {
        handleIsExtensionEnabled(request.url, sendResponse);
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
            if (localhostConfig?.applicationHost && isBriefApplication(localhostConfig.applicationHost)) {
                updateDeclarativeRules(localhostConfig);
            } else {
                setupDefaultRules();
            }
        } else {
            setupDefaultRules();
        }
    } catch {
        // Fallback to default domains if appConfig can't be loaded
        setupDefaultRules();
    }
}

function setupDefaultRules() {
    updateDeclarativeRules(null);
}

function isBriefApplication(domain) {
    // Check if domain contains '.brief.' to identify Brief application
    return domain && domain.includes(`.${BRIEF_APP_IDENTIFIER}.`);
}

function updateDeclarativeRules(config) {
    const conditions = [
        { hostEquals: 'localhost' },
        { hostEquals: '127.0.0.1' },
    ];

    // For localhost with valid appConfig, add the Brief domain
    if (config?.applicationHost && isBriefApplication(config.applicationHost)) {
        // Extract the base domain part (e.g., "wppes-map-dev.com" from "dev1.brief.wppes-map-dev.com")
        const parts = config.applicationHost.split('.');
        const briefIndex = parts.indexOf(BRIEF_APP_IDENTIFIER);
        if (briefIndex > 0 && briefIndex < parts.length - 1) {
            const baseDomain = parts.slice(briefIndex + 1).join('.');
            conditions.push({ hostContains: baseDomain });
        }
    } else {
        // For production, add Brief apps on known domains
        DEFAULT_BRIEF_DOMAINS.forEach(domain => {
            conditions.push({ hostContains: `.${BRIEF_APP_IDENTIFIER}.${domain}` });
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
        const isRelevant = isRelevantDomain(urlObj.hostname);

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

function isRelevantDomain(hostname) {
    if (!hostname) return false;

    // For localhost, check if appConfig indicates it's a Brief app
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return localhostConfig?.applicationHost && isBriefApplication(localhostConfig.applicationHost);
    }

    // For other domains, check if it's a Brief application on a known domain
    return DEFAULT_BRIEF_DOMAINS.some(domain => hostname.includes(`.${BRIEF_APP_IDENTIFIER}.${domain}`));
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

async function handleGetConfig(sendResponse) {
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

async function handleIsExtensionEnabled(url, sendResponse) {
    try {
        const urlObj = new URL(url);
        const enabled = isRelevantDomain(urlObj.hostname);
        sendResponse({ enabled });
    } catch {
        sendResponse({ enabled: false });
    }
}
