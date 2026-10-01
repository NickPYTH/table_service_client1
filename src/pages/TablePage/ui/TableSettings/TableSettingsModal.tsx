import React from 'react';
import {Modal, Tabs, TabsProps} from 'antd';
import {TableModel} from "entities/TableModel";
import {PrivilegeTab} from './PrivelegeTab/PrivilegeTab';
import {MainTab} from './MainTab/MainTab';


type PropsType = {
    table: TableModel;
    visible: boolean;
    setVisible: Function;
    setContext: Function;
};

export const TableSettingsModal = (props: PropsType) => {

    // Useful utils
    const menuItems: TabsProps['items'] = [
        {key: 'general', label: 'Общие настройки', children: <MainTab table={props.table} setContext={props.setContext}/>},
        {key: 'privilege', label: 'Настройки доступа', children: <PrivilegeTab />},
    ];
    // -----

    return (
        <Modal title={"Настройки таблицы"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'750px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Tabs
                defaultActiveKey={"general"}
                items={menuItems}
            />
        </Modal>
    );
};
