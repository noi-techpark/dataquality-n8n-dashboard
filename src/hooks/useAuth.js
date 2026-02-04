// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect } from 'react';
import { auth } from '../utils/auth';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(auth.isAuthenticated());
    const [user, setUser] = useState(auth.getUser());

    useEffect(() => {
        const unsubscribe = auth.subscribe(() => {
            setIsAuthenticated(auth.isAuthenticated());
            setUser(auth.getUser());
        });

        return unsubscribe;
    }, []);

    return { isAuthenticated, user };
};
