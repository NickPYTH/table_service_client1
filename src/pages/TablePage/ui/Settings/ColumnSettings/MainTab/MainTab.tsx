import {Button, Checkbox, Divider, Flex, Input, InputNumber, Popconfirm, Popover, Select} from "antd";
import {SelectTypeList} from "../SelectTypeList";
import {columnAPI} from "service/ColumnService";
import {useParams} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {ColumnModel} from "entities/ColumnModel";
import {GridColDef} from "@mui/x-data-grid-premium";
import {TableContext} from "pages/TablePage/ui/TablePage";
import {useNotification} from "app/providers/NotificationProvider/ui/NotificationProvider";
import TextArea from "antd/es/input/TextArea";

enum ColumnType {
    TEXT = 'TEXT',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    DATE = 'DATE',
    DATETIME = 'DATETIME',
    SELECT = 'SELECT',
    AUTO = 'AUTO',
    FILE = 'FILE'
}

type PropsType = {
    columnId: number | null;
    setVisible: Function;
    refresh: Function;
}

export const MainTab = (props:PropsType) => {

    // Notification context
    const notification = useNotification();
    // -----

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // States
    let {id} = useParams();
    const [columnName, setColumnName] = useState("");
    const [generalFormula, setGeneralFormula] = useState("");
    const [columnType, setColumnType] = useState<ColumnType>(ColumnType.TEXT);
    const [selectedColumnsIds, setSelectedColumnsIds] = useState<number[]>([]);
    const [counterDefaultValue, setCounterDefaultValue] = useState(1);
    const [mode, setMode] = useState(false);
    const [defaultValue, setDefaultValue] = useState("");
    const [defaultValueFromUserFilialCode, setDefaultValueFromUserFilialCode] = useState(false);
    const [defaultValueFromPrevRow, setDefaultValueFromPrevRow] = useState(false);
    const [available_if_confirm_mode_enabled, setAvailable_if_confirm_mode_enabled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [required, setRequired] = useState(false);
    // -----

    // Web requests
    const [getColumn, {
        data: column,
    }] = columnAPI.useGetMutation();
    const [updateGeneralFormula, {
        isSuccess: isUpdateGeneralFormulaByColumnSuccess,
    }] = columnAPI.useUpdateGeneralFormulaByColumnMutation();
    const [createColumn, {
        isSuccess: createColumnSuccess,
        isError: isCreateColumnError,
    }] = columnAPI.useCreateMutation();
    const [patchColumn, {
        isSuccess: patchColumnSuccess,
        isError: isPatchColumnError,
    }] = columnAPI.usePatchMutation();
    const [deleteColumn, {
        isSuccess: deleteColumnSuccess,
        isError: isDeleteColumnError,
    }] = columnAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        if (props.columnId) getColumn(props.columnId);
    }, [props.columnId]);
    useEffect(() => {
        if (column) {
            setColumnName(column.name);
            setColumnType(column.data_type == 'text' ? ColumnType.TEXT :
                column.data_type == 'integer' ? ColumnType.INTEGER :
                    column.data_type == 'float' ? ColumnType.FLOAT :
                        column.data_type == 'date' ? ColumnType.DATE :
                            column.data_type == 'datetime' ? ColumnType.DATETIME :
                                column.data_type == 'select' ? ColumnType.SELECT :
                                    column.data_type == 'auto' ? ColumnType.AUTO :
                                        column.data_type == 'file' ? ColumnType.FILE :
                                            ColumnType.TEXT);
            if (column.related_column_ids.length > 0){
                setSelectedColumnsIds(column.related_column_ids);
                setMode(true);
            }
            if (column.default_value) {
                if (column.data_type == 'auto')
                    setCounterDefaultValue(parseInt(column.default_value));
                else
                    setDefaultValue(column.default_value);
            }
            setDefaultValueFromUserFilialCode(column.default_value_from_user_filial_code);
            setDefaultValueFromPrevRow(column.default_value_from_prev_row);
            setAvailable_if_confirm_mode_enabled(column.available_if_confirm_mode_enabled);
            setHidden(column.hidden);
            setDisabled(column.disabled);
            setRequired(column.required);
        }
    }, [column]);
    useEffect(() => {
        if (createColumnSuccess || patchColumnSuccess || deleteColumnSuccess) {
            notification.success({
                message: "Успешно!",
                description: "Настройки обновлены."
            });
            props.setVisible(false);
            props.refresh();
        }
    }, [createColumnSuccess || patchColumnSuccess || deleteColumnSuccess]);
    useEffect(() => {
        if (isDeleteColumnError || isPatchColumnError || isCreateColumnError) {
            notification.success({
                message: "Ой-ой!",
                description: "Произошла ошибка."
            });
            props.setVisible(false);
            props.refresh();
        }
    }, [isDeleteColumnError || isPatchColumnError || isCreateColumnError]);
    useEffect(() => {
        if (isUpdateGeneralFormulaByColumnSuccess){
            //document.location.reload();
        }
    }, [isUpdateGeneralFormulaByColumnSuccess])
    // -----

    // Handlers
    const updateColumnNameHandler = (value: string) => {
        setColumnName(value);
    };
    const updateGeneralFormulaHandler = () => {
        if (generalFormula.length > 3 && props.columnId) {
            updateGeneralFormula({
                column_id: props.columnId,
                formula: generalFormula
            });
        }
    };
    const updateColumnTypeHandler = (value: ColumnType) => {
        setColumnType(value);
    };
    const createColumnHandler = () => {
        if (columnName && columnType) {
            let column: ColumnModel = {
                name: columnName,
                data_type: columnType.toLowerCase(),
                table: id,
                related_column_ids: selectedColumnsIds,
                default_value: defaultValueFromPrevRow ? "" : columnType == ColumnType.AUTO ? counterDefaultValue.toString() : defaultValue,
                default_value_from_user_filial_code: defaultValueFromUserFilialCode,
                default_value_from_prev_row: defaultValueFromPrevRow,
                available_if_confirm_mode_enabled,
                hidden,
                disabled,
                required
            }
            createColumn(column);
        }
    };
    const patchColumnHandler = () => {
        if (columnName && columnType && props.columnId) {
            let column: ColumnModel = {
                name: columnName,
                data_type: columnType.toLowerCase(),
                related_column_ids: selectedColumnsIds,
                default_value: columnType == ColumnType.AUTO ? counterDefaultValue.toString() : defaultValue,
                available_if_confirm_mode_enabled,
                hidden,
                disabled,
                default_value_from_user_filial_code: defaultValueFromUserFilialCode,
                default_value_from_prev_row: defaultValueFromPrevRow,
                required
            }
            patchColumn({id: props.columnId, body: column});
        }
    };
    const deleteColumnHandler = () => {
        if (props.columnId) deleteColumn(props.columnId);
    };
    const saveHandler = () => {
        if (props.columnId)
            patchColumnHandler();
        else
            createColumnHandler();
    };
    // -----

    return (
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
                <div style={{width: 100}}>Тип колонки</div>
                <Select
                    value={columnType}
                    placeholder={"Выберите тип колонки"}
                    style={{width: '100%'}}
                    onChange={updateColumnTypeHandler}
                    options={Object.keys(ColumnType).map((type: string) => ({
                        value: type, label: type == ColumnType.TEXT ? "Текст" :
                            type == ColumnType.INTEGER ? "Целое" :
                                type == ColumnType.FLOAT ? "Дробное" :
                                    type == ColumnType.DATE ? "Дата" :
                                        type == ColumnType.DATETIME ? "Дата и время" :
                                            type == ColumnType.AUTO ? "Автоинкремент" :
                                                type == ColumnType.SELECT ? "Список" :
                                                    type == ColumnType.FILE ? "Файл" :
                                                        ""
                    }))}
                />
            </Flex>
            {columnType == ColumnType.TEXT &&
                <Flex align={'center'} gap={'small'}>
                    <Flex vertical gap={'small'}>
                        <Popover content={"Выполнится заполнение формулой всего столбца начиная с 1 строки, все индексы в формуле будут идти строго с 1"}>
                            <div style={{width: 120}}>Общая формула</div>
                        </Popover>
                        <Popconfirm title={"Вы точно хотите заполнить столбец обновленной формулой"} okText={"Да, точно"} onConfirm={updateGeneralFormulaHandler}>
                            <Button size={'small'} style={{width: 120}}>Применить</Button>
                        </Popconfirm>
                    </Flex>
                    <TextArea
                        placeholder={"Введите формулу"}
                        value={generalFormula}
                        onChange={(e) => setGeneralFormula(e.target.value)}
                    />
                </Flex>
            }
            {columnType == ColumnType.AUTO &&
                <>
                    <Flex align={"center"} justify={'space-between'}>
                        <div style={{width: 500}}>Увеличение счетчика с учетом уникальности значений в колонках</div>
                        <Checkbox checked={mode} onChange={(e) => setMode(e.target.checked)}/>
                    </Flex>
                    <Flex align={"center"}>
                        <div style={{width: 500}}>Значение счетчика по-умолчанию</div>
                        <InputNumber value={counterDefaultValue} onChange={(num) => setCounterDefaultValue(num == null ? 0 : num)}/>
                    </Flex>
                    {mode &&
                        <Flex align={'center'} gap={'small'}>
                            <div style={{width: 100}}>Колонки</div>
                            <Select
                                mode={'multiple'}
                                value={selectedColumnsIds}
                                placeholder={"Выберите колонки"}
                                style={{width: '100%'}}
                                onChange={(val) => setSelectedColumnsIds(val)}
                                options={tableContext?.columns?.map((column:GridColDef) => ({value: parseInt(column.field), label: column.headerName}))}
                            />
                        </Flex>
                    }
                </>
            }
            {(columnType == ColumnType.SELECT && props.columnId) &&
                <SelectTypeList columnId={props.columnId}/>
            }
            {(columnType != ColumnType.AUTO && columnType != ColumnType.SELECT) &&
                <>
                    <Divider />
                    <Flex align={'center'} gap={'small'} justify={'space-between'}>
                        <div style={{width: 500}}>Код филиала работника по-умолчанию</div>
                        <Checkbox checked={defaultValueFromUserFilialCode} onChange={(e) => {
                            setDefaultValueFromPrevRow(false);
                            setDefaultValueFromUserFilialCode(e.target.checked);
                            setDefaultValue('');
                        }}/>
                    </Flex>
                    <Flex align={'center'} gap={'small'} justify={'space-between'}>
                        <div style={{width: 500}}>Значение по-умолчанию из предыдущей строки <strong>(Если предыдущая строка формула, то сработает автоинкремент на номера строк)</strong></div>
                        <Checkbox checked={defaultValueFromPrevRow} onChange={(e) => {
                            setDefaultValueFromUserFilialCode(false);
                            setDefaultValueFromPrevRow(e.target.checked);
                            setDefaultValue('');
                        }}/>
                    </Flex>
                    <Flex align={'center'} gap={'small'} justify={'space-between'}>
                        <div style={{width: 250}}>Значение по-умолчанию</div>
                        <TextArea disabled={defaultValueFromPrevRow || defaultValueFromUserFilialCode} value={defaultValue} onChange={(e) => setDefaultValue(e.target.value)}/>
                    </Flex>
                    <Divider />
                </>
            }
            {tableContext?.withCellConfirm &&
                <Flex align={"center"} justify={'space-between'}>
                    <div style={{width: 500}}>Доступно для многократного редактирования в режиме с подтверждением</div>
                    <Checkbox checked={available_if_confirm_mode_enabled} onChange={(e) => setAvailable_if_confirm_mode_enabled(e.target.checked)}/>
                </Flex>
            }
            <Flex align={"center"} justify={'space-between'}>
                <div style={{width: 500}}>Скрытая колонка</div>
                <Checkbox checked={hidden} onChange={(e) => setHidden(e.target.checked)}/>
            </Flex>
            <Flex align={"center"} justify={'space-between'}>
                <div style={{width: 500}}>Запрет на редактирование</div>
                <Checkbox checked={disabled} onChange={(e) => setDisabled(e.target.checked)}/>
            </Flex>
            <Flex align={"center"} justify={'space-between'}>
                <div style={{width: 500}}>Обязательная для заполнения колонка</div>
                <Checkbox checked={required} onChange={(e) => setRequired(e.target.checked)}/>
            </Flex>
            <Flex gap={'small'} justify={'end'}>
                {props.columnId &&
                    <Popconfirm title={"Вы уверены что хотите удалить столбец?"} onConfirm={deleteColumnHandler}>
                        <Button style={{width: 120}} danger>Удалить</Button>
                    </Popconfirm>
                }
                <Button style={{width: 120}} onClick={saveHandler}>{props.columnId ? "Сохранить" : "Добавить"}</Button>
            </Flex>
        </Flex>
    )
}
