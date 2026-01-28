import Keycloak from 'keycloak-js';
import { API_CONFIG } from './constants';

const KEYCLOAK_CONFIG = {
    url: API_CONFIG.KEYCLOAK_URL,
    realm: API_CONFIG.KEYCLOAK_REALM,
    clientId: API_CONFIG.KEYCLOAK_CLIENT_ID,
};

export const keycloak = new Keycloak(KEYCLOAK_CONFIG);

// Store initialization promise
let initPromise = null;

// Initialize Keycloak
export const initKeycloak = () => {
    if (initPromise) return initPromise;

    initPromise = keycloak
        .init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: API_CONFIG.KEYCLOAK_REDIRECT_URI,
            pkceMethod: 'S256',
        })
        .then((authenticated) => {
            console.log('Keycloak initialized. Authenticated:', authenticated);

            // Set up token refresh
            setInterval(() => {
                keycloak.updateToken(70).then((refreshed) => {
                    if (refreshed) {
                        console.log('Token refreshed');
                    }
                }).catch(() => {
                    console.log('Failed to refresh token');
                    if (keycloak.token) {
                        keycloak.clearToken();
                    }
                });
            }, 60000);

            return authenticated;
        })
        .catch((err) => {
            console.error('Keycloak initialization failed:', err);
            throw err;
        });

    return initPromise;
};
