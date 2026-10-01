import React from 'react';
import {Modal, Tabs, TabsProps} from 'antd';
import {MainTab} from "./MainTab/MainTab";
import {PrivilegeTab} from "pages/TablePage/ui/Settings/ColumnSettings/PrivilegeTab/PrivilegeTab";

type ModalProps = {
    id: number | null;
    visible: boolean;
    setVisible: Function;
    refresh: Function;
}

export const ColumnSettingsModal = (props: ModalProps) => {

    // Useful utils
    const menuItems: TabsProps['items'] = [
        {key: 'general', label: 'Общие настройки', children: <MainTab columnId={props.id} setVisible={props.setVisible} refresh={props.refresh}/>},
        {key: 'privilege', label: 'Настройки доступа', children: <PrivilegeTab columnId={props.id}/>},
    ];
    // -----

    return (
        <Modal title={props.id ? "Редактировать столбец" : "Добавить столбец"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               okText={props.id ? "Сохранить" : "Добавить"}
               width={'800px'}
               footer={() => <></>}
        >
            <Tabs
                defaultActiveKey={"general"}
                items={
                    props.id ? menuItems : [menuItems[0]]
                }
            />
        </Modal>
    );
};
