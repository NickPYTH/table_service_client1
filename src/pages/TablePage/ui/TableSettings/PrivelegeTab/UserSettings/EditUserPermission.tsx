import {Button, Divider, Flex, Modal, Popconfirm, Select, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {TablePermissionsModel} from "entities/TablePermissionsModel";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";

const {Text} = Typography;

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
    permission: TablePermissionsModel
}

export const EditUserPermission = (props: ModalProps) => {

    // States
    let {id} = useParams();
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const [canEdit, setCanEdit] = useState(props.permission.can_edit);
    const [role, setRole] = useState(props.permission.role);
    // -----

    // Web request
    const [patchPermission, {
        isSuccess: isPatchPermissionSuccess,
        isLoading: isPatchPermissionLoading
    }] = tablepermissionsAPI.usePatchMutation();
    const [setAllPermission, {
        isSuccess: isSetAllPermissionSuccess,
        isLoading: isSetAllPermissionLoading
    }] = rowPermissionsAPI.useSetAllPermissionMutation();
    const [removeAllPermission, {
        isSuccess: isRemoveAllPermissionSuccess,
        isLoading: isRemoveAllPermissionLoading
    }] = rowPermissionsAPI.useRemoveAllPermissionMutation();
    // -----

    // Handlers
    const updatePermissionHandler = () => {
        patchPermission({id: props.permission.id, canEdit, role});
    };
    const updateCanEditHandler = (value:boolean) => {
        setCanEdit(value);
    };
    const updateRoleHandler = (value:string) => {
        setRole(value);
    };
    const setAllPermissionHandler = () => {
        if (id) {
            setAllPermission({
                tableId: id,
                userId: props.permission.user_id
            });
        }
    };
    const removeAllPermissionHandler = () => {
        if (id) {
            removeAllPermission({
                tableId: id,
                userId: props.permission.user_id
            });
        }
    };
    // -----
    console.log(props)
    // Effects
    useEffect(() => {
        if (isPatchPermissionSuccess) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isPatchPermissionSuccess]);
    // -----

    return (
        <Modal title={"Настройка доступа"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'500px'}
               loading={isPatchPermissionLoading}
               okText={"Сохранить"}
               onOk={updatePermissionHandler}
        >
            <Flex gap={'small'} vertical>
                <Flex gap={'middle'} justify={'space-between'}>
                    <Text>
                        Возможность редактирования
                    </Text>
                    <Select
                        value={canEdit}
                        placeholder={"Выберите возможность"}
                        style={{width: 188}}
                        onChange={updateCanEditHandler}
                        options={[
                            {value: true, label: "Да"},
                            {value: false, label: "Нет"},
                        ]}
                    />
                </Flex>
                <Flex gap={'middle'} justify={'space-between'}>
                    <Text>
                        Роль
                    </Text>
                    <Select
                        value={role}
                        placeholder={"Выберите роль"}
                        style={{width: 188}}
                        onChange={updateRoleHandler}
                        options={[
                            {value: "user", label: "Пользователь"},
                            {value: "admin", label: "Администратор"},
                            {value: "owner", label: "Владелец"}
                        ]}
                    />
                </Flex>
                <Divider style={{margin: 0}}/>
                <Flex gap={'middle'} justify={'space-between'}>
                    <Popconfirm title={"Вы уверены?"} okText={"Да, уверен"} onConfirm={setAllPermissionHandler}>
                        <Button loading={isSetAllPermissionLoading} disabled={isSetAllPermissionLoading || isRemoveAllPermissionLoading} style={{width: 320}}>Выдать персональные права на все записи</Button>
                    </Popconfirm>
                </Flex>
                <Flex gap={'middle'} justify={'space-between'}>
                    <Popconfirm title={"Вы уверены?"} okText={"Да, уверен"} onConfirm={removeAllPermissionHandler}>
                        <Button loading={isRemoveAllPermissionLoading} disabled={isSetAllPermissionLoading || isRemoveAllPermissionLoading} style={{width: 320}}>Забрать персональные права на все записи</Button>
                    </Popconfirm>
                </Flex>
            </Flex>
        </Modal>
    )
}
