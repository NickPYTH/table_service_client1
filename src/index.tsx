import React from 'react';
import './index.scss';
import {ReduxProvider} from "app/providers/ReduxProvider";
import {AntdProvider} from "app/providers/AntdProvider";
import {Router} from "component/Router";
import {NotificationProvider} from "app/providers/NotificationProvider";
import {wsHost} from "shared/config/constants";
import {WebSocketProvider} from "app/providers/WebSocketProvider";
import {createRoot} from "react-dom/client";

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