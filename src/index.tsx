import React from 'react';
import './index.scss';
import {ReduxProvider} from "app/providers/ReduxProvider";
import {AntdProvider} from "app/providers/AntdProvider";
import {Router} from "component/Router";
import {NotificationProvider} from "app/providers/NotificationProvider";
import {wsHost} from "shared/config/constants";
import {WebSocketProvider} from "app/providers/WebSocketProvider";
import {createRoot} from "react-dom/client";

import { LicenseInfo } from '@mui/x-license';

LicenseInfo.setLicenseKey('c9c8d9a285759e8b8db79e9ad47277faTz05OTk5OTksRT05OTk5OTk5OTk5OTk5LFM9cHJlbWl1bSxMTT1wZXJwZXR1YWwsUFY9aW5pdGlhbCxLVj0y');

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <React.StrictMode>
        <ReduxProvider>
            <AntdProvider>
                <NotificationProvider>
                    <WebSocketProvider
                        url={`${wsHost}/ws/update-service/`}
                        onConnectionChange={(connected) => {
                            console.log(connected ? 'Соединение установлено' : 'Соединение потеряно');
                        }}
                    >
                        <Router/>
                    </WebSocketProvider>
                </NotificationProvider>
            </AntdProvider>
        </ReduxProvider>
    </React.StrictMode>
);