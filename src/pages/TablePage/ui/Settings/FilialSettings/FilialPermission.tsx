import {Button, Flex, Popconfirm, Table, TableProps, Typography} from "antd";
import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {FilialModel} from "entities/FilialModel";
import {AddFilialModal} from "pages/TablePage/ui/AddFilialModal";
import {RowFilialPermissionsModel} from "entities/RowFilialPermissionsModel";
import {PermissionModel} from "entities/PermissionModel";

const {Text} = Typography;

type ModalProps = {

    id: number;
    type: string; // table column row

    // Получение прав
    getPermissions: Function;
    permissions: RowFilialPermissionsModel[] | PermissionModel[] | undefined;
    isPermissionsLoading: boolean;
    // -----

    // Удаление прав
    deletePermission: Function;
    isDeletePermissionLoading: boolean;
    isSuccessDeletePermission: boolean;
    // -----

}

export const FilialPermission = (props: ModalProps) => {

    // Store
    const filials = useSelector((state: RootStateType) => state.currentUser.filials);
    // -----

    // States
    const [permissionsData, setPermissionsData] = useState<RowFilialPermissionsModel[] | PermissionModel[]>([]);
    const [isVisibleAddFilialModal, setIsVisibleAddFilialModal] = useState(false);
    // -----

    // Effects
    useEffect(() => {
        props.getPermissions(props.id);
    }, []);
    useEffect(() => {
        if (props.permissions) setPermissionsData(props.permissions);
    }, [props.permissions]);
    useEffect(() => {
        if (props.isSuccessDeletePermission) props.getPermissions(props.id);
    }, [props.isSuccessDeletePermission]);
    // -----

    // Handlers
    const deleteFilialPermissionHandler = (permissionId: number) => {
        props.deletePermission(permissionId);
    }
    // -----

    // Columns
    const permissionsFilialTableColumns: TableProps<RowFilialPermissionsModel | PermissionModel>['columns'] = [
        {
            title: 'ИД',
            dataIndex: 'id',
            key: 'id',
            sorter: (a, b) => (a.id && b.id) ? a.id - b.id : 0,
            sortDirections: ['descend', 'ascend'],
            defaultSortOrder: 'descend',
        },
        {
            title: 'Филиал',
            dataIndex: 'filial',
            key: 'filial',
            render: (value, record:PermissionModel) => (<div>{filials.find((f:FilialModel) => f.id == record.filial_id)?.name}</div>)
        },
        {
            title: '',
            dataIndex: 'actions',
            key: 'actions',
            render: (value, record:PermissionModel) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Popconfirm title={`Вы точно хотите удалить доступ филиала ${filials.find((f:FilialModel) => f.id == record.filial_id)?.name}?`}
                            onConfirm={() => deleteFilialPermissionHandler(record.id)}
                >
                    <Button size={'small'} danger>Удалить</Button>
                </Popconfirm>
            </Flex>
        },
    ];
    // -----

    return (
        <Flex gap={'small'} vertical>
            {isVisibleAddFilialModal && <AddFilialModal
                visible={isVisibleAddFilialModal}
                setVisible={setIsVisibleAddFilialModal}
                refresh={()=>props.getPermissions(props.id)}
                id={props.id}
                type={props.type}
            />}
            <Text>Права доступа филиалов</Text>
            <Button size={'small'} style={{width: 205}} onClick={() => setIsVisibleAddFilialModal(true)}>Добавить филиал</Button>
            <Table
                columns={permissionsFilialTableColumns}
                dataSource={permissionsData}
                loading={props.isPermissionsLoading || props.isDeletePermissionLoading}
                bordered
            />
        </Flex>
    )
}
