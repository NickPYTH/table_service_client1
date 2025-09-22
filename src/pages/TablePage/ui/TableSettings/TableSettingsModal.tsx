import React from 'react';
import {Divider, Flex, Modal} from 'antd';
import {UserPermission} from "pages/TablePage/ui/TableSettings/UserSettings/UserPermission";
import {FilialPermission} from "pages/TablePage/ui/TableSettings/FilialSettings/FilialPermission";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
}

export const TableSettingsModal = (props: ModalProps) => {

    return (
        <Modal title={"Настройки таблицы"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <UserPermission/>
                <Divider/>
                <FilialPermission/>
            </Flex>
        </Modal>
    );
};
