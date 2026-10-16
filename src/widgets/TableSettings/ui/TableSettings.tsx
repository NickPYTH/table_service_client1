import {Modal, Tabs, TabsProps} from "antd";
import {useTableSettings} from "../model/useTableSettings";
import {TableSettingsType} from "../model/types";
import React from "react";
import {GeneralSettings} from "./GeneralSettings";
import {UserPermissionSettings} from "./UserPermissionSettings";
import {FilialPermissionSettings} from "./FilialPermissionSettings";

export const TableSettings = ({visible, setVisible}: TableSettingsType) => {

    const {
        closeHandler,
    } = useTableSettings({visible, setVisible});

    const menuItems: TabsProps['items'] = [
        {key: 'general', label: 'Общие', children: <GeneralSettings/>},
        {key: 'user_privilege', label: 'Права пользователи', children: <UserPermissionSettings/>},
        {key: 'filial_privilege', label: 'Права филиалов', children: <FilialPermissionSettings/>},
    ];

    return (
        <Modal
            title={`Настройка таблицы`}
            open={visible}
            onCancel={closeHandler}
            okText="Сохранить"
            cancelText="Отменить"
            destroyOnHidden
            footer={null}
            width={800}
            style={{top: 10}}
        >
            <Tabs
                defaultActiveKey={"general"}
                items={menuItems}
            />
        </Modal>
    )
}