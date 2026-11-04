// Runs in the page context to read localhost app configuration.

const APP_CONFIG_NOT_FOUND = 'not-found';
const APP_CONFIG_UNREACHABLE = 'unreachable';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getAppConfig') {
        findAppConfigFile().then(({ config, status }) => {
            sendResponse({
                success: !!config,
                data: config,
                status,
                error: config ? null : 'Failed to read appConfig.json. Try reloading the page.',
            });
        }).catch(() => {
            sendResponse({
                success: false,
                status: APP_CONFIG_UNREACHABLE,
                error: 'Failed to read appConfig.json. Try reloading the page.',
            });
        });
        return true;
    }
});

// "not-found" means the server answered but has no JSON appConfig (e.g. another app on localhost),
// which is final. "unreachable" means no answer at all (server starting/restarting), which is retryable.
async function findAppConfigFile() {
    const filesToTry = ['/appConfig.json', './appConfig.json', '../appConfig.json', 'appConfig.json'];
    let serverResponded = false;

    for (const url of filesToTry) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'same-origin',
                cache: 'no-store',
            });
            serverResponded = true;

            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                try {
                    return { config: await response.json(), status: 'found' };
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

    return { config: null, status: serverResponded ? APP_CONFIG_NOT_FOUND : APP_CONFIG_UNREACHABLE };
}
