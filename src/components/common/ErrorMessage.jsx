// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => (
    <div className="error-message">
        <AlertCircle size={24} />
        <span>{message}</span>
    </div>
);

export default ErrorMessage;
