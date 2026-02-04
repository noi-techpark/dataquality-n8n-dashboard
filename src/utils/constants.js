// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const API_CONFIG = {
    METADATA_URL: import.meta.env.VITE_METADATA_URL || 'https://tourism.api.opendatahub.testingmachine.eu/v1/MetaData?pagesize=1000&origin=interactive-dashboard',
    N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/data-quality',

    PAGE_SIZE: parseInt(import.meta.env.VITE_PAGE_SIZE) || 1000,

    // Keycloak Configuration
    KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL || 'https://auth.opendatahub.testingmachine.eu/auth',
    KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM || 'noi',
    KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'n8n',
    KEYCLOAK_REDIRECT_URI: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI || (window.location.origin),
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
