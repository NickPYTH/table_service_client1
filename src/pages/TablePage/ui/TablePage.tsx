import React, {createContext, useEffect, useState} from 'react';
import {Button, Flex, Input, Popconfirm, Tag} from "antd";
import {tableAPI} from "service/TableService";
import {useNavigate, useParams} from "react-router-dom";
import {CellModel} from "entities/CellModel";
import {ColumnModel} from "entities/ColumnModel";
import {ColumnSettingsModal} from "pages/TablePage/ui/ColumnSettings/ColumnSettingsModal";
import {rowAPI} from "service/RowService";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CloseOutlined, DeleteRowOutlined,
    EditOutlined,
    SaveOutlined,
    SearchOutlined,
    SettingOutlined,
    ShareAltOutlined
} from "@ant-design/icons";
import {RowSettingsModal} from "pages/TablePage/ui/RowSettings/RowSettingsModal";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {host, wsHost} from "shared/config/constants";
import {ImportRowsModal} from "pages/TablePage/ui/ImportRowsModal";
import {columnAPI} from "service/ColumnService";
import {UserModel} from "entities/UserModel";
import {TableSettingsModal} from "pages/TablePage/ui/TableSettings/TableSettingsModal";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {RowPermissionsModel} from "entities/RowPermissionsModel";
import {TablePermissionsModel} from "entities/TablePermissionsModel";
import {RowModel} from "entities/RowModel";
import {CoreGrid} from "pages/TablePage/ui/Grid/CoreGrid";
import {GridColDef, GridRowId} from "@mui/x-data-grid-premium";
import {Cell} from "pages/TablePage/ui/Grid/Cell";

function updateCellValueInArray(dataArray: any, targetId: any, newValue: any) {
    // Создаем копию массива, чтобы не мутировать исходные данные
    const result = JSON.parse(JSON.stringify(dataArray));

    // Перебираем все объекты в массиве
    result.forEach((item: any) => {
        // Перебираем все ключи в объекте (кроме rowId)
        for (const key in item) {
            if (key === 'rowId') continue;

            // Проверяем, есть ли у текущего элемента нужный ID
            if (item[key].id === targetId) {
                // Заменяем значение
                item[key].value = newValue;
                // Можно прервать цикл, если ID уникальны в рамках одного объекта
                break;
            }
        }
    });

    return result;
};

type DataRowModel = {
    id: GridRowId;
};

export type TableContextType = {
    owner: UserModel | null,
    ws: WebSocket | null;
    lockedCellsIds: { user_id: number, cell_id: number }[];
    rowPermissions: RowPermissionsModel[] | null;
    tablePermission: TablePermissionsModel | null;
    rows: DataRowModel[];
    columns: GridColDef[];
    pageSize: number;
    refresh: Function;

    // Параметры модалки по настройке колонок
    setSelectedColumnId: (id:number) => void;
    setIsVisibleColumnSettingsModal: (isVisible:boolean) => void;
    // -----

    // Параметры модалки по настройке строк
    setSelectedRowId: (id:number) => void;
    setIsVisibleRowSettingsModal: (isVisible:boolean) => void;
    // -----

};

export const TableContext = createContext<TableContextType | null>(null);

