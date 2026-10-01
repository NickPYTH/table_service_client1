import React, {useCallback, useContext, useEffect, useState} from "react";
import {
    GridCellParams,
    GridCellSelectionModel,
    GridColDef,
    GridFilterModel,
    GridLogicOperator,
    GridSortModel,
    useGridApiRef
} from "@mui/x-data-grid-premium";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
//@ts-ignore
import {debounce} from "lodash";
import dayjs from "dayjs";

import {useNotification} from "app/providers/NotificationProvider";
import {RootStateType} from "store/store";
import {columnAPI} from "service/ColumnService";
import {rowAPI} from "service/RowService";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {columnPermissionsAPI} from "service/ColumnPermissionsService";
import {cellAPI} from "service/CellService";
import {ColumnModel} from "entities/ColumnModel";
import {CellModel} from "entities/CellModel";
import {RowModel} from "entities/RowModel";
import {PermissionModel} from "entities/PermissionModel";
import {ROLE} from "shared/config/constants";

import {TableContext} from "pages/TablePage/ui/TablePage"; // todo передавать как пропс
import {DataRowModel, TableContextType} from "pages/TablePage/types";
import {PropsType} from "./types";

export const useCoreGrid = (props:PropsType) => {

    // Notification context
    const notification = useNotification();
    // -----

    // Context
    const tableContext = useContext(TableContext);
    const apiRef:any = useGridApiRef();
    // -----

    // Params
    let {id} = useParams();
    // -----

    // States
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [contextMenu, setContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        rowId: number | null;
        columnId: number | null;
    } | null>(null);
    const [selectedRow, setSelectedRow] = useState<DataRowModel | null>(null);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const [cellEditConfirmModal, setCellEditConfirmModal] = useState({
        visible: false,
        cellId: -1,
        cellValue: "",
        oldCellValue: ""
    });
    const [cellSelectionModel, setCellSelectionModel] = React.useState<GridCellSelectionModel>({});
    const [mainInputValue, setMainInputValue] = useState("");
    const [selectedCell, setSelectedCell] = useState<CellModel | null>(null);
    const [isGridLoading, setIsGridLoading] = useState(false);
    const [insertSelectedValueModalVisible, setInsertSelectedValueModalVisible] = useState(false);
    const [filterModel, setFilterModel] = useState<GridFilterModel>(() => {
        const filterModel = localStorage.getItem(`table_filter_${id}`);
        if (filterModel)
            return JSON.parse(filterModel);
        else
            return {items: []};
    });
    const [sortModel, setSortModel] = useState<GridSortModel>(() => {
        if (currentUser?.username == undefined) return [];
        if (currentUser?.username == 'VahovskiyOV' || currentUser?.username == 'BannikovAY') {
            return [
                {field: "6394", sort: 'asc'},
            ]
        } else {
            const sortModel = localStorage.getItem(`table_sort_${id}`);
            if (sortModel)
                return JSON.parse(sortModel);
            else
                return [];
        }
    });
    // -----

    // Web requests
    const [getTableColumns, {
        data: columnsFromRequest,
        isLoading: isTableColumnsLoading
    }] = columnAPI.useGetAllByTableIdMutation();
    const [getTableData, {
        data: tableData,
        isLoading: isTableDataLoading
    }] = rowAPI.useGetAllByTableIdMutation();
    const [getTableDataWithColumnFilter, {
        data: tableDataWithColumnFilter,
        isLoading: isTableDataWithColumnFilterLoading
    }] = rowAPI.useGetAllByTableIdWithColumnFilterMutation();
    const [deleteRow, {
        isSuccess: isDeleteRowSuccess,
    }] = rowAPI.useDeleteMutation();
    const [getRowPermissions, {
        data: rowsPermissionsFromRequest,
    }] = rowPermissionsAPI.useGetAllByUserIdMutation();
    const [getColumnPermissions, {
        data: columnsPermissionsFromRequest,
    }] = columnPermissionsAPI.useGetAllByTableIdMutation();
    const [updateCell, {
        isLoading: isUpdateCellLoading
    }] = cellAPI.usePatchMutation();
    const [createColumn, {
        isSuccess: createColumnSuccess,
    }] = columnAPI.useCreateMutation();    const [clearRange, {}] = cellAPI.useClearRangeMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) getTableColumns(id);
    }, []);
    useEffect(() => {
        setIsGridLoading(isTableDataLoading || isTableDataWithColumnFilterLoading || isTableColumnsLoading);
    }, [isTableDataLoading || isTableDataWithColumnFilterLoading || isTableColumnsLoading]);
    useEffect(() => {
        if (createColumnSuccess && id) {
            if (id) getTableColumns(id);
        }
    }, [createColumnSuccess]);
    useEffect(() => {
        if (tableData && apiRef.current) {
            // Формирование датасета
            let rowsIds: number[] = [];
            const rowsForTable = tableData.results.map((row: RowModel) => {
                let item: any = {};
                rowsIds.push(row.id);
                item.id = row.id;
                item['order'] = row.order;
                // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                row.cells_list.forEach((cell: CellModel) => {
                    if (cell.column) item[cell.column] = cell;
                });
                // -----
                return item;
            });
            props.setContext((prevState: TableContextType) => ({...prevState, rows: rowsForTable}));
            apiRef.current.setRowCount(tableData.count || 0);
            if (currentUser && id) {
                getRowPermissions({table_id: id, user_id: currentUser.id, rowsIds});
            }
            // -----
        }
    }, [tableData]); // При загрузке данных без фильтров
    useEffect(() => {
        if (tableDataWithColumnFilter && apiRef.current) {
            // Формирование датасета
            let rowsIds: number[] = [];
            const rowsForTable = tableDataWithColumnFilter.results.map((row: RowModel) => {
                let item: any = {};
                rowsIds.push(row.id);
                item.id = row.id;
                item['order'] = row.order;
                rowsIds.push(row.id);
                // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                row.cells_list.forEach((cell: CellModel) => {
                    if (cell.column) item[cell.column] = cell;
                });
                // -----
                return item;
            });
            props.setContext((prevState: TableContextType) => ({...prevState, rows: rowsForTable}));
            apiRef.current.setRowCount(tableDataWithColumnFilter.count || 0);
            if (currentUser && id)
                getRowPermissions({table_id: id, user_id: currentUser.id, rowsIds});
            // -----

        }
    }, [tableDataWithColumnFilter]); // При загрузке данных с фильтрами
    useEffect(() => {
        if (apiRef.current && tableContext?.paginationModel) {
            // Если страница в контексте отличается от страницы в гриде - обновляем
            const currentGridPage = apiRef.current.state.pagination.paginationModel.page;
            if (currentGridPage !== tableContext.paginationModel.page) {
                apiRef.current.setPage(tableContext.paginationModel.page);
            }
        }
    }, [tableContext?.paginationModel.page, apiRef.current]);
    useEffect(() => {
        if (rowsPermissionsFromRequest) {
            props.setContext((prev: TableContextType) => ({...prev, rowPermissions: rowsPermissionsFromRequest}));
        }
    }, [rowsPermissionsFromRequest]);
    useEffect(() => {
        if (columnsPermissionsFromRequest) {
            props.setContext((prev: TableContextType) => ({...prev,
                columnPermissions: columnsPermissionsFromRequest
            }));
        }
    }, [columnsPermissionsFromRequest]);
    useEffect(() => {
        if (isDeleteRowSuccess) {
            notification.success({
                message: "Успешно!",
                description: "Строка удалена."
            });
        }
    }, [isDeleteRowSuccess]);
    useEffect(() => {
        if (Object.keys(cellSelectionModel).length > 0 && tableData && tableContext?.rows) {
            const rows: any = tableContext.rows;
            let rowId: number = parseInt(Object.keys(cellSelectionModel)[0]);
            let colId: number = parseInt(Object.keys(cellSelectionModel[rowId])[0]);

            const selectedRow = rows.find((r: any) => r.id === rowId);
            if (selectedRow && selectedRow[colId]) {
                let cell = selectedRow[colId];

                setMainInputValue(cell.value);
                setSelectedCell(cell);
            }

        }
    }, [cellSelectionModel, tableData, tableContext?.rows]);
    // -----

    // Handlers
    const refreshTable = () => {
        if (tableContext && id) {
            if (sortModel.length > 0) {
                getTableDataWithColumnFilter({
                    tableId: id,
                    page: tableContext.paginationModel.page,
                    limit: tableContext.paginationModel.pageSize,
                    filters: filterModel.items,
                    mode: filterModel.logicOperator,
                    sortField: sortModel.map((sm) => parseInt(sm.field)),
                    sortDirection: sortModel[0]?.sort
                });
            } else {
                getTableData({
                    tableId: id,
                    page: tableContext.paginationModel.page,
                    limit: tableContext.paginationModel.pageSize
                });
            }
        }
    };

    const onCellEditStartHandler = (params: GridCellParams) => {
        // Создаем блокировку на сервере
        if (props.wsCellLocks) {
            let cellId: number = params.row[params.field].id;
            props.wsCellLocks.send(JSON.stringify({cell_id: cellId, type: 'create', user_id: currentUser?.id}));
        }
        // -----
    };
    const onCellEditStopHandler = (params: GridCellParams, event: any) => {
        let cellId: number = params.row[params.field].id;
        let column = columnsFromRequest?.find((c: ColumnModel) => c.id == parseInt(params.field));
        if (tableContext?.withCellConfirm && column?.available_if_confirm_mode_enabled == false) {
            setTimeout(() => {
                let cellValue = apiRef.current.getCellValue(params.id, params.field); // row id and column id
                if (typeof cellValue == 'object') {
                    cellValue = dayjs(cellValue).format("DD.MM.YYYY HH:mm");
                }
                //@ts-ignore
                const oldCellValue = tableContext.rows.find((row: RowModel) => row.id === params.id)[params.field]?.value;
                if (cellValue != oldCellValue) {
                    setCellEditConfirmModal({
                        visible: true,
                        cellId,
                        cellValue,
                        oldCellValue
                    })
                    // Затираем значение в ячейке, тк ждем его подтверждение в модалке
                    props.setContext((prevState: TableContextType) => {
                        let data = JSON.parse(JSON.stringify(prevState.rows));
                        //@ts-ignore
                        data.find((row: RowModel) => row.id === params.id)[params.field].value = "";
                        return {...prevState, rows: data};
                    });
                }
            }, 200);
        }
        setTimeout(() => {
            // Ебаный костыль из-за асинхронного обновления грида
            console.log('I M HERE')
            //@ts-ignore
            const actualValue = apiRef.current.getCellValue(params.id, params.field);
            //@ts-ignore
            const oldCellValue = tableContext.rows.find((row: RowModel) => row.id === params.id)[params.field]?.value;
            // Обновляем значение ячейки на сервере
            if (actualValue != oldCellValue) {
                updateCell({
                    id: cellId,
                    value: typeof actualValue == 'object' ? actualValue.value : actualValue
                });
            }
            // -----
        }, 10);
        // Снимаем блокировку на сервере
        if (props.wsCellLocks) {
            props.wsCellLocks.send(JSON.stringify({cell_id: cellId, type: 'remove', user_id: currentUser?.id}));
        }
        // -----
    };

    const isCellEditableHandler = useCallback((params: GridCellParams) => {
        if (tableContext) {
            let column = tableContext.columnsModels.find((col: ColumnModel) => col.id == parseInt(params.field));
            let isDisabledByColumnRule = !column?.disabled;
            let canEdit = tableContext.tablePermission ? tableContext.tablePermission.can_edit : true;
            let isEditableCell = false;
            let isRowEditablePermission = false;
            let isColumnEditablePermission = false;
            let isConfirmModeWithFilledCell = true;
            let isBlockByColumnTypeCounter = column ? column.data_type != 'auto' : true;
            isEditableCell = !tableContext.lockedCellsIds.find((lock => lock.cell_id == params.row[params.field]?.id && currentUser?.id !== lock.user_id));
            isRowEditablePermission = tableContext.rowPermissions?.find((rp: PermissionModel) => rp.row == params.row.id) != undefined;
            isColumnEditablePermission = tableContext.columnPermissions?.find((cp: PermissionModel) => cp.column?.toString() == params.field) != undefined;
            if (tableContext.withCellConfirm && (tableContext.role == ROLE.ADMIN || tableContext.role == ROLE.OWNER)) {
                if (params.row[params.field].value != null && params.row[params.field].value != "") {
                    isConfirmModeWithFilledCell = false;
                    if (column?.available_if_confirm_mode_enabled) isConfirmModeWithFilledCell = true;
                }
            }
            return isEditableCell && isRowEditablePermission && isColumnEditablePermission && isConfirmModeWithFilledCell && isBlockByColumnTypeCounter && isDisabledByColumnRule && canEdit;
        }
        return true;
    }, [tableContext]);
    //СЕЕ Измененный debouncedSetFilter
    const debouncedSetFilter = useCallback(
        debounce((params: GridFilterModel) => {
            if (id && tableContext) {
                if (params.items.length != 0) {
                    // Обновляем пагинацию в контексте
                    props.setContext((context: TableContextType) => ({
                        ...context,
                        paginationModel: {
                            ...context.paginationModel,
                            page: 0
                        }
                    }));

                    // Вызываем API с правильными параметрами - ПЕРЕДАЕМ filters!
                    getTableDataWithColumnFilter({
                        tableId: id,
                        page: 0,
                        limit: tableContext.paginationModel.pageSize,
                        filters: params.items,  // ← передаем массив фильтров
                        mode: params.logicOperator as GridLogicOperator,
                        sortField: sortModel.map((sm) => parseInt(sm.field)),
                        sortDirection: sortModel[0]?.sort
                    });

                } else {
                    // Сброс фильтров
                    props.setContext((context: TableContextType) => ({
                        ...context,
                        paginationModel: {
                            ...context.paginationModel,
                            page: 0
                        }
                    }));

                    getTableData({
                        tableId: id,
                        page: 0,
                        limit: tableContext.paginationModel.pageSize,
                        sortField: sortModel.map((sm) => parseInt(sm.field)),
                        sortDirection: sortModel[0]?.sort
                    });
                }
            }
        }, 2000),
        [sortModel, id, getTableDataWithColumnFilter, getTableData]
    );
    const handleFilterChange = (filterModel: GridFilterModel) => {
        //СЕЕ дописать здесь такую-же проверку
        setFilterModel(filterModel);
        localStorage.setItem(`table_filter_${id}`, JSON.stringify(filterModel));
        debouncedSetFilter(filterModel);
    };
    const handleSortChange = (sortModel: GridSortModel) => {
        setSortModel(sortModel);
        localStorage.setItem(`table_sort_${id}`, JSON.stringify(sortModel));
        if (id && tableContext) {
            const newPage = 0;
            props.setContext((context: TableContextType) => ({
                ...context,
                paginationModel: {
                    ...context.paginationModel,
                    page: newPage
                }
            }));
            if (filterModel.items.length > 0) {
                // Есть активные фильтры - передаем filters как массив
                getTableDataWithColumnFilter({
                    tableId: id,
                    page: newPage,
                    limit: tableContext.paginationModel.pageSize,
                    filters: filterModel.items,
                    mode: filterModel.logicOperator,
                    sortField: sortModel.map((sm) => parseInt(sm.field)),
                    sortDirection: sortModel[0]?.sort
                });
            } else {
                // Только сортировка (даже если sortModel пустой - сброс сортировки)
                getTableData({
                    tableId: id,
                    page: newPage,
                    limit: tableContext.paginationModel.pageSize,
                    sortField: sortModel.map((sm) => parseInt(sm.field)),
                    sortDirection: sortModel[0]?.sort
                });
            }
        }
    };
    const columnOrderChangeHandler = (event: { column: GridColDef, oldIndex: number, targetIndex: number }) => {
        if (props.wsCellsUpdate && id) {
            props.wsCellsUpdate.send(JSON.stringify({
                type: 'column_reorder',
                table_id: id,
                old_index: event.oldIndex,
                new_index: event.targetIndex
            }));
        }
    };
    const handleCellSelectionModelChange = useCallback(
        (newModel: GridCellSelectionModel) => {
            setCellSelectionModel(newModel);
        },
        [],
    );
    const updateCellHandler = () => {
        if (selectedCell)
            updateCell({
                id: selectedCell.id,
                value: mainInputValue,
            });
    }
    // -----

    // Useful utils
    const handleContextMenu = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();

        const target = event.target as HTMLElement;
        const rowElement = target.closest('[data-id]') as HTMLElement;
        const columnElement = target.closest('[data-field]') as HTMLElement;

        if (rowElement && columnElement) {
            const rowId = rowElement.getAttribute('data-id');
            const columnId = columnElement.getAttribute('data-field');
            if (rowId && columnId) {
                const row = tableContext?.rows.find(r => r.id === parseInt(rowId));
                const column = tableContext?.columns.find(c => c.field == columnId);
                if (row && column) {
                    setSelectedRow(row);
                    setContextMenu({
                        mouseX: event.clientX,
                        mouseY: event.clientY,
                        rowId: parseInt(rowId),
                        columnId: parseInt(columnId)
                    });
                }
            }
        }
    }, [tableContext?.rows]);

    const insertRowAtPosition = (currentRowId: number, positionIndex: number, withCopy: boolean) => {
        props.insertRow({
            tableId: id,
            position: positionIndex,
            withCopy,
            currentRowId
        });
    };

    const handleAddRowAfter = (event: { key: string }) => {
        if (!contextMenu?.rowId || !tableContext?.rows) return;

        const row = tableContext.rows.find(row => row.id === contextMenu.rowId);
        if (row)
            if (row.order != undefined)
                insertRowAtPosition(contextMenu.rowId, row?.order + 1, event.key.includes("copy"));
        setContextMenu(null);
    };

    const handleAddRowBefore = (event: { key: string }) => {
        if (!contextMenu?.rowId || !tableContext?.rows) return;
        const row = tableContext.rows.find(row => row.id === contextMenu.rowId);

        if (row)
            if (row.order != undefined)
                insertRowAtPosition(contextMenu.rowId, row.order, event.key.includes("copy"));
        setContextMenu(null);
    };

    const showHistoryModalHandler = (event: { key: string }) => {
        if (!contextMenu?.rowId || !tableContext?.rows) return;
        const currentIndex = tableContext.rows.findIndex(row => row.id === contextMenu.rowId);
        if (currentIndex !== -1) {
            setHistoryModalVisible(true);
        }
        setContextMenu(null);
    };

    const handleInsertCellValues = () => {
        setInsertSelectedValueModalVisible(true);
    };

    const handleClearCellValues = () => {
        if (tableContext?.rows) {
            const data = tableContext.rows;
            let ids: number[] = [];
            // Обход строк
            Object.keys(cellSelectionModel).map((rowId: any) => {
                let row: any = data.find((row: DataRowModel) => row.id == rowId);
                if (row) {
                    // Обход колонок
                    Object.keys(row).map((columnId: string) => {
                        if (row) {
                            let cell = row[columnId];
                            if (typeof cell == 'object') {
                                let selectedColumnId = cellSelectionModel[rowId];
                                if (selectedColumnId[cell.column]) {
                                    ids.push(cell.id);
                                }
                            }
                        }
                    });
                }
            });
            clearRange(ids);
        }
    };

    const handleAddColumnBefore = (event: { key: string }) => {
        if (!contextMenu?.columnId || !tableContext?.columns) return;
        let column = tableContext.columnsModels.find(column => column.id == contextMenu.columnId);
        if (column) {
            let columnCopy = JSON.parse(JSON.stringify(column));
            columnCopy.withCopy = false;
            createColumn(column);
        }
        setContextMenu(null);
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handlePaginationChange = (paginationModel: { page: number, pageSize: number }) => {
        if (!isTableDataLoading && id && tableContext) {

            // Просто обновляем контекст
            props.setContext((context: TableContextType) => ({
                ...context,
                paginationModel
            }));

            sortModel.map(sm => sm.field)
            const currentSortField = sortModel.map((sm) => parseInt(sm.field))
            const currentSortDirection = sortModel[0]?.sort;
            const currentFilters = filterModel.items;
            const currentFilterMode = filterModel.logicOperator;

            // Загружаем данные с текущими фильтрами и сортировкой
            if (currentFilters.length > 0) {
                getTableDataWithColumnFilter({
                    tableId: id,
                    page: paginationModel.page,
                    limit: paginationModel.pageSize,
                    filters: currentFilters,
                    mode: currentFilterMode,
                    sortField: currentSortField,
                    sortDirection: currentSortDirection
                });
            } else {
                getTableData({
                    tableId: id,
                    page: paginationModel.page,
                    limit: paginationModel.pageSize,
                    sortField: currentSortField,
                    sortDirection: currentSortDirection
                });
            }
        }
    }

    // Стили для новых строк
    const getRowClassName = (params: any) => {
        return params.row.isNew ? 'highlight-new-row' : '';
    };

    const handleColumnWidthChange = (params:{colDef: GridColDef}) => {
        if (params.colDef.width) {
            localStorage.setItem(`column_${params.colDef.field}_width`, params.colDef.width.toString())
        }
    };

    return {
        id,
        columnsFromRequest,
        tableContext,
        currentUser,
        deleteRow,
        getTableData,
        getColumnPermissions,
        handleAddRowBefore,
        handleAddRowAfter,
        handleAddColumnBefore,
        showHistoryModalHandler,
        handleInsertCellValues,
        handleClearCellValues,
        handleContextMenu,
        insertSelectedValueModalVisible,
        cellSelectionModel,
        cellEditConfirmModal,
        selectedRow,
        historyModalVisible,
        selectedCell,
        updateCellHandler,
        mainInputValue,
        setInsertSelectedValueModalVisible,
        setCellEditConfirmModal,
        setHistoryModalVisible,
        setMainInputValue,
        isUpdateCellLoading,
        apiRef,
        handlePaginationChange,
        handleSortChange,
        columnOrderChangeHandler,
        isCellEditableHandler,
        onCellEditStartHandler,
        onCellEditStopHandler,
        isGridLoading,
        getRowClassName,
        handleCellSelectionModelChange,
        contextMenu,
        handleCloseContextMenu,
        handleFilterChange,
        sortModel,
        tableDataWithColumnFilter,
        getTableDataWithColumnFilter,
        filterModel,
        handleColumnWidthChange,
        colorPickerVisible,
        setColorPickerVisible,
        refreshTable,
    }
}
