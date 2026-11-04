export type ApiDocsType = 'scalar' | 'swagger' | 'none';

export interface AppSettings {
    /** API documentation type; 'none' when the app has no API documentation. */
    readonly apiDocs: ApiDocsType;
    /** App whose link is shown for this app (Brief and its Umbraco CMS link to each other). */
    readonly linkedApp?: string;
}

/** Apps with special link rules. Their hostnames differ only by the "brief"/"umbraco" label. */
export const APP = Object.freeze({
    BRIEF: 'brief',
    UMBRACO: 'umbraco',
});

// Order matters: hostnames are matched against app names in this order.
const APPS: Readonly<Record<string, AppSettings>> = Object.freeze({
    companion: { apiDocs: 'scalar' },
    studio: { apiDocs: 'scalar' },
    segment: { apiDocs: 'scalar' },
    [APP.UMBRACO]: { apiDocs: 'none', linkedApp: APP.BRIEF },
    [APP.BRIEF]: { apiDocs: 'swagger', linkedApp: APP.UMBRACO },
    analytics: { apiDocs: 'scalar' },
    automation: { apiDocs: 'none' },
    qa: { apiDocs: 'scalar' },
    inbox: { apiDocs: 'scalar' },
    monitor: { apiDocs: 'scalar' },
    toolbox: { apiDocs: 'scalar' },
    management: { apiDocs: 'scalar' },
    promptlab: { apiDocs: 'scalar' },
});

const APP_NAMES = Object.freeze(Object.keys(APPS));

export const SETTINGS = Object.freeze({
    CATALYST: 'catalyst',
    APPS,
    APP_NAMES,
    // Apps that have at least one link outside localhost; the toolbar button is disabled for the others.
    APPS_WITH_DEPLOYED_LINKS: Object.freeze(APP_NAMES.filter((app) => {
        const settings = APPS[app];
        return settings?.apiDocs !== 'none' || !!settings.linkedApp;
    })),
    // Application hosts follow "<tenant>.<app>.<domain>".
    DOMAINS: Object.freeze([
        'wppes-map-dev.com',
        'wppes-map-stage.com',
        'catalyst.online',
    ]),
    LOCALHOST_HOSTNAMES: Object.freeze(['localhost', '127.0.0.1']),
    DOCUMENTATION_PORTAL: Object.freeze({
        HOST: 'oes.wppes-map-stage.com',
        // Scalar docs live at "<BASE_URL>/<app>/scalar".
        BASE_URL: 'https://oes.wppes-map-stage.com',
        // Environment opened by the portal's "Application" link: "https://<tenant>.<app>.<domain>/".
        APP_LINK_TENANT: 'ikea',
        APP_LINK_DOMAIN: 'wppes-map-stage.com',
    }),
    // Debug switch: enable the toolbar button on every http(s) page.
    ENABLE_ON_ALL_DOMAINS: false,
    // Reading appConfig.json on localhost, which may not be served yet on slow page loads.
    APP_CONFIG: Object.freeze({
        TIMEOUT_MS: 10000,
        RETRY_DELAYS_MS: Object.freeze([300, 500, 750, 1000, 1500, 2000]),
    }),
});