const TablePage: React.FC = () => {

    // Params
    let {id} = useParams();
    // -----

    // Navigation
    const navigate = useNavigate();
    // -----

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    // -----

    // Web requests
    const [getTableInfo, {
        data: tableInfo,
    }] = tableAPI.useGetMutation();
    const [getTableColumns, {
        data: columnsFromRequest,
    }] = columnAPI.useGetAllByTableIdMutation();
    const [patchTable, {
        data: patchedTable,
        isSuccess: isTablePatchSuccess,
        isLoading: isTablePatchLoading
    }] = tableAPI.usePatchMutation();
    const [deleteTable, {
        isSuccess: isTableDeleteSuccess,
    }] = tableAPI.useDeleteMutation();
    const [createRow, {
        isSuccess: isCreateRowSuccess,
        isLoading: isCreateRowLoading
    }] = rowAPI.useCreateMutation();
    const [getRowsByTableId, {
        data: tableData,
        isLoading: isTableDataLoading,
    }] = rowAPI.useGetAllByTableIdMutation();
    const [getLockedCells, {
        data: lockedCell,
    }] = tableAPI.useGetLockedCellsMutation();
    const [removeLocks, {
        isSuccess: isRemoveLocksSuccess,
    }] = tableAPI.useRemoveLocksMutation();
    const [getTablePermission, {
        data: tablePermission,
    }] = tablepermissionsAPI.useGetByTableIdAndUserIdMutation();
    const [getRowPermissions, {
        data: rowPermissions,
        isLoading: isRowPermissionLoading
    }] = rowPermissionsAPI.useGetAllByUserIdMutation();
    const [deleteRow, {}] = rowAPI.useDeleteMutation();
    // -----

    // States
    const [wsCellsUpdate, setWsCellsUpdate] = useState(null);
    const [wsCellLocksUpdate, setWsCellLocksUpdate] = useState(null);
    const [wsAlive, setWsAlive] = useState(false);
    const [title, setTitle] = useState<string | null>(null);
    const [isVisibleTableSettingsModal, setIsVisibleTableSettingsModal] = useState(false);
    const [isTitleEditMode, setIsTitleEditMode] = useState(false);
    const [isVisibleImportRowModal, setIsVisibleImportRowModal] = useState(false);
    const [editTitle, setEditTitle] = useState<string | null>(null);
    const [isVisibleColumnModal, setIsVisibleColumnModal] = useState(false);
    const [isVisibleRowModal, setIsVisibleRowModal] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
    const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
    const [searchText, setSearchText] = useState("");
    const [isTableOwner, setIsTableOwner] = useState(false);
    const [context, setContext] = useState<TableContextType>({
        owner: null,
        ws: null,
        lockedCellsIds: [],
        rowPermissions: null,
        tablePermission: null,
        rows: [],
        columns: [],
        pageSize: 50,
        setIsVisibleColumnSettingsModal: setIsVisibleColumnModal,
        refresh: getRowsByTableId,
        setSelectedColumnId: setSelectedColumnId,
        setIsVisibleRowSettingsModal: setIsVisibleRowModal,
        setSelectedRowId: setSelectedRowId
    });
    // -----

    // Effects
    useEffect(() => {
        if (id) {
            getTableInfo(id);
            getLockedCells(id);
            if (currentUser) {
                getTablePermission({table_id: id, user_id: currentUser.id});
            }
        }
    }, []);
    useEffect(() => {
        if (rowPermissions) {
            setContext(prevState => ({...prevState, rowPermissions}));
        }
    }, [rowPermissions])
    useEffect(() => {
        if (tablePermission)
            setContext(prevState => ({...prevState, tablePermission: tablePermission[0]}));
    }, [tablePermission]);
    useEffect(() => {
        // Подключение к обновлению ячеек по WebSocket
        const socket = new WebSocket(`${wsHost}/ws/cell-updates/`);

        socket.onopen = () => {
            console.log('WebSocket cell update connected');
            setWsAlive(true);
        };

        socket.onmessage = (event) => {
            const message: { id: number, entity: CellModel, type: string } = JSON.parse(event.data);
            if (message.type == 'cell_update') {
                let newState = JSON.parse(JSON.stringify(context.rows));
                setContext((prev:TableContextType)=> {
                    const updatedRows = updateCellValueInArray(prev.rows, message.id, message.entity.value);
                    return {...prev, rows: updatedRows};
                });
            }
        };

        socket.onclose = () => {
            console.log('WebSocket cell update disconnected');
            setWsAlive(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket cell update error:', error);
            setWsAlive(false);
        };

        //@ts-ignore
        setWsCellsUpdate(socket);

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        // Подключение к обновлению ячеек по WebSocket
        const socket = new WebSocket(`${wsHost}/ws/cell-lock-updates/`);

        socket.onopen = () => {
            console.log('WebSocket cell lock connected');
            setWsAlive(true);
            setContext(prevState => ({...prevState, ws: socket}));
        };

        socket.onmessage = (event) => {
            const message: { entity: { cell: CellModel, user: UserModel }, type: string } = JSON.parse(event.data);
            if (message.type == 'cell_lock_update') {
                setContext(prevState => ({
                    ...prevState,
                    lockedCellsIds: prevState.lockedCellsIds.filter((lockedCell) => lockedCell.user_id != currentUser?.id).concat([{user_id: message.entity.user.id, cell_id: message.entity.cell.id}])
                }));
            } else if (message.type == 'cell_lock_remove')
                setContext(prevState => ({...prevState, lockedCellsIds: prevState.lockedCellsIds.filter((lock) => lock.cell_id != message.entity.cell.id)}));
        };
        socket.onclose = () => {
            console.log('WebSocket cell lock disconnected');
            setWsAlive(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket cell lock error:', error);
            setWsAlive(false);
        };

        //@ts-ignore
        setWsCellLocksUpdate(socket);

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        if (isCreateRowSuccess && id)
            getRowsByTableId({tableId: id, page: 1, limit: context.pageSize});
    }, [isCreateRowSuccess]);
    useEffect(() => {
        if (tableData){
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
            setContext((prevState) => ({...prevState, rows: rowsForTable}));
            // -----
        }
    }, [tableData]);
    useEffect(() => {
        if (columnsFromRequest && id) {
            const columns: GridColDef[] = columnsFromRequest.map((column:ColumnModel) => {
                return {
                    field: column.id ? column.id.toString() : "999",
                    headerName: column.name,
                    editable: true,
                    width: 200,
                    type: column.data_type == 'text' ? 'string' : 'string',
                    valueGetter: (params:CellModel) => {
                        return params ? params.value : '';
                    },
                    valueSetter: (value, row) => {
                        let rowCopy = JSON.parse(JSON.stringify(row));
                        rowCopy[column.id??0].value = value
                        return rowCopy;
                    },
                    valueFormatter: (params:string) => {
                        return params;
                    },
                    renderCell: (params) => {
                        return <Cell row={params.row} column={column} formattedValue={params.formattedValue}/>
                    },
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
                renderCell: (data) => (<Flex gap={'small'}>
                    <Button size={'small'} icon={<SettingOutlined />} onClick={() => {
                        if (context) {
                            context.setIsVisibleRowSettingsModal(true);
                            context.setSelectedRowId(data.row.id);
                        }
                    }}/>
                    <Popconfirm title={"Вы точно хотите удалить строку?"} okText={"Да"} onConfirm={() => {
                        deleteRow(data.row.id);
                        setContext((prev:TableContextType) => ({
                            ...prev,
                            rows: prev.rows.filter((row) => row.id != data.row.id)
                        }));
                    }}>
                        <Button size={'small'} danger icon={<DeleteRowOutlined />} />
                    </Popconfirm>
                </Flex>)
            }
            columns.push(actionColumn);
            setContext(prev => ({...prev, columns}));
            // Отправляю запрос на получение данных
            getRowsByTableId({tableId: id, page: 1, limit: context.pageSize});
            // -----
        }
    }, [columnsFromRequest]);
    useEffect(() => {
        if (tableInfo) {
            setTitle(tableInfo.title);
            setContext((prev)=>({...prev, owner: tableInfo.owner}))
            setIsTableOwner(tableInfo.owner.id == currentUser?.id);
        }
    }, [tableInfo]);
    useEffect(() => {
        if (lockedCell) setContext(prevState => ({...context, lockedCellsIds: lockedCell}));
    }, [lockedCell]);
    useEffect(() => !isVisibleColumnModal ? setSelectedColumnId(null) : () => {
    }, [isVisibleColumnModal]);
    useEffect(() => {
        if (patchedTable) {
            setTitle(patchedTable.title);
            setEditTitle(null);
            setIsTitleEditMode(false);
        }
    }, [isTablePatchSuccess]);
    useEffect(() => {
        if (isTableDeleteSuccess) navigate("/table_service/tables_list");
    }, [isTableDeleteSuccess]);
    useEffect(() => {
        if (isRemoveLocksSuccess) setContext(prevState => ({...prevState, lockedCellsIds: []}));
    }, [isRemoveLocksSuccess]);
    // -----

    // Handlers
    const openColumnModalHandler = () => {
        setIsVisibleColumnModal(true);
    };
    const addRowHandler = () => {
        if (id) createRow(id);
    };
    const saveTitleHandler = () => {
        if (editTitle && id) {
            patchTable({id, title: editTitle});
        }
    };
    const deleteTableHandler = () => {
        if (id) deleteTable(id);
    };
    const removeLocksHandler = () => {
        if (id) removeLocks(id);
    };
    const exportTableHandler = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `${host}/api/table/${id}/export/xlsx/`
        tmpButton.click();
    };
    const shareTableHandler = () => {
        alert("Жду реализации");
    };
    const searchHandler = () => {
        if (id) getRowsByTableId({tableId: id, page: 1, limit: context.pageSize, search: searchText});
    };
    const goBackHandler = () => {
        if (id) removeLocks(id);
        navigate("/table_service/tables_list");
    };
    const clearSearchHandler = () => {
        setSearchText("");
        if (id) getRowsByTableId({tableId: id, page: 1, limit: context.pageSize});
    }
    // -----

    // Useful utils

    // -----

    return (
        <TableContext.Provider value={context}>
            <Flex vertical={true} gap={'small'} style={{padding: 5}}>
                {(isVisibleRowModal && selectedRowId) &&
                    <RowSettingsModal rowId={selectedRowId} refresh={() => getRowsByTableId({tableId: id ? id : "0", page: 1, limit: context.pageSize})} visible={isVisibleRowModal}
                                      setVisible={setIsVisibleRowModal}/>}
                {isVisibleColumnModal &&
                    <ColumnSettingsModal
                        id={selectedColumnId}
                        visible={isVisibleColumnModal}
                        setVisible={setIsVisibleColumnModal}
                        refresh={() => getTableColumns(id ?? "999")}
                    />}
                {isVisibleTableSettingsModal && <TableSettingsModal visible={isVisibleTableSettingsModal} setVisible={setIsVisibleTableSettingsModal}/>}
                {isVisibleImportRowModal &&
                    <ImportRowsModal visible={isVisibleImportRowModal} setVisible={setIsVisibleImportRowModal} refresh={() => getRowsByTableId({tableId: id ? id : "0", page: 1, limit: context.pageSize})}/>}
                <Flex align={'center'} justify={'space-between'}>
                    <Flex gap={'middle'}>
                        <Button style={{height: 55}} icon={<ArrowLeftOutlined/>} onClick={goBackHandler}/>
                        <Flex vertical>
                            <Flex align={'center'} gap={'small'}>
                                {isTitleEditMode ?
                                    <>
                                        <Input disabled={isTablePatchLoading} style={{width: 200}} value={editTitle ?? ""} onChange={(e) => setEditTitle(e.target.value)}/>
                                        <Button disabled={isTablePatchLoading} icon={<SaveOutlined/>} onClick={saveTitleHandler}/>
                                        <Button disabled={isTablePatchLoading} danger icon={<CloseOutlined/>} onClick={() => {
                                            setIsTitleEditMode(false);
                                            setEditTitle(null);
                                        }}/>
                                    </>
                                    :
                                    <>
                                        <div style={{fontWeight: 'bold'}}>{title ? title : "Ждем..."}</div>
                                        <Button icon={<EditOutlined/>} onClick={() => {
                                            setIsTitleEditMode(true);
                                            setEditTitle(title);
                                        }}/>
                                        {isTableOwner &&
                                            <Button icon={<SettingOutlined/>} onClick={() => {
                                                setIsVisibleTableSettingsModal(true);
                                            }}/>
                                        }
                                        <Button icon={<ShareAltOutlined/>} onClick={shareTableHandler}/>
                                    </>
                                }
                            </Flex>
                            <div style={{fontSize: 12, marginBottom: 5, marginTop: 5}}>{context.owner && <>Владелец: {`${context.owner.last_name} ${context.owner.first_name}`}</>}</div>
                        </Flex>
                    </Flex>
                    <Flex style={{fontSize: 12}} vertical gap={'small'}>
                        {wsAlive ?
                            <Tag icon={<CheckCircleOutlined/>} color="success">
                                Соединение активно
                            </Tag>
                            :
                            <Tag icon={<CloseCircleOutlined/>} color="error">
                                Соединение отсутствует
                            </Tag>
                        }
                    </Flex>
                </Flex>
                <Flex style={{width: window.innerWidth - 10}}>
                    <Flex gap={'small'} style={{width: '100%'}}>
                        <Flex vertical gap={'small'}>
                            <Button type={'primary'} style={{width: 200}} onClick={openColumnModalHandler}>Добавить столбец</Button>
                            <Button type={'primary'} style={{width: 200}} disabled={isCreateRowLoading} onClick={addRowHandler}>Добавить строку</Button>
                        </Flex>
                        <Flex vertical gap={'small'}>
                            <Button type={'primary'} style={{width: 200}} onClick={exportTableHandler}>Экспорт таблицы</Button>
                            <Button type={'primary'} style={{width: 200}} onClick={() => setIsVisibleImportRowModal(true)}>Добавить строки из файла</Button>
                        </Flex>
                        <Flex vertical justify={'end'}>
                            <Flex gap={'small'}>
                                <Input placeholder={"Полнотекстовой поиск"} value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
                                <Button icon={<SearchOutlined/>} onClick={searchHandler} disabled={isTableDataLoading}/>
                                <Button danger icon={<CloseOutlined/>} onClick={clearSearchHandler} disabled={isTableDataLoading}/>
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex vertical gap={'small'}>
                        <Popconfirm title={"Вы точно хотите таблицу? Это действие необратимо."} onConfirm={deleteTableHandler}>
                            <Button danger type={'primary'} style={{width: 200}}>
                                Удалить таблицу
                            </Button>
                        </Popconfirm>
                        <Button danger type={'primary'} style={{width: 200}} onClick={removeLocksHandler}>Завершить редактирование</Button>
                    </Flex>
                </Flex>
                <CoreGrid
                    wsCellLocks={wsCellLocksUpdate}
                    wsCellsUpdate={wsCellsUpdate}
                    setContext={setContext}
                />
            </Flex>
        </TableContext.Provider>
    );
};


export default TablePage;