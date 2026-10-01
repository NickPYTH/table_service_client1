import React, {useEffect, useState} from "react";
import {Button, Flex, Modal, Select, Typography} from "antd";
import {columnAPI} from "service/ColumnService";
import {ColumnModel} from "entities/ColumnModel";
import {useParams} from "react-router-dom";

const {Text} = Typography;

type PropsType = {
    visible: boolean,
    setVisible: (v:boolean)=>void,
}

export const AddPrivilegeByColumn = (props:PropsType) => {

    // Params
    const {id} = useParams();
    // -----

    // States
    const [columns, setColumns] = useState<ColumnModel[]>([]);
    const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
    // -----

    // Web requests
    const [getTableColumns, {
        data: columnsFromRequest,
        isLoading: isTableColumnsLoading
    }] = columnAPI.useGetAllByTableIdMutation();
    const [setPermissions, {
        isLoading: isSetPermissionLoading
    }] = columnAPI.useSetPermissionsMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id)
            getTableColumns(id);
    }, []);
    useEffect(() => {
        if (columnsFromRequest) {
            setColumns(columnsFromRequest);
        }
    }, [columnsFromRequest]);
    // -----

    // Handlers
    const selectColumnIdHandler = (id:number) => {
        setSelectedColumnId(id);
    }
    const setPermissionsHandler = () => {
        if (selectedColumnId)
            setPermissions(selectedColumnId);
    }
    // -----

    return(
        <Modal title={"Выдача прав"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'750px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <Flex style={{width: '100%'}} gap={'small'} justify={'space-between'} align={'center'}>
                    <Text>Выберите колонку со списком кодов филиалов</Text>
                    <Select
                        value={selectedColumnId}
                        placeholder={"Выберите колонку"}
                        style={{width: 300}}
                        onChange={selectColumnIdHandler}
                        options={columns.map((column: ColumnModel) => ({label: column.name, value: column.id}))}
                        allowClear={true}
                        showSearch
                        filterOption={(inputValue, option) => (option?.label.toLowerCase() ?? '').includes(inputValue.toLowerCase())}
                        filterSort={(optionA, optionB) => (optionA?.label ?? '').toLowerCase().localeCompare((optionB?.label ?? '').toLowerCase())}
                    />
                </Flex>
                <Button loading={isSetPermissionLoading} disabled={!selectedColumnId} style={{width: 120}} onClick={setPermissionsHandler}>Запустить</Button>
            </Flex>
        </Modal>
    )
}