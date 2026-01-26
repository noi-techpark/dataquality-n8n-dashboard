import Keycloak from 'keycloak-js';
import { API_CONFIG } from './constants';

import { auth } from './auth';

const KEYCLOAK_CONFIG = {
    url: API_CONFIG.KEYCLOAK_URL,
    realm: API_CONFIG.KEYCLOAK_REALM,
    clientId: API_CONFIG.KEYCLOAK_CLIENT_ID,
};

export const keycloak = new Keycloak(KEYCLOAK_CONFIG);

keycloak
    .init({
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: API_CONFIG.KEYCLOAK_REDIRECT_URI,
        pkceMethod: 'S256',
    })
    .then((authenticated) => {
        auth._refresh();

        setInterval(() => {
            keycloak.updateToken(70).then((refreshed) => {
                if (refreshed) auth._refresh();
            }).catch(() => {
                if (keycloak.token) {
                    keycloak.clearToken();
                    auth._refresh();
                }
            });
        }, 60000);
    })
    .catch((err) => {
        console.error('Keycloak initialization failed:', err);
        auth._refresh();
    });
