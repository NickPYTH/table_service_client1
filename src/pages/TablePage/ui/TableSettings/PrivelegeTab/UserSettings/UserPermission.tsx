import {Button, Dropdown, Flex, Popconfirm, Switch, Table, TableProps, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {TablePermissionsModel} from "entities/TablePermissionsModel";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {AddUserModal} from "../../../AddUserModal";
import {useParams} from "react-router-dom";
import {EditUserPermission} from "pages/TablePage/ui/TableSettings/PrivelegeTab/UserSettings/EditUserPermission";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {columnPermissionsAPI} from "service/ColumnPermissionsService";
import {EditRowValuePermission} from "pages/TablePage/ui/TableSettings/PrivelegeTab/UserSettings/EditRowValuePermission";
import {DownOutlined, FileAddOutlined, TableOutlined, UserAddOutlined} from "@ant-design/icons";

const {Text, Title} = Typography;

const getRussianRole = (role:string) => {
    switch (role) {
        case "user":
            return "Пользователь";
        case "admin":
            return "Администратор";
        case "owner":
            return "Владелец";
        default:
            return "Пользователь";
    }
}

export const UserPermission = () => {

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    // -----

    // States
    let {id} = useParams();
    const [permissionsTableData, setPermissionsTableData] = useState<TablePermissionsModel[]>([]);
    const [isVisibleAddUserModal, setIsVisibleAddUserModal] = useState(false);
    const [isVisibleEditUserPermissionModal, setIsVisibleEditUserPermissionModal] = useState(false);
    const [selectedPermission, setSelectedPermission] = useState<TablePermissionsModel | null>(null);
    const [isVisibleRowValuePermission, setIsVisibleRowValuePermission] = useState(false)
    // -----

    // Web requests
    const [getPermissionByTableId, {
        data: permissions,
        isLoading: isLoadingGetPermissionByTableId
    }] = tablepermissionsAPI.useGetAllByTableIdMutation();
    const [updateColumnPermission, {
        isLoading: isUpdateColumnPermission
    }] = columnPermissionsAPI.useUpdateColumnPrivelegeByTableUserMutation();
    const [deleteTablePermission, {
        isSuccess: isSuccessDeleteTablePermission,
        isLoading: isLoadingDeleteTablePermission
    }] = tablepermissionsAPI.useDeleteMutation();
    // -----

    const [patchPermission, {
        isLoading: isPatchPermissionLoading
    }] = tablepermissionsAPI.usePatchMutation();

    // Effects
    useEffect(() => {
        if (id) {
            getPermissionByTableId(id);
            setSelectedPermission(null);
        }
    }, []);
    useEffect(() => {
        if (permissions) setPermissionsTableData(permissions);
    }, [permissions]);
    useEffect(() => {
        if (isSuccessDeleteTablePermission && id) getPermissionByTableId(id);
    }, [isSuccessDeleteTablePermission]);
    // -----

    // Handlers
    const deletePermissionHandler = (permissionId: number) => {
        deleteTablePermission(permissionId);
    };
    const updateTablePermissionHandler = () => {
        if (id) {
            updateColumnPermission(parseInt(id));
        }
    }
    const quickUpdatePermissionHandler = (permission:TablePermissionsModel, canEdit: boolean) => {
        patchPermission({...permission, canEdit});
    }
    // -----

    const items = [
        {
            key: 'addUser',
            label: 'Добавить пользователя',
            onClick: () => setIsVisibleAddUserModal(true)
        },
        {
            key: 'updatePermissions',
            label: (
                <Popconfirm
                    title="Вы точно хотите выдать текущим пользователям и филиалам права на все колонки?"
                    okText="Да"
                    onConfirm={updateTablePermissionHandler}
                >
                    Выдать права на колонки
                </Popconfirm>
            ),
            disabled: isUpdateColumnPermission
        },
        {
            key: 'addCellPermission',
            label: 'Добавить права по значению ячейки',
            onClick: () => setIsVisibleRowValuePermission(true)
        }
    ];

    // Columns
    const permissionsTableColumns: TableProps<TablePermissionsModel>['columns'] = [
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
            dataIndex: 'user',
            key: 'user',
            render: (value, record) => (<div>{record.user.username}</div>),
            filters: permissions?.reduce((acc: { text: string, value: string }[], user: TablePermissionsModel) => {
                if (acc.find((g: { text: string, value: string }) => g.text === user.user.username) === undefined)
                    return acc.concat({text: user.user.username, value: user.user.username});
                return acc;
            }, []),
            onFilter: (value: any, record: TablePermissionsModel) => {
                return record.user.username.indexOf(value) === 0
            },
            filterSearch: true
        },
        {
            title: 'Редактирование',
            dataIndex: 'can_edit',
            key: 'can_edit',
            render: (value, record) => (<Flex justify={'center'}><Switch loading={isPatchPermissionLoading} disabled={isPatchPermissionLoading} defaultValue={record.can_edit} onChange={(checked)=>quickUpdatePermissionHandler(record, checked)}/></Flex>)
        },
        {
            title: 'Роль',
            dataIndex: 'role',
            key: 'role',
            render: (value, record) => (<div>{getRussianRole(record.role)}</div>),
            filters: permissions?.reduce((acc: { text: string, value: string }[], user: TablePermissionsModel) => {
                if (acc.find((g: { text: string, value: string }) => g.text === user.role) === undefined)
                    return acc.concat({text: user.role, value: user.role});
                return acc;
            }, []),
            onFilter: (value: any, record: TablePermissionsModel) => {
                return record.role.indexOf(value) === 0
            },
            filterSearch: true
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Button size={'small'} onClick={() => {
                    setIsVisibleEditUserPermissionModal(true);
                    setSelectedPermission(record);
                }}>Изменить</Button>
                {(currentUser?.username != record.user.username) &&
                    <Popconfirm title={`Вы точно хотите удалить доступ пользователя ${record.user.username}?`}
                                onConfirm={() => deletePermissionHandler(record.id)}
                    >
                        <Button size={'small'} danger>Удалить</Button>
                    </Popconfirm>
                }
            </Flex>
        },
    ];
    // -----

    return (
        <Flex gap={'small'} vertical>
            {isVisibleRowValuePermission &&
            <EditRowValuePermission visible={isVisibleRowValuePermission} setVisible={setIsVisibleRowValuePermission}  tableId={id ?? "0"}/>}
            {(isVisibleEditUserPermissionModal && selectedPermission) &&
                <EditUserPermission permission={selectedPermission}
                                    refresh={() => getPermissionByTableId(id ?? "0")}
                                    visible={isVisibleEditUserPermissionModal}
                                    setVisible={setIsVisibleEditUserPermissionModal}/>}
            {isVisibleAddUserModal &&
                <AddUserModal
                    id={999}
                    type={'table'}
                    refresh={() => getPermissionByTableId(id ?? "0")}
                    visible={isVisibleAddUserModal}
                    setVisible={setIsVisibleAddUserModal}/>}
            <Title level={5}>Права доступа пользователей</Title>
            <Flex gap="small" align="center">
                <Text type="secondary">Управление:</Text>
                <Dropdown menu={{ items: items }} placement="bottomRight" trigger={['click']}>
                    <Button size="small">
                        Выберите действие <DownOutlined />
                    </Button>
                </Dropdown>
            </Flex>
            <Table
                columns={permissionsTableColumns}
                dataSource={permissionsTableData}
                loading={isLoadingGetPermissionByTableId || isLoadingDeleteTablePermission}
                bordered
            />
        </Flex>
    )
}