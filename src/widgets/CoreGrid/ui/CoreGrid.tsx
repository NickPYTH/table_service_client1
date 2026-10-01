import {Button, DatePicker, Dropdown, Flex, Popconfirm, Popover, Tag} from "antd";
import TextArea from "antd/es/input/TextArea";
import {
    BgColorsOutlined,
    CopyOutlined,
    DeleteOutlined,
    DeleteRowOutlined,
    HistoryOutlined,
    PlusOutlined,
    SaveOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {DataGridPremium, gridClasses, GridColDef} from "@mui/x-data-grid-premium";
import {ruRU} from '@mui/x-data-grid-premium/locales';
import React, {useEffect} from "react";
import dayjs, {Dayjs} from "dayjs";
import {ColumnMenu} from "./ColumnMenu";
import {EditLogModal} from "./EditLogModal";
import {ConfirmCellEditModal} from "./ConfirmCellEditModal";
import {CustomPaginationWithSelect} from "./CustomPagination";
import {InsertSelectedValueModal} from "./InsertSelectedValueModal";
import {CellModel} from "entities/CellModel";
import {TableContextType} from "pages/TablePage/types";
import {PropsType} from "../model/types";
import {useCoreGrid} from "../model/useCoreGrid";
import {ColumnModel} from "entities/ColumnModel";
import {formatDate, formatDateTime} from "shared/config/utils";
import {Cell} from "./Cell";
import {COLUMN_KEYS, ROLE} from "shared/config/constants";
import {EditCell} from "./EditCell";
import {ColorPickerModal} from "widgets/CoreGrid/ui/ColorPicker";


export const CoreGrid = (props: PropsType) => {

    const {
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
        getTableDataWithColumnFilter,
        filterModel,
        handleColumnWidthChange,
        colorPickerVisible,
        setColorPickerVisible,
        refreshTable,
    } = useCoreGrid(props);




    useEffect(() => {
        if (columnsFromRequest && id) {
            const columns: GridColDef[] = columnsFromRequest.map((column: ColumnModel) => {
                let col: any = {
                    field: column.id ? column.id.toString() : "999",
                    editable: true,
                    minWidth: 100,
                    width: 200,
                    headerName: column.name,
                    renderHeader: () => (
                        <Flex vertical gap={'small'}>
                            <div style={{position:'absolute', fontWeight: 800, color:"#1975d0", bottom: 0, left: 0}}>{column.order != undefined ? COLUMN_KEYS[column?.order?.toString() ?? 0]:""}</div>
                            <Flex style={{
                                whiteSpace: 'normal',
                                wordWrap: 'break-word',
                                lineHeight: 1.2,
                                textAlign: 'center',
                                fontSize: 12
                            }}>
                                <Popover
                                    placement={'right'}
                                    title={`Индекс колонки(${column.order}): ` + (column.order != undefined ? COLUMN_KEYS[column?.order?.toString() ?? 0] : "")}
                                    content={"Тип колонки: " + (column.data_type == 'text' ? 'строка' :
                                        column.data_type == 'integer' ? 'число' :
                                            column.data_type == 'float' ? 'число' :
                                                column.data_type == 'date' ? 'дата' :
                                                    column.data_type == 'datetime' ? 'дата и время' :
                                                        column.data_type == 'boolean' ? 'список' :
                                                            column.data_type == 'select' ? 'список' :
                                                                column.data_type == 'auto' ? 'счетчик' :
                                                                    column.data_type == 'file' ? 'файл' :
                                                                        'строка')}
                                >
                                    {column.name}
                                </Popover>
                            </Flex>
                        </Flex>),
                    type: column.data_type == 'text' ? 'string' :
                        column.data_type == 'integer' ? 'number' :
                            column.data_type == 'float' ? 'number' :
                                column.data_type == 'date' ? 'date' :
                                    column.data_type == 'datetime' ? 'dateTime' :
                                        column.data_type == 'boolean' ? 'singleSelect' :
                                            column.data_type == 'select' ? 'singleSelect' :
                                                column.data_type == 'file' ? 'singleSelect' :
                                                    'string',
                    valueGetter: (params: CellModel) => {
                        if (params?.value == null)
                            return "";
                        if (params.value instanceof Date) {
                            // Встретили дату
                            //@ts-ignore
                            if (params.value.getHours() == 0)
                                return formatDate(params.value);
                            else
                                return formatDateTime(params.value);
                        } else {
                            // Если тип данных колонки явно указан - Дата. Следует проверить не является ли датой ячейка
                            if (column.data_type == 'date') {
                                if (dayjs(params.value, "DD.MM.YYYY").isValid()) {
                                    const [day, month, year] = params.value.split('.');
                                    //@ts-ignore
                                    return new Date(year, month - 1, day)
                                }
                            }
                            if (column.data_type == 'datetime') {
                                if (dayjs(params.value, "DD.MM.YYYY HH:mm").isValid() || dayjs(params.value, "DD.MM.YYYY").isValid()) {
                                    let djs = dayjs(params.value, "DD.MM.YYYY HH:mm").isValid() ?
                                        dayjs(params.value, "DD.MM.YYYY HH:mm")
                                        :
                                        dayjs(params.value, "DD.MM.YYYY");
                                    //@ts-ignore
                                    return new Date(djs.year(), djs.month(), djs.date(), djs.hour(), djs.minute(), 0)
                                }
                            }
                            // -----
                            return params.value;
                        }
                    },
                    valueSetter: (value: any, row: any) => {
                        let rowCopy = JSON.parse(JSON.stringify(row));
                        rowCopy[column.id ?? 0].value = value;
                        return rowCopy;
                    },
                    valueFormatter: (params: any) => {
                        if (params == null)
                            return "";
                        if (params instanceof Date) {
                            // Встретили дату
                            params as Date;
                            if (params.getHours() == 0)
                                return formatDate(params);
                            else
                                return formatDateTime(params);
                        } else {
                            if (typeof params == 'object') return params.value
                            return params;
                        }
                    },
                    renderCell: (params: any) => {
                        return <Cell row={params.row} column={column} formattedValue={params.formattedValue}  cellSelectionModel={cellSelectionModel}  apiRef={apiRef} />
                    },
                    groupable: false,
                    aggregable: false,
                    valueOptions: column.select_values ? column.select_values : []
                };

                // Пытаемся найти ширину в памяти
                if (localStorage.getItem(`column_${column.id}_width`)){
                    col.width = localStorage.getItem(`column_${column.id}_width`);
                }

                if (column.data_type == 'select') {
                    if (tableContext?.role == ROLE.ADMIN || tableContext?.role == ROLE.OWNER) {
                        const options = column.select_values ? Array.from(
                            new Map(column.select_values.map((s: {
                                name: string,
                                filial_owner_code: string | null
                            }) => [s.name, {value: s.name, label: s.name}]))
                        ).map(([_, value]) => value) : [];
                        col.valueOptions = options.map((v) => v.value);
                        col.renderEditCell = (params: any) => (
                            <EditCell
                                {...params}
                                options={options}
                                getOptionLabel={(option) => option.label}
                            />
                        );
                    } else {
                        const options = column.select_values ? Array.from(
                            new Map(
                                column.select_values
                                    .filter((s: {
                                        name: string,
                                        filial_owner_code: string | null
                                    }) => s.filial_owner_code == null || s.filial_owner_code == currentUser?.filial)
                                    .map((s: {
                                        name: string,
                                        filial_owner_code: string | null
                                    }) => [s.name, {value: s.name, label: s.name}])
                            )
                        ).map(([_, value]) => value) : [];
                        col.valueOptions = options.map((v) => v.value);
                        col.renderEditCell = (params: any) => (
                            <EditCell
                                {...params}
                                options={options}
                                getOptionLabel={(option) => option.label}
                            />
                        );
                    }
                }

                if (column.data_type == "datetime") {
                    col = {
                        ...col,
                        renderEditCell: (params: any) => {
                            const {field, value, api, id} = params;
                            let dayjsValue: Dayjs | null = null;
                            if (typeof value == 'string') {
                                if (dayjs(value, "DD.MM.YYYY").isValid()) dayjsValue = dayjs(value, "DD.MM.YYYY");
                                if (dayjs(value, "DD.MM.YYYY HH:mm").isValid()) dayjsValue = dayjs(value, "DD.MM.YYYY HH:mm");
                            } else if (typeof value == 'object') {
                                if (dayjs(value).isValid()) dayjsValue = dayjs(value);
                            }
                            return (
                                <DatePicker
                                    allowClear={true}
                                    defaultValue={dayjsValue}
                                    format={"DD.MM.YYYY HH:mm"}
                                    showTime showSecond={false}
                                    onChange={(newValue) => {
                                        api.setEditCellValue({id, field, value: newValue.toDate()});
                                        dayjsValue = newValue;
                                    }}/>
                            )
                        }
                    };
                }
                return col;
            });
            let actionColumn: GridColDef = {
                disableColumnMenu: true,
                disableReorder: true,
                field: "action",
                headerName: "",
                width: 50,
                groupable: false,
                aggregable: false,
                sortable: false,
                filterable: false,
                renderCell: (data) => (
                    <Flex style={{height: '100%'}} gap={'small'} align={'center'} justify={'center'}>
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
            };
            let orderColumn: GridColDef = {
                disableColumnMenu: true,
                disableReorder: true,
                field: "order",
                headerName: "",
                width: 50,
                aggregable: false,
                renderCell: (data) => (<Flex style={{height: '100%'}} gap={'small'} align={'center'} justify={'center'}>
                    <Tag>{data.row['order'] + 1}</Tag>
                </Flex>)
            };
            if (tableContext?.role == ROLE.ADMIN || tableContext?.role == ROLE.OWNER) columns.push(actionColumn);
            columns.push(orderColumn);
            // Отправляю запрос на получение данных
            if (tableContext) {
                props.setContext((prev: TableContextType) => ({...prev, columns, columnsModels: columnsFromRequest}));
                if (sortModel.length > 0) {
                    getTableDataWithColumnFilter({
                        tableId: id,
                        page: 0,
                        limit: tableContext.paginationModel.pageSize,
                        filters: filterModel.items,
                        mode: filterModel.logicOperator,
                        sortField: sortModel.map((sm) => parseInt(sm.field)),
                        sortDirection: sortModel[0]?.sort
                    });
                }
                else {
                    getTableData({
                        tableId: id,
                        page: tableContext?.paginationModel.page,
                        limit: tableContext?.paginationModel.pageSize
                    });
                }
            }
            // -----

            // Получаем права на колонки
            if (currentUser && id) {
                getColumnPermissions(parseInt(id));
            }
            // -----
        }
    }, [columnsFromRequest]);



    const contextMenuItems = [
        {
            key: 'add-before',
            label: 'Добавить строку "до" пустую',
            icon: <PlusOutlined/>,
            onClick: handleAddRowBefore,
            disabled: !tableContext?.table?.allow_user_insert_row
        },
        {
            key: 'add-before-with-copy',
            label: 'Добавить строку "до" и скопировать данные',
            icon: <CopyOutlined/>,
            onClick: handleAddRowBefore,
            disabled: !tableContext?.table?.allow_user_insert_row
        },
        {
            key: 'add-after',
            label: 'Добавить строку "после" пустую',
            icon: <PlusOutlined/>,
            onClick: handleAddRowAfter,
            disabled: !tableContext?.table?.allow_user_insert_row
        },
        {
            key: 'add-after-with-copy',
            label: 'Добавить строку "после" и скопировать данные',
            icon: <CopyOutlined/>,
            onClick: handleAddRowAfter,
            disabled: !tableContext?.table?.allow_user_insert_row
        },
        {
            key: 'add-column-before',
            label: 'Добавить столбец "до" пустой',
            icon: <PlusOutlined/>,
            onClick: handleAddColumnBefore,
            disabled: !tableContext?.table?.allow_user_insert_column
        },
        {
            key: 'show-history',
            label: 'Просмотреть историю изменений',
            icon: <HistoryOutlined/>,
            onClick: showHistoryModalHandler,
        },
        {
            key: 'copy-content',
            label: 'Растянуть значения',
            icon: <PlusOutlined/>,
            onClick: handleInsertCellValues,
        },
        {
            key: 'clear-content',
            label: 'Очистить',
            icon: <DeleteOutlined/>,
            onClick: handleClearCellValues,
        },
        {
            key: 'color-picker',
            label: 'Выбрать цвет',
            icon:<BgColorsOutlined/>,
            onClick: () => {setColorPickerVisible(true)}

        }
    ];

    return (
        <div
            style={{height: window.innerHeight - 110, width: '100%'}}
            onContextMenu={handleContextMenu}
        >
            {colorPickerVisible && <ColorPickerModal isModalOpen={colorPickerVisible}
                                                     setIsModalOpen={setColorPickerVisible}
                                                     refreshTable={refreshTable}
                                                     apiRef={apiRef}
                                                     tableId={id}
                                                     tableContext={tableContext}
                                                     setContext={props.setContext}

            />}
            {insertSelectedValueModalVisible && <InsertSelectedValueModal cellSelectionModel={cellSelectionModel}
                                                                          visible={insertSelectedValueModalVisible}
                                                                          setVisible={setInsertSelectedValueModalVisible}/>}
            {cellEditConfirmModal.visible &&
                <ConfirmCellEditModal id={cellEditConfirmModal.cellId} value={cellEditConfirmModal.cellValue}
                                      oldValue={cellEditConfirmModal.oldCellValue}
                                      close={() => setCellEditConfirmModal({
                                          visible: false,
                                          cellValue: "",
                                          oldCellValue: "",
                                          cellId: -1
                                      })}/>}
            {(selectedRow && historyModalVisible) &&
                <EditLogModal visible={historyModalVisible} setVisible={setHistoryModalVisible}
                              rowId={selectedRow.id}/>}
            <Flex gap={'small'} align={'center'} style={{marginBottom: 3}}>
                <TextArea disabled={!selectedCell} onPressEnter={updateCellHandler} value={mainInputValue}
                          onChange={(e) => setMainInputValue(e.target.value)} size={'small'}/>
                <Flex gap={'small'} vertical>
                    <Button disabled={isUpdateCellLoading} loading={isUpdateCellLoading} icon={<SaveOutlined/>}
                            onClick={updateCellHandler}/>
                </Flex>
            </Flex>
            <DataGridPremium
                columnHeaderHeight={id == String(253) ? 170 : 50}
                rowHeight={31}
                apiRef={apiRef}
                // Настройки пагинации
                pagination
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
                filterModel={filterModel || {items: []}}
                onFilterModelChange={(model) => {
                    if (tableContext?.rows)
                        if (tableContext.rows.length == 0 && tableContext.rowPermissions == null)
                            return;
                    handleFilterChange(model);
                }}
                sortModel={sortModel}
                onSortModelChange={(model) => {
                    if (tableContext?.rows)
                        if (tableContext.rows.length == 0 && tableContext.rowPermissions == null)
                            return;
                    handleSortChange(model)
                }}
                paginationModel={tableContext ? tableContext.paginationModel : {page: 0, pageSize: 40}}
                onPaginationModelChange={handlePaginationChange}
                pageSizeOptions={[25, 50, 100, 200, 300, 400, 500, 600]}
                // -----
                showCellVerticalBorder
                showColumnVerticalBorder
                onColumnOrderChange={columnOrderChangeHandler}
                isCellEditable={isCellEditableHandler}
                onCellEditStart={onCellEditStartHandler}
                onCellEditStop={onCellEditStopHandler}
                columnBufferPx={300}
                rowBufferPx={300}
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                rows={tableContext?.rows || []}
                columns={tableContext ? tableContext.columns : []}
                sx={{
                    [`& .${gridClasses.cell}`]: {
                        p: 0,
                    },
                    // Стиль для новых строк
                    '& .highlight-new-row': {
                        backgroundColor: '#f0f8ff !important',
                        animation: 'fadeOut 2s ease-in 2s forwards',
                    },
                    '@keyframes fadeOut': {
                        to: {backgroundColor: 'transparent'}
                    },
                    // Отключаем выделение текста при правом клике
                    '& .MuiDataGrid-row': {
                        userSelect: 'none',
                    }
                }}
                // Опционально: стандартные настройки пагинации
                slotProps={{
                    pagination: {
                        showFirstButton: true,
                        showLastButton: true,
                    },
                }}
                loading={isGridLoading}
                slots={{
                    columnMenu: ColumnMenu,
                    pagination: CustomPaginationWithSelect
                }}
                getRowClassName={getRowClassName}
                initialState={{
                    pinnedColumns: {right: ['action'], left: ['order']},
                }}
                // Выбор ячеек
                cellSelectionModel={cellSelectionModel}
                onCellSelectionModelChange={handleCellSelectionModelChange}
                cellSelection
                // -----
                onColumnWidthChange={handleColumnWidthChange}
            />

            <Dropdown
                open={!!contextMenu}
                onOpenChange={(open) => !open && handleCloseContextMenu()}
                menu={{items: contextMenuItems}}
                trigger={['contextMenu']}
            >
                <div
                    style={{
                        position: 'fixed',
                        left: contextMenu?.mouseX || 0,
                        top: contextMenu?.mouseY || 0,
                        width: 1,
                        height: 1,
                    }}
                />
            </Dropdown>
        </div>
    );
};
