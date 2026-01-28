export const API_CONFIG = {
    METADATA_URL: 'https://tourism.api.opendatahub.com/v1/MetaData?pagesize=1000&origin=interactive-dashboard',
    N8N_WEBHOOK_URL: 'http://localhost:5678/webhook/data-quality',
    LOGIN_AUTH: 'https://auth.opendatahub.testingmachine.eu/auth/realms/noi/protocol/openid-connect/auth',
    LOGIN_TOKEN: 'https://auth.opendatahub.testingmachine.eu/auth/realms/noi/protocol/openid-connect/token',
    PAGE_SIZE: 1000,

    // Keycloak Configuration
    KEYCLOAK_URL: 'https://auth.opendatahub.testingmachine.eu/auth',
    KEYCLOAK_REALM: 'noi',
    KEYCLOAK_CLIENT_ID: 'n8n',
    KEYCLOAK_REDIRECT_URI: window.location.origin + '/silent-check-sso.html',
};
export const CHART_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export const STATUS_COLORS = {
    primary: '#2563eb',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    text: '#1f2937',
    subtext: '#4b5563'
};

export const CATEGORIES = ['mobility', 'tourism', 'weather', 'energy', 'environmental', 'other'];
