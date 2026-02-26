// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const API_CONFIG = {
    METADATA_URL: import.meta.env.VITE_METADATA_URL,
    N8N_WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL,
    CACHE_API_URL: import.meta.env.VITE_CACHE_API_URL,
    CACHE_WRITE_URL: import.meta.env.VITE_CACHE_WRITE_URL,

    PAGE_SIZE: parseInt(import.meta.env.VITE_PAGE_SIZE),

    // Keycloak Configuration
    KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL,
    KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
    KEYCLOAK_REDIRECT_URI: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI,
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
