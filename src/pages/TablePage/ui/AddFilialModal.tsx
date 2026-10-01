import React, {useEffect, useState} from 'react';
import {Button, Flex, Modal, Table, TableProps} from 'antd';
import {useParams} from "react-router-dom";
import {tableFilialPermissionsAPI} from "service/TableFilialPermissionsService";
import {FilialModel} from "entities/FilialModel";
import {filialAPI} from "service/FilialService";
import {rowFilialPermissionsAPI} from "service/RowFilialPermissionsService";
import {columnFilialPermissionsAPI} from "service/ColumnFilialPermissionsService";

type ModalProps = {
    visible: boolean,
    setVisible: Function,
    refresh: Function,
    type: string,
    id?: number
}

export const AddFilialModal = (props: ModalProps) => {

    // States
    let {id} = useParams();
    const [filials, setFilials] = useState<FilialModel[]>([]);
    // -----

    // Web requests
    const [getFilialsByTableId, {
        data: filialsByTableId,
        isLoading: isFilialsByTableIdLoading
    }] = filialAPI.useGetAllByTableIdMutation();
    const [getFilialsByRowId, {
        data: filialsByRowId,
        isLoading: isFilialsByRowIdLoading
    }] = filialAPI.useGetAllByRowIdMutation();
    const [getFilialsByColumnId, {
        data: filialsByColumnId,
        isLoading: isFilialsByColumnIdLoading
    }] = filialAPI.useGetAllByColumnIdMutation();
    const [createTableFilialPermission, {
        isSuccess: isSuccessCreateTableFilialPermissions,
        isLoading: isLoadingCreateTableFilialPermissions
    }] = tableFilialPermissionsAPI.useCreateMutation();
    const [createRowFilialPermission, {
        isSuccess: isSuccessCreateRowFilialPermissions,
        isLoading: isLoadingCreateRowFilialPermissions
    }] = rowFilialPermissionsAPI.useCreateMutation();
    const [createColumnFilialPermission, {
        isSuccess: isSuccessCreateColumnFilialPermissions,
        isLoading: isLoadingCreateColumnFilialPermissions
    }] = columnFilialPermissionsAPI.useCreateMutation();
    // -----

    // Effects
    useEffect(() => {
        if (props.type == 'table') {
            if (id) getFilialsByTableId(id);
        } else if (props.type == 'row') {
            if (props.id) getFilialsByRowId(props.id);
        } else if (props.type == 'column') {
            if (props.id) getFilialsByColumnId(props.id);
        }
    }, []);
    useEffect(() => {
        if (filialsByTableId) setFilials(filialsByTableId);
    }, [filialsByTableId]);
    useEffect(() => {
        if (filialsByRowId) setFilials(filialsByRowId);
    }, [filialsByRowId]);
    useEffect(() => {
        if (filialsByColumnId) setFilials(filialsByColumnId);
    }, [filialsByColumnId]);
    useEffect(() => {
        if (isSuccessCreateTableFilialPermissions || isSuccessCreateRowFilialPermissions || isSuccessCreateColumnFilialPermissions) {
            props.setVisible(false);
            props.refresh();
        }
    }, [isSuccessCreateTableFilialPermissions || isSuccessCreateRowFilialPermissions || isSuccessCreateColumnFilialPermissions]);
    // -----

    // Handlers
    const createTableFilialPermissionHandler = (userId: number) => {
        if (id) createTableFilialPermission({userId, tableId: id});
    }
    const createRowFilialPermissionHandler = (filialId: number) => {
        if (props.id) {
            createRowFilialPermission({filial: filialId, row: props.id});
        }
    }
    const createColumnFilialPermissionHandler = (filialId: number) => {
        if (props.id && id) {
            createColumnFilialPermission({filial: filialId, column: props.id, table: parseInt(id)});
        }
    }
    // -----

    // Columns
    const columns: TableProps<FilialModel>['columns'] = [
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
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: '',
            dataIndex: 'action',
            key: 'action',
            render: (value, record) => <Flex style={{width: '100%', margin: 2}} justify={'center'} gap={'small'}>
                <Button size={'small'} onClick={() => props.type == 'row' ?
                    createRowFilialPermissionHandler(record.id) :
                    props.type == 'column' ? createColumnFilialPermissionHandler(record.id)
                        :
                        createTableFilialPermissionHandler(record.id)}>Добавить</Button>
            </Flex>
        },
    ];
    // -----

    return (
        <Modal title={"Выбор филиала"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'600px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <Table
                    columns={columns}
                    dataSource={filials}
                    loading={isFilialsByTableIdLoading || isFilialsByRowIdLoading || isLoadingCreateTableFilialPermissions || isLoadingCreateRowFilialPermissions}
                    bordered
                    pagination={{
                        pageSize: 30
                    }}
                />
            </Flex>
        </Modal>
    );
};
