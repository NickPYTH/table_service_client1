import React, {useContext, useEffect, useState} from 'react';
import {Button, Checkbox, Flex, Input, Modal, Popconfirm, Select} from 'antd';
import {useParams} from "react-router-dom";
import {columnAPI} from "service/ColumnService";
import {ColumnModel} from "entities/ColumnModel";
import {TableContext} from "pages/TablePage/ui/TablePage";

enum ColumnType {
    TEXT = 'TEXT',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    BOOLEAN = 'BOOLEAN',
    DATE = 'DATE'
}

type ModalProps = {
    id: number | null,
    visible: boolean,
    setVisible: Function,
    refresh: Function
}

export const ColumnSettingsModal = (props: ModalProps) => {

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // States
    let {id} = useParams();
    const [columnName, setColumnName] = useState("");
    const [columnType, setColumnType] = useState<ColumnType>(ColumnType.TEXT);
    const [isRequired, setIsRequired] = useState(false);
    // -----

    // Web requests
    const [getColumn, {
        data: column,
        isLoading: isGetColumnLoading
    }] = columnAPI.useGetMutation();
    const [createColumn, {
        isSuccess: createColumnSuccess,
        isLoading: isCreateColumnLoading
    }] = columnAPI.useCreateMutation();
    const [patchColumn, {
        isSuccess: patchColumnSuccess,
        isLoading: isPatchColumnLoading
    }] = columnAPI.usePatchMutation();
    const [deleteColumn, {
        isSuccess: deleteColumnSuccess,
        isLoading: isDeleteColumnLoading
    }] = columnAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        if (props.id) getColumn(props.id);
    }, [props.id]);
    useEffect(() => {
        if (column) {
            setColumnName(column.name);
            setColumnType(column.data_type == 'text' ? ColumnType.TEXT :
                column.data_type == 'integer' ? ColumnType.INTEGER :
                column.data_type == 'float' ? ColumnType.FLOAT :
                column.data_type == 'date' ? ColumnType.DATE :
                column.data_type == 'boolean' ? ColumnType.BOOLEAN :
                ColumnType.TEXT);
        }
    }, [column]);
    useEffect(() => {
        if (createColumnSuccess || patchColumnSuccess || deleteColumnSuccess) {
            props.setVisible(false);
            props.refresh();
        }
    }, [createColumnSuccess || patchColumnSuccess || deleteColumnSuccess]);
    // -----

    // Handlers
    const updateColumnNameHandler = (value: string) => {
        setColumnName(value);
    };
    const updateColumnTypeHandler = (value: ColumnType) => {
        setColumnType(value);
    };
    const updateIsRequiredHandler = (value: boolean) => {
        setIsRequired(value)
    };
    const createColumnHandler = () => {
        if (columnName && columnType) {
            let column: ColumnModel = {
                name: columnName,
                data_type: columnType.toLowerCase(),
                table: id
            }
            createColumn(column);
        }
    };
    const patchColumnHandler = () => {
        if (columnName && columnType && props.id) {
            let column: ColumnModel = {
                name: columnName,
                data_type: columnType.toLowerCase(),
            }
            patchColumn({id: props.id, body: column});
        }
    };
    const deleteColumnHandler = () => {
        if (props.id) deleteColumn(props.id);
    };
    // -----

    return (
        <Modal title={props.id ? "Редактировать столбец" : "Добавить столбец"}
               maskClosable={false}
               open={props.visible}
               onOk={props.id ? patchColumnHandler : createColumnHandler}
               onCancel={() => props.setVisible(false)}
               okText={props.id ? "Сохранить" : "Добавить"}
               width={'500px'}
               loading={isCreateColumnLoading || isPatchColumnLoading || isDeleteColumnLoading}
               confirmLoading={isCreateColumnLoading || isPatchColumnLoading || isDeleteColumnLoading}
               footer={() => (
                   <Flex gap={'small'} justify={'flex-end'}>
                       <Button onClick={props.id ? patchColumnHandler : createColumnHandler}>
                           {props.id ? "Сохранить" : "Добавить"}
                       </Button>
                       <Button onClick={() => props.setVisible(false)}>Отменить</Button>
                       {props.id &&
                           <Popconfirm title={"Удалить столбец?"} okText={"Да"} onConfirm={deleteColumnHandler}>
                               <Button danger>Удалить</Button>
                           </Popconfirm>
                       }
                   </Flex>
               )}
        >
            <Flex gap={'small'} vertical>
                <Flex align={'center'} gap={'small'}>
                    <div style={{width: 100}}>Название</div>
                    <Input
                        placeholder={"Название столбца"}
                        value={columnName}
                        onChange={(e) => updateColumnNameHandler(e.target.value)}
                    />
                </Flex>
                <Flex align={'center'} gap={'small'}>
                    <div style={{width: 100}}>Тип колнки</div>
                    <Select
                        value={columnType}
                        placeholder={"Выберите тип колонки"}
                        style={{width: '100%'}}
                        onChange={updateColumnTypeHandler}
                        options={Object.keys(ColumnType).map((type: string) => ({
                            value: type, label: type == ColumnType.TEXT ? "Текст" :
                                type == ColumnType.INTEGER ? "Целое" :
                                    type == ColumnType.FLOAT ? "Дробное" :
                                        type == ColumnType.BOOLEAN ? "Логическое" :
                                            type == ColumnType.DATE ? "Дата" : ""
                        }))}
                    />
                </Flex>
                <Flex align={'center'} gap={'small'}>
                    <div style={{width: 270}}>Обязательный для заполнения стобец</div>
                    <Checkbox style={{marginTop: 2.5}} checked={isRequired} onChange={(e) => updateIsRequiredHandler(e.target.checked)}/>
                </Flex>
            </Flex>
        </Modal>
    );
};
