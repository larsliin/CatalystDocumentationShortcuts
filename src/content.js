// Content script for Documentation Shortcuts Extension
// Runs in the context of web pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAppConfig') {
        findAppConfigFile().then((config) => {
            sendResponse({
                success: !!config,
                data: config,
                error: config ? null : 'Failed to read appConfig.json. Try reloading the page.',
            });
        }).catch(() => {
            sendResponse({
                success: false,
                error: 'Failed to read appConfig.json. Try reloading the page.',
            });
        });
        return true;
    }
});

async function findAppConfigFile() {
    const filesToTry = ['/appConfig.json', './appConfig.json', '../appConfig.json', 'appConfig.json'];

    for (const url of filesToTry) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
            });

            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                try {
                    return await response.json();
                } catch {
                    // JSON parsing failed - continue to next attempt
                    continue;
                }
            }
        } catch {
            // Network error - continue to next attempt
            continue;
        }
    }

    return null;
}
