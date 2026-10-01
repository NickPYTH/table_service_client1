import React, {useEffect, useState} from 'react';
import {Button, Flex, Input, Modal, Table, TableProps} from 'antd';
import {userAPI} from "service/UserService";
import {UserModel} from "entities/UserModel";
import {useParams} from "react-router-dom";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {columnPermissionsAPI} from "service/ColumnPermissionsService";
import {ProfileModel} from "entities/ProfileModel";

type ModalProps = {
    id: number; // column id or row id
    visible: boolean;
    setVisible: Function;
    refresh: Function;
    type: string; // column or row
}

export const AddUserModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    let [users, setUsers] = useState<UserModel[]>([]);
    let [filteredUsers, setFilteredUsers] = useState<UserModel[]>([]);
    let [searchText, setSearchText] = useState("");
    // -----

    // Web requests
    const [getUsersByTable, {
        data: usersByTable,
        isLoading: isUsersByTableLoading
    }] = userAPI.useGetAllByTableIdMutation();
    const [getUsersByRow, {
        data: usersByRow,
        isLoading: isUsersByRowLoading
    }] = userAPI.useGetAllByRowIdMutation();
    const [getUsersByColumn, {
        data: usersByColumn,
        isLoading: isUsersByColumnLoading
    }] = userAPI.useGetAllByColumnIdMutation();
    const [createTablePermission, {
        isSuccess: isSuccessCreateTablePermissions,
        isLoading: isLoadingCreateTablePermissions
    }] = tablepermissionsAPI.useCreateMutation();
    const [createRowPermission, {
        isSuccess: isSuccessCreateRowPermissions,
        isLoading: isLoadingCreateRowPermissions
    }] = rowPermissionsAPI.useCreateMutation();
    const [createColumnPermission, {
        isSuccess: isSuccessCreateColumnPermissions,
        isLoading: isLoadingCreateColumnPermissions
    }] = columnPermissionsAPI.useCreateMutation();
    const [searchUsers, {
        data: usersBySearch,
        isLoading: isSearchLoading
    }] = userAPI.useSearchMutation();
    // -----

    // Effects
    useEffect(() => {
        if (props.type == 'row') {
            if (id && props.id) getUsersByRow({tableId: id, rowId: props.id});
        } else if (props.type == 'column') {
            if (id && props.id) getUsersByColumn({tableId: id, columnId: props.id});
        }
    }, []);
    useEffect(() => {
        if (usersBySearch) {
            setFilteredUsers(usersBySearch.map((p:ProfileModel)=>p.user));
        }
    }, [usersBySearch]);
    useEffect(() => {
        if (usersByTable) {
            setUsers(usersByTable);
            setFilteredUsers(usersByTable);
        }
    }, [usersByTable]);
    useEffect(() => {
        if (usersByRow) {
            setUsers(usersByRow);
            setFilteredUsers(usersByRow);
        }
    }, [usersByRow]);
    useEffect(() => {
        if (usersByColumn) {
            setUsers(usersByColumn);
            setFilteredUsers(usersByColumn);
        }
    }, [usersByColumn]);
    useEffect(() => {
        if (isSuccessCreateTablePermissions || isSuccessCreateRowPermissions || isSuccessCreateColumnPermissions) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isSuccessCreateTablePermissions, isSuccessCreateRowPermissions, isSuccessCreateColumnPermissions]);
    // -----

    // Handlers
    const createTablePermissionHandler = (userId: number) => {
        if (id) createTablePermission({userId, tableId: id});
    };
    const createRowPermissionHandler = (userId: number) => {
        if (props.id && id) createRowPermission({userId, rowId: props.id, tableId: id});
    };
    const createColumnPermissionHandler = (userId: number) => {
        if (props.id && id) createColumnPermission({userId, columnId: props.id, tableId: id});
    };
    const searchHandler = () => {
        searchUsers({text: searchText.toLowerCase(), id: props.id, type: props.type});
    };
    const cancelHandler = () => {
        setFilteredUsers(users)
    };
    // -----

    // Columns
    const columns: TableProps<UserModel>['columns'] = [
        {
            title: 'ИД',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => (a.id && b.id) ? a.id - b.id : 0,
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
        },
        {
            title: 'Пользователь',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Фамилия',
            dataIndex: 'last_name',
            key: 'last_name',
        },
        {
            title: 'Имя',
            dataIndex: 'first_name',
            key: 'first_name',
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Button size={'small'} onClick={() =>
                    props.type == 'row' ? createRowPermissionHandler(record.id) :
                        props.type == 'table' ? createTablePermissionHandler(record.id) :
                            props.type == 'column' ? createColumnPermissionHandler(record.id) : () => {}
                    }>
                    Добавить</Button>
            </Flex>
        },
    ];
    // -----

    return (
        <Modal title={`Выбор пользователя${isLoadingCreateTablePermissions ? '. Создание может занять ~30 сек в синхронном режиме' : ''}`}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'900px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <Flex gap={'small'}>
                    <Input style={{width: 300}} value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder={'Введите что-то для поиска...'}/>
                    <Button style={{width: 120}} onClick={searchHandler}>Найти</Button>
                    <Button style={{width: 120}} onClick={cancelHandler}>Сбросить</Button>
                </Flex>
                <Table
                    columns={columns}
                    dataSource={filteredUsers}
                    loading={isUsersByTableLoading || isUsersByRowLoading || isLoadingCreateTablePermissions || isLoadingCreateRowPermissions || isLoadingCreateColumnPermissions}
                    bordered
                />
            </Flex>
        </Modal>
    );
};
