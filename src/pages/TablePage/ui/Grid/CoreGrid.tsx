import {DataGridPremium, GridCellParams, gridClasses, GridColDef, GridFilterModel, GridSortModel, useGridApiRef} from "@mui/x-data-grid-premium";
import {ruRU} from '@mui/x-data-grid-premium/locales';
import {useCallback, useContext, useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {columnAPI} from "service/ColumnService";
import {rowAPI} from "service/RowService";
import {ColumnModel} from "entities/ColumnModel";
import {CellModel} from "entities/CellModel";
import {RowModel} from "entities/RowModel";
import {Cell} from "pages/TablePage/ui/Grid/Cell";
import {TableContext, TableContextType} from "pages/TablePage/ui/TablePage";
//@ts-ignore
import {debounce} from "lodash";
import {ColumnMenu} from "./ColumnMenu";
import {Button, Flex, Popconfirm} from "antd";
import {DeleteRowOutlined, SettingOutlined} from "@ant-design/icons";
import dayjs, {Dayjs} from "dayjs";

type PropsType = {
    wsCellLocks: WebSocket | null,
    wsCellsUpdate: WebSocket | null,
    setContext: Function
};

function formatDate(date:Date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
}

function isValidDateString(dateString: string) {
    const date = new Date(dateString.replace(".", "-"));
    //@ts-ignore
    return date instanceof Date && !isNaN(date);
}

export const CoreGrid = (props: PropsType) => {

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // Params
    let {id} = useParams();
    // -----

    // States
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: tableContext ? tableContext.pageSize : 50,
        page: 0,
    });
    const [sortModel, setSortModel] = useState<GridSortModel>([]);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({
        items: [],
    });
    // -----

    // Web requests
    const [getTableColumns, {
        data: columnsFromRequest,
        isLoading: isTableColumnsLoading
    }] = columnAPI.useGetAllByTableIdMutation();
    const [getTableData, {
        data: tableData,
        isError: isErrorTableData,
        isLoading: isTableDataLoading
    }] = rowAPI.useGetAllByTableIdMutation();
    const [getTableDataWithColumnFilter, {
        data: tableDataWithColumnFilter,
        isError: isErrorTableDataWithColumnFilter,
        isLoading: isTableDataWithColumnFilterLoading
    }] = rowAPI.useGetAllByTableIdWithColumnFilterMutation();
    const [deleteRow, {}] = rowAPI.useDeleteMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) getTableColumns(id);
    }, []);
    useEffect(() => {
        if (columnsFromRequest && id) {
            const columns: GridColDef[] = columnsFromRequest.map((column: ColumnModel) => {
                //console.log(column.data_type)
                return {
                    field: column.id ? column.id.toString() : "999",
                    headerName: column.name,
                    editable: true,
                    width: 200,
                    type: column.data_type == 'text' ? 'string' :
                        column.data_type == 'integer' ? 'number' :
                            column.data_type == 'float' ? 'number' :
                                column.data_type == 'date' ? 'date' :
                                    column.data_type == 'boolean' ? 'singleSelect' :
                                        'string',
                    valueGetter: (params: CellModel) => {
                        if (params.value == null)
                            return "";
                        if (typeof params.value == "object") {
                            // Встретили дату
                            params.value as Date;
                            return formatDate(params.value);
                        }
                        else {
                            // Если тип данных колонки явно указан - Дата. Следует проверить не является ли датой ячейка
                            if (column.data_type == 'date'){
                                if (isValidDateString(params.value)) return new Date(params.value.replace('.','-'));
                            }
                            // -----
                            return params.value;
                        }
                    },
                    valueSetter: (value, row) => {
                        let rowCopy = JSON.parse(JSON.stringify(row));
                        rowCopy[column.id ?? 0].value = value;
                        return rowCopy;
                    },
                    valueFormatter: (params: string | Date) => {
                        if (params == null)
                            return "";
                        if (typeof params == "object") {
                            // Встретили дату
                            params as Date;
                            return formatDate(params);
                        }
                        else
                            return params;
                    },
                    renderCell: (params) => {
                        return <Cell row={params.row} column={column} formattedValue={params.formattedValue}/>
                    },
                    groupable: false,
                    aggregable: false
                }
            });
            let actionColumn: GridColDef = {
                field: "action",
                headerName: "",
                width: 50,
                groupable: false,
                aggregable: false,
                sortable: false,
                filterable: false,
                renderCell: (data) => (<Flex style={{height: '100%'}} gap={'small'} align={'center'} justify={'center'}>
                    <Button size={'small'} icon={<SettingOutlined/>} onClick={() => {
                        if (tableContext) {
                            tableContext.setIsVisibleRowSettingsModal(true);
                            tableContext.setSelectedRowId(data.row.id);
                        }
                    }}/>
                    <Popconfirm title={"Вы точно хотите удалить строку?"} okText={"Да"} onConfirm={() => {
                        deleteRow(data.row.id);
                        props.setContext((prev: TableContextType) => ({
                            ...prev,
                            rows: prev.rows.filter((row) => row.id != data.row.id)
                        }));
                    }}>
                        <Button size={'small'} danger icon={<DeleteRowOutlined/>}/>
                    </Popconfirm>
                </Flex>)
            }
            columns.push(actionColumn);
            props.setContext((prev: TableContextType) => ({...prev, columns}));
            // Отправляю запрос на получение данных
            getTableData({tableId: id, page: ++paginationModel.page, limit: paginationModel.pageSize});
            // -----
        }
    }, [columnsFromRequest]);
    useEffect(() => {
        if (tableData) {
            // Формирование датасета
            const rowsForTable = tableData.results.map((row: RowModel) => {
                let item: any = {};
                item.id = row.id;
                // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                row.cells_list.forEach((cell: CellModel) => {
                    if (cell.column) item[cell.column] = cell;
                });
                // -----
                return item;
            });
            props.setContext((prevState: TableContextType) => ({...prevState, rows: rowsForTable}));
            // -----
        }
    }, [tableData]);
    useEffect(() => {
        if (tableDataWithColumnFilter) {
            // Формирование датасета
            const rowsForTable = tableDataWithColumnFilter.results.map((row: RowModel) => {
                let item: any = {};
                item.id = row.id;
                // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                row.cells_list.forEach((cell: CellModel) => {
                    if (cell.column) item[cell.column] = cell;
                });
                // -----
                return item;
            });
            props.setContext((prevState: any) => ({...prevState, rows: rowsForTable}));
            // -----
        }
    }, [tableDataWithColumnFilter]);
    useEffect(() => {
        // Для перелистывания
        if (paginationModel && id)
            getTableData({tableId: id, page: paginationModel.page+1, limit: paginationModel.pageSize});
    }, [paginationModel]);
    // -----

    // Handler
    const onCellEditStartHandler = (params: GridCellParams) => {
        // Создаем блокировку на сервере
        if (props.wsCellLocks) {
            let cellId: number = params.row[params.field].id;
            props.wsCellLocks.send(JSON.stringify({cell_id: cellId, type: 'create', user_id: currentUser?.id}));
        }
        // -----
    };
    const onCellEditStopHandler = (params: GridCellParams) => {
        setTimeout(() => {
            // Ебаный костыль из-за асинхронного обновления грида
            const actualValue = apiRef.current.getCellValue(params.id, params.field);
            // Обновляем значение ячейки на сервере
            if (props.wsCellsUpdate) {
                let cellId: number = params.row[params.field].id;
                props.wsCellsUpdate.send(JSON.stringify({cell_id: cellId, type: 'update', value: actualValue ?? ""}));
            }
            // -----
        }, 10);
        // Снимаем блокировку на сервере
        if (props.wsCellLocks) {
            let cellId: number = params.row[params.field].id;
            props.wsCellLocks.send(JSON.stringify({cell_id: cellId, type: 'remove', user_id: currentUser?.id}));
        }
        // -----
    };
    const isCellEditableHandler = (params: GridCellParams) => {
        if (tableContext) {
            return !tableContext.lockedCellsIds.find((lock => lock.cell_id == params.row[params.field].id && currentUser?.id !== lock.user_id));
        }
        return true;
    };
    const debouncedSetFilter = useCallback(
        debounce((params: GridFilterModel) => {
            // Здесь отправка запроса на сервер
            if (id) {
                if (params.items.length != 0) {
                    if (sortModel.length == 0) {
                        getTableDataWithColumnFilter({
                            tableId: id,
                            page: paginationModel.page,
                            limit: paginationModel.pageSize,
                            filters: params.items,
                            mode: params.logicOperator, // and\or
                        });
                    } else {
                        getTableDataWithColumnFilter({
                            tableId: id,
                            page: paginationModel.page,
                            limit: paginationModel.pageSize,
                            filters: params.items,
                            mode: params.logicOperator, // and\or
                            sortField: sortModel[0].field,
                            sortDirection: sortModel[0].sort
                        });
                    }
                } else {
                    if (sortModel.length == 0) {
                        getTableData({
                            tableId: id,
                            page: paginationModel.page,
                            limit: paginationModel.pageSize,
                        });
                    } else {
                        getTableData({
                            tableId: id,
                            page: paginationModel.page,
                            limit: paginationModel.pageSize,
                            sortField: sortModel[0].field,
                            sortDirection: sortModel[0].sort
                        });
                    }
                }
            }
        }, 2000),
        [sortModel]
    );
    const handleFilterChange = (model: GridFilterModel) => {
        setFilterModel(model);
        debouncedSetFilter(model);
    };
    const handleSortChange = (model: GridSortModel) => {
        setSortModel(model);
        if (id) {
            if (model.length != 0) {
                if (filterModel.items.length > 0)
                    getTableDataWithColumnFilter({
                        tableId: id,
                        page: paginationModel.page,
                        limit: paginationModel.pageSize,
                        filters: filterModel.items,
                        mode: filterModel.logicOperator, // and\or
                        sortField: model[0].field,
                        sortDirection: model[0].sort
                    });
                else
                    getTableData({
                        tableId: id,
                        page: paginationModel.page,
                        limit: paginationModel.pageSize,
                        sortField: model[0].field,
                        sortDirection: model[0].sort
                    });
            } else {
                if (filterModel.items.length > 0)
                    getTableDataWithColumnFilter({
                        tableId: id,
                        page: paginationModel.page,
                        limit: paginationModel.pageSize,
                        filters: filterModel.items,
                        mode: filterModel.logicOperator, // and\or
                    });
                else
                    getTableData({
                        tableId: id,
                        page: paginationModel.page,
                        limit: paginationModel.pageSize,
                    });
            }
        }
    };
    // -----
    const apiRef = useGridApiRef();
    return (
        <div style={{height: window.innerHeight - 220, width: '100%'}}>
            <DataGridPremium
                apiRef={apiRef}
                // Настройки пагинации
                pagination
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
                rowCount={tableData?.count}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                onSortModelChange={(model) => handleSortChange(model)}
                onFilterModelChange={(model) => handleFilterChange(model)}
                pageSizeOptions={[25, 50, 100, 200, 300, 400, 500, 600]}
                // -----
                isCellEditable={isCellEditableHandler}
                onCellEditStart={onCellEditStartHandler}
                onCellEditStop={onCellEditStopHandler}
                columnBufferPx={100}
                rowBufferPx={100}
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                rows={tableContext?.rows}
                columns={tableContext ? tableContext.columns : []}
                getRowHeight={() => 'auto'}
                sx={{
                    [`& .${gridClasses.cell}`]: {
                        p: 0,
                    },
                }}
                loading={isTableDataLoading || isTableColumnsLoading}
                slots={{
                    columnMenu: ColumnMenu,
                }}
            />
        </div>
    );
}
