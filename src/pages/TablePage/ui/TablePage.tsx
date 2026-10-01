import React, {createContext, useEffect, useState} from 'react';
import './SmoothRotations.scss';
import {
    Avatar,
    Badge,
    Button,
    DatePicker,
    Divider,
    Flex,
    Input,
    Popconfirm,
    Popover,
    Result,
    Tag,
    message,
    Dropdown, Space, MenuProps
} from "antd";
import {tableAPI} from "service/TableService";
import {useNavigate, useParams} from "react-router-dom";
import {CellModel} from "entities/CellModel";
import {ColumnModel} from "entities/ColumnModel";
import {ColumnSettingsModal} from "pages/TablePage/ui/Settings/ColumnSettings/ColumnSettingsModal";
import {rowAPI} from "service/RowService";
import * as Icons from "@ant-design/icons";
import {
    ArrowLeftOutlined,
    CalculatorOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CloseOutlined,
    DeleteRowOutlined, DownOutlined,
    EditOutlined,
    ExportOutlined, FileTextOutlined,
    ImportOutlined,
    InsertRowBelowOutlined,
    InsertRowRightOutlined,
    MessageOutlined,
    ReloadOutlined,
    SaveOutlined,
    SearchOutlined,
    SettingOutlined
} from "@ant-design/icons";
import {RowSettingsModal} from "pages/TablePage/ui/Settings/RowSettings/RowSettingsModal";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {COLUMN_KEYS, host, ROLE, wsHost} from "shared/config/constants";
import {ImportRowsModal} from "pages/TablePage/ui/ImportRowsModal";
import {columnAPI} from "service/ColumnService";
import {UserModel} from "entities/UserModel";
import {TableSettingsModal} from "pages/TablePage/ui/TableSettings/TableSettingsModal";
import {tablepermissionsAPI} from "service/TablePermissionsService";
import {GridColDef} from "@mui/x-data-grid-premium";
import {CoreChat} from "pages/TablePage/ui/Chat/CoreChat";
import {useNotification} from "app/providers/NotificationProvider/ui/NotificationProvider";
import {MessageModel} from "entities/MessageModel";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {formatDate, formatDateTime} from "shared/config/utils";
import dayjs, {Dayjs} from "dayjs";
import {columnPermissionsAPI} from "service/ColumnPermissionsService";
import {TableContextType} from '../types';
import {updateCellsValueInArray, updateCellValueInArray} from '../utils';
import {CoreGrid} from "widgets/CoreGrid";
import {Cell} from "widgets/CoreGrid/ui/Cell";

export const TableContext = createContext<TableContextType | null>(null);

const iconList = [
    Icons.UserOutlined,
    Icons.SmileOutlined,
    Icons.StarOutlined,
    Icons.HeartOutlined,
    Icons.ThunderboltOutlined,
    Icons.RocketOutlined,
    Icons.CodeOutlined,
    Icons.GiftOutlined,
    Icons.CrownOutlined,
    Icons.FireOutlined,
    Icons.CloudOutlined,
    Icons.PhoneOutlined,
    Icons.MailOutlined,
    Icons.GlobalOutlined,
    Icons.SettingOutlined,
    Icons.TeamOutlined,
    Icons.ProfileOutlined,
    Icons.ShoppingOutlined,
    Icons.CameraOutlined,
    Icons.VideoCameraOutlined
];

const colorList = [
    "#f56a00",
    "#7265e6",
    "#ffbf00",
    "#00a2ae",
    "#f5222d",
    "#fa8c16",
    "#52c41a",
    "#13c2c2",
    "#eb2f96",
    "#2f54eb",
    "#fa541c",
    "#a0d911",
    "#722ed1"
];

const getRandomItem = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

const RandomAvatar = ({ user }: { user: UserModel }) => {
    const [randomIcon, setRandomIcon] = useState<any>(Icons.SettingOutlined);
    const [randomColor, setRandomColor] = useState<string>("#f56a00");

    useEffect(() => {
        setRandomIcon(() => getRandomItem(iconList));
        setRandomColor(getRandomItem(colorList));
    }, [user.id]); // можно привязать к user.id для перегенерации при смене пользователя

    const IconComponent = randomIcon;

    return (
        <Popover content={`${user.last_name} ${user.first_name}`}>
            <Avatar
                icon={<IconComponent />}
                style={{ backgroundColor: randomColor }}
            />
        </Popover>
    );
};

const TablePage: React.FC = () => {

    // Notification tableContext
    const notification = useNotification();
    // -----

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
        isError: isGetTableInfoError
    }] = tableAPI.useGetMutation();
    const [getTableColumns, {
        data: columnsFromRequest,
    }] = columnAPI.useGetAllByTableIdMutation();
    const [patchTable, {
        data: patchedTable,
        isSuccess: isTablePatchSuccess,
        isLoading: isTablePatchLoading
    }] = tableAPI.usePatchMutation();
    const [createRow, {
        isSuccess: isCreateRowSuccess,
        isLoading: isCreateRowLoading,
    }] = rowAPI.useCreateMutation();
    const [getRowsByTableId, {
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
    const [deleteRow, {
        isSuccess: isDeleteRowSuccess,
    }] = rowAPI.useDeleteMutation();
    const [getRowPermissions, {
        data: rowsPermissionsFromRequest,
    }] = rowPermissionsAPI.useGetAllByUserIdMutation();
    const [getColumnPermissions, {
        data: columnsPermissionsFromRequest,
    }] = columnPermissionsAPI.useGetAllByUserIdMutation();
    const [recalculateFormulas, {
        isLoading: isRecalculateFormulasLoading,
    }] = tableAPI.useRecalculateFormulasMutation();
    const [normalizeNumbers, {
        isSuccess: isNormalizeNumbersSuccess,
        isLoading: isNormalizeNumbersLoading,
    }] = tableAPI.useNormalizeNumbersMutation();
    const [createTableView, {
        isSuccess: tableViewCreated,
        isLoading: tableViewLoading,
    }] = tableAPI.useCreateTableViewMutation()
    // -----

    // States

    const [wsCellsUpdate, setWsCellsUpdate] = useState<WebSocket | null>(null);
    const [wsCellLocksUpdate, setWsCellLocksUpdate] = useState<WebSocket | null>(null);
    const [wsDemon, setWsDemon] = useState<WebSocket | null>(null);
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
    const [tableContext, setTableContext] = useState<TableContextType>({
        table: null,
        role: null,
        withCellConfirm: false,
        ws: null,
        demonWS: null,
        lockedCellsIds: [],
        rowPermissions: null,
        columnPermissions: null,
        tablePermission: null,
        rows: [],
        columns: [],
        columnsModels: [],
        pageSize: 50,
        setIsVisibleColumnSettingsModal: setIsVisibleColumnModal,
        refresh: getRowsByTableId,
        setSelectedColumnId: setSelectedColumnId,
        setIsVisibleRowSettingsModal: setIsVisibleRowModal,
        setSelectedRowId: setSelectedRowId,
        newMessages: [],
        unreadMessageCount: 0,
        showLockedRow: true,
        paginationModel: {pageSize: 40, page: 0},
        usersOnline: []
    });
    const [isVisibleChat, setIsVisibleChat] = useState(false);
    const [wsChat, setWsChat] = useState<WebSocket | null>(null);
    // -----

    // Effects
    useEffect(() => {
        if(tableViewCreated){
            message.success("Представление создано!")
        }
    }, [tableViewCreated])
    useEffect(() => {
        // Подключение к чату
        const socket = new WebSocket(`${wsHost}/ws/chats/`);

        socket.onopen = () => {
            console.log('WebSocket chats connected');
            setWsChat(socket);
        };

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        if (id) {
            // Индикация непрочитанных сообщений
            let unreadMessageCount = localStorage.getItem(`unread_message_count_${id}`);
            setTableContext(prev => ({...prev, unreadMessageCount: unreadMessageCount ? parseInt(unreadMessageCount) : 0}));
            // -----
            getTableInfo(id);
            getLockedCells(id);
            if (currentUser) {
                getTablePermission({table_id: id, user_id: currentUser.id});
            }
        }
    }, []);
    useEffect(() => {
        if (tablePermission)
            setTableContext(prevState => ({...prevState, tablePermission: tablePermission[0]}));
    }, [tablePermission]);
    useEffect(() => {
        // Подключение к обновлению ячеек по WebSocket
        const socket = new WebSocket(`${wsHost}/ws/cell-updates/?table_id=${id}&userId=${currentUser?.id}`);

        socket.onopen = () => {
            console.log('WebSocket cell update connected');
            setWsAlive(true);
        };

        socket.onmessage = (event) => {
            const message: { id: number, entity?: any, entities?: CellModel[], type: string, table_id:string, users: string } = JSON.parse(event.data);
            if (message.type == 'cell_update') {
                setTableContext((prev: TableContextType) => {
                    if (message.entity) {
                        const updatedRows = updateCellValueInArray(prev.rows, message.id, message.entity.value, message.entity.formula_value);
                        return {...prev, rows: updatedRows};
                    } else return prev;
                });
            } else if (message.type == 'cells_update') {
                setTableContext((prev: TableContextType) => {
                    if (message.entities) {
                        const updatedRows = updateCellsValueInArray(prev.rows, message.entities);
                        return {...prev, rows: updatedRows};
                    } else return prev;
                });
            } else if (message.type == 'send_row' && message.entity) {
                if (message.table_id != id) return;
                let item: any = {};
                item.id = message.entity.id;
                item['order'] = message.entity.order;
                // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                message.entity.cells_list.forEach((cell: CellModel) => {
                    if (cell.column) item[cell.column] = cell;
                });
                // -----
                setTableContext((prev: TableContextType) => {
                    // Создаем копию массива, чтобы не мутировать исходные данные
                    let result = JSON.parse(JSON.stringify(prev.rows));
                    if (prev.table?.open_last_page_by_default)
                        result = result.reverse();
                    let rowsIds:number[] = [];
                    let startOrder = result[0].order;
                    // Индекс строки в которую вставим
                    const idx = result.findIndex((r:any)=>r.order==item.order);
                    // Левая часть (без изменений в order)
                    const leftPart = idx == -1 ? result : result.slice(0, idx);
                    // Правая часть с order + 1
                    const rightPart = idx == -1 ? [] : result.slice(idx).map((r:any) => ({...r, order: r.order+1}));
                    result = [...leftPart, item, ...rightPart];

                    // Выдача прав
                    result.forEach((r:any) => rowsIds.push(r.id));
                    if (currentUser && id) {
                        getRowPermissions({table_id: id, user_id: currentUser.id, rowsIds});
                    }
                    // -----

                    if (prev.table?.open_last_page_by_default)
                        return {...prev, rows:result.reverse()};
                    else
                        return {...prev, rows: result};
                });
            } else if (message.type == 'get_online_users' && message.table_id == id) {
                setTableContext((prev:TableContextType) => ({...prev, usersOnline: JSON.parse(message.users)}))
            } else if (message.type == 'user_disconected' && message.table_id == id) {
                let user:UserModel = message.entity
                setTableContext((prev:TableContextType) => ({...prev, usersOnline: prev.usersOnline.filter((u:UserModel) => u.id != user.id)}))
            } else if (message.type == 'user_conected' && message.table_id == id) {
                let user:UserModel = message.entity
                setTableContext((prev:TableContextType) => ({...prev, usersOnline: prev.usersOnline.concat(user)}))

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
            setTableContext(prevState => ({...prevState, ws: socket}));
        };

        socket.onmessage = (event) => {
            const message: { entity: { cell: CellModel, user: UserModel }, type: string } = JSON.parse(event.data);
            if (message.type == 'cell_lock_update')
                setTableContext(prevState => ({
                    ...prevState,
                    lockedCellsIds: prevState.lockedCellsIds.filter((lockedCell) => lockedCell.user_id != currentUser?.id).concat([{user_id: message.entity.user.id, cell_id: message.entity.cell.id}])
                }));
            else if (message.type == 'cell_lock_remove')
                setTableContext(prevState => ({...prevState, lockedCellsIds: prevState.lockedCellsIds.filter((lock) => lock.cell_id != message.entity.cell.id)}));
        };

        socket.onclose = () => {
            console.log('WebSocket cell lock disconnected');
            setWsAlive(false);
        };

        socket.onerror = (error) => {
            console.error('WebSocket cell lock error:', error);
            setWsAlive(false);
            notification.error({
                message: "Ошибка сервера!",
                description: "Подключение разорвано, обновите страницу."
            });
        };

        setWsCellLocksUpdate(socket);

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        // Подключение к демону по WebSocket
        const socket = new WebSocket(`${wsHost}/ws/demon/`);

        socket.onopen = () => {
            console.log('WebSocket demon connected');
        };

        socket.onclose = () => {
            console.log('WebSocket demon disconnected');
        };

        socket.onerror = (error) => {
            console.error('WebSocket demon error:', error);
        };

        setWsDemon(socket);
        setTableContext((context) => ({...context, demonWS: socket}));

        return () => {
            socket.close();
        };
    }, []);
    useEffect(() => {
        if (isCreateRowSuccess) {
            notification.success({
                message: "Успешно!",
                description: "Строка добавлена."
            });
        }
    }, [isCreateRowSuccess]);
    useEffect(() => {
        if (columnsFromRequest && id) {
            setTableContext((context) => ({...context, columnsModels: columnsFromRequest}));
            const columns: GridColDef[] = columnsFromRequest.map((column: ColumnModel) => {
                let col:any = {
                    field: column.id ? column.id.toString() : "999",
                    editable: true,
                    minWidth: 200,
                    headerName: column.name,
                    renderHeader: () => (
                        <Flex vertical gap={'small'}>
                            <Flex style={{whiteSpace: 'normal', wordWrap: 'break-word', lineHeight: 1.2, textAlign: 'center', fontSize: 12}}>
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
                        if (typeof params.value == "object") {
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
                                    return new Date(year, month-1, day)
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
                    valueSetter: (value:any, row:any) => {
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
                            if (params.getHours() == 0)
                                return formatDate(params);
                            else
                                return formatDateTime(params);
                        } else
                            return params;
                    },
                    renderCell: (params:any) => {
                        return <Cell row={params.row} column={column} formattedValue={params.formattedValue}/>
                    },
                    groupable: false,
                    aggregable: false,
                    valueOptions: column.select_values ? column.select_values: []
                };
                if (column.data_type == "datetime"){
                    col = {...col,
                        renderEditCell: (params:any) => {
                            const {field, value, api, id} = params;
                            let dayjsValue: Dayjs | null = null;
                            if (typeof value == 'string') {
                                if (dayjs(value, "DD.MM.YYYY").isValid()) dayjsValue = dayjs(value, "DD.MM.YYYY");
                                if (dayjs(value, "DD.MM.YYYY HH:mm").isValid()) dayjsValue = dayjs(value, "DD.MM.YYYY HH:mm");
                            } else if (typeof value == 'object') {
                                if (dayjs(value).isValid()) dayjsValue = dayjs(value);
                            }
                            return(
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
                            setTableContext((prev: TableContextType) => ({
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
            if (tableContext.role == ROLE.OWNER || tableContext.role == ROLE.ADMIN) columns.push(actionColumn);
            setTableContext(prev => ({...prev, columns}));
            columns.push(orderColumn);
            // Отправляю запрос на получение данных
            getRowsByTableId({tableId: id, page: 1, limit: tableContext.pageSize});
            // -----

            // Получаем права на колонки
            if (currentUser && id)
                getColumnPermissions({table_id: id, user_id: currentUser.id, columnIds: columns.map(column => parseInt(column.field))});
            // -----
        }
    }, [columnsFromRequest, tableContext.role]);
    useEffect(() => {
        if (tableInfo) {
            setTitle(tableInfo.title);
            setTableContext((prev) => (
                {...prev,
                    table: tableInfo,
                    owner: tableInfo.owner,
                    withCellConfirm: tableInfo.with_cell_confirm,
                    role: tableInfo.role ? tableInfo.role : "user",
                    showLockedRow: tableInfo.show_locked_row
                }));
        }
    }, [tableInfo]);
    useEffect(() => {
        if (lockedCell) setTableContext(prevState => ({...tableContext, lockedCellsIds: lockedCell}));
    }, [lockedCell]);
    useEffect(() => !isVisibleColumnModal ? setSelectedColumnId(null) : () => {
    },   [isVisibleColumnModal]);
    useEffect(() => {
        if (patchedTable) {
            setTitle(patchedTable.title);
            setEditTitle(null);
            setIsTitleEditMode(false);
        }
    }, [isTablePatchSuccess]);
    useEffect(() => {
        if (isRemoveLocksSuccess) setTableContext(prevState => ({...prevState, lockedCellsIds: []}));
    }, [isRemoveLocksSuccess]);
    useEffect(() => {
        if (tableContext.newMessages.length > 0 && !isVisibleChat) {
            let newMessage: MessageModel = tableContext.newMessages[tableContext.newMessages.length - 1];
            // notification.info(({
            //     message: `Новое сообщение от ${newMessage.user_info.last_name} ${newMessage.user_info.first_name}.`,
            //     description: `${newMessage.text}`
            // }))
        }
    }, [tableContext.newMessages]);
    useEffect(() => {
        if (rowsPermissionsFromRequest) {
            setTableContext((prev: TableContextType) => ({...prev, rowPermissions: rowsPermissionsFromRequest}));
        }
    }, [rowsPermissionsFromRequest]);
    useEffect(() => {
        if (columnsPermissionsFromRequest) {
            setTableContext((prev: TableContextType) => ({...prev, columnPermissions: columnsPermissionsFromRequest}));
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
        if (isNormalizeNumbersSuccess && id) {
            document.location.reload();
        }
    }, [isNormalizeNumbersSuccess]);
    // -----

    // Handlers
    const openColumnModalHandler = () => {
        setIsVisibleColumnModal(true);
    };
    const addRowHandler = () => {
        if (id) createRow({tableId: id});
    };
    const saveTitleHandler = () => {
        if (editTitle && id && tableInfo) {
            patchTable({...tableInfo ,title: editTitle});
        }
    };
    const removeLocksHandler = () => {
        if (id) removeLocks(id);
    };
    const exportTableHandler = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `${host}/api/table/${id}/export/xlsx/`
        tmpButton.click();
    };
    const enableChatHandler = () => {
        //localStorage.setItem(`unread_message_count_${id}`, "0");
        setTableContext(prev => ({...prev, newMessages: []}));
        setIsVisibleChat(true);
    };
    const searchHandler = () => {
        if (id) getRowsByTableId({tableId: id, page: 1, limit: tableContext.pageSize, search: searchText});
    };
    const goBackHandler = () => {
        if (id) removeLocks(id);
        navigate("/table_service/tables_list");
    };
    const clearSearchHandler = () => {
        setSearchText("");
        if (id) getRowsByTableId({tableId: id, page: 1, limit: tableContext.pageSize});
    };
    const recalculateFormulasHandler = () => {
        if (id) recalculateFormulas(id);
    }
    const normalizeNumberHandler = () => {
        if (id) normalizeNumbers(id);
    }
    const downloadPivotReportHandler = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `${host}/api/get_251_report`
        tmpButton.click();
    }
    const downloadPivotConsolidatedGroupWorkReport = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `${host}/api/get_crane_cover_report`
        tmpButton.click();
    }
    const downloadPivotConsolidatedTypeWorkReport = () => {
        let tmpButton = document.createElement('a');
        tmpButton.href = `${host}/api/get_work_cover_report`
        tmpButton.click();
    }
    const create_view_table = () => {
        if (id) createTableView(id);
    }

    const pivotItems: MenuProps['items'] = [
        {
            key: 'group',
            label: 'Сводный отчет по группам работ',
        },
        {
            key: 'type',
            label: 'Сводный отчет по видам работ',
        },
    ];
    const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
        if (key === 'type') downloadPivotConsolidatedTypeWorkReport();
        if (key === 'group') downloadPivotConsolidatedGroupWorkReport();
    };
    // -----

    if (isGetTableInfoError)
        return (<Flex justify={'center'} style={{marginTop: 50}}>
            <Result
                status={'403'}
                title={'403'}
                subTitle={'Извините, у вас нет доступа на просмотр этой страницы. Обратитесь в службу поддержки.'}
                extra={<Button type={'primary'} onClick={goBackHandler}>Вернуться на главную</Button>}
            />
        </Flex>)

    return (
        <TableContext.Provider value={tableContext}>
            {(tableInfo && wsChat) && <CoreChat wsChat={wsChat} setContext={setTableContext} visible={isVisibleChat} setVisible={setIsVisibleChat} table={tableInfo}/>}
            <Flex vertical={true} gap={'small'} style={{padding: 5, background: '#fafafa', height: window.innerHeight-10}}>
                {(isVisibleRowModal && selectedRowId) &&
                    <RowSettingsModal rowId={selectedRowId} refresh={() => getRowsByTableId({tableId: id ? id : "0", page: 1, limit: tableContext.pageSize})}
                                      visible={isVisibleRowModal}
                                      setVisible={setIsVisibleRowModal}/>}
                {((tableContext.role == ROLE.ADMIN || tableContext.role == ROLE.OWNER) && isVisibleColumnModal) &&
                    <ColumnSettingsModal
                        id={selectedColumnId}
                        visible={isVisibleColumnModal}
                        setVisible={setIsVisibleColumnModal}
                        refresh={() => getTableColumns(id ?? "999")}
                    />}
                {(isVisibleTableSettingsModal && tableInfo) && <TableSettingsModal setContext={setTableContext} table={tableInfo} visible={isVisibleTableSettingsModal} setVisible={setIsVisibleTableSettingsModal}/>}
                {isVisibleImportRowModal &&
                    <ImportRowsModal visible={isVisibleImportRowModal} setVisible={setIsVisibleImportRowModal}
                                     refresh={() => getRowsByTableId({tableId: id ? id : "0", page: 1, limit: tableContext.pageSize})}/>}
                <Flex align={'center'} justify={'space-between'}>
                    <Flex gap={'middle'} align={'center'}>
                        <Popover placement={'right'} content={'Выйти'}>
                            <Button style={{height: 40}} icon={<ArrowLeftOutlined/>} onClick={goBackHandler}/>
                        </Popover>
                        <Flex vertical>
                            <Flex align={'center'} gap={'small'}>
                                {isTitleEditMode ?
                                    <>
                                        <Input disabled={isTablePatchLoading} style={{width: 200}} value={editTitle ?? ""} onChange={(e) => setEditTitle(e.target.value)}/>
                                        <Popover placement={'bottomRight'} content={'Сохранить название'}>
                                            <Button disabled={isTablePatchLoading} icon={<SaveOutlined/>} onClick={saveTitleHandler}/>
                                        </Popover>
                                        <Popover placement={'bottom'} content={'Отменить'}>
                                            <Button disabled={isTablePatchLoading} danger icon={<CloseOutlined/>} onClick={() => {
                                                setIsTitleEditMode(false);
                                                setEditTitle(null);
                                            }}/>
                                        </Popover>
                                    </>
                                    :
                                    <>
                                        <div style={{fontWeight: 'bold'}}>{title ? title : "Ждем..."}</div>
                                        {(tableContext.role == ROLE.ADMIN || tableContext.role == ROLE.OWNER) &&
                                            <>
                                                <Popover placement={'bottomRight'} content={'Переименовать'}>
                                                    <Button icon={<EditOutlined/>} onClick={() => {
                                                        setIsTitleEditMode(true);
                                                        setEditTitle(title);
                                                    }}/>
                                                </Popover>
                                                <Popover placement={'bottom'} content={'Настройки'}>
                                                    <Button icon={<SettingOutlined/>} onClick={() => {
                                                        setIsVisibleTableSettingsModal(true);
                                                    }}/>
                                                </Popover>
                                            </>
                                        }
                                        <Popover placement={'bottomLeft'} content={'Обсуждение таблицы'}>
                                            <Badge color={'blue'} count={tableContext.unreadMessageCount}>
                                                <Button icon={<MessageOutlined/>} onClick={enableChatHandler}/>
                                            </Badge>
                                        </Popover>
                                    </>
                                }
                            </Flex>
                        </Flex>
                        <Divider type={'vertical'} style={{height: 40}}/>
                        <Flex gap={'small'}>
                            {(tableContext.role == ROLE.ADMIN || tableContext.role == ROLE.OWNER) &&
                                <Popover placement={'bottomRight'} content={'Добавить колонку'}>
                                    <Button icon={<InsertRowRightOutlined />} onClick={openColumnModalHandler}/>
                                </Popover>
                            }
                            <Popover placement={'bottomRight'} content={'Добавить строку'}>
                                <Button disabled={isCreateRowLoading} loading={isCreateRowLoading} icon={<InsertRowBelowOutlined />} onClick={addRowHandler}/>
                            </Popover>
                            <Popover placement={'bottomLeft'} content={'Экспорт таблицы'}>
                                <Button icon={<ExportOutlined />} onClick={exportTableHandler}/>
                            </Popover>
                            {(tableContext.role == ROLE.ADMIN || tableContext.role == ROLE.OWNER) &&
                                <Popover placement={'bottomLeft'} content={'Добавить строки из файла'}>
                                    <Button icon={<ImportOutlined />} onClick={() => setIsVisibleImportRowModal(true)}/>
                                </Popover>
                            }
                            {(tableContext.role == ROLE.ADMIN || tableContext.role == ROLE.OWNER) &&
                                <Popconfirm disabled={isRecalculateFormulasLoading} title={'Вы точно хотите пересчитать формулы?'} okText={"Да, я уверен"} onConfirm={recalculateFormulasHandler}>
                                    <Popover placement={'bottom'}
                                             content={isRecalculateFormulasLoading ? 'Пум-пум-пум... Как много формул 🧮 📱' : 'Пересчитать формулы'}>
                                        <Button className={isRecalculateFormulasLoading ? 'smooth-flashing-rotate-btn' : ''} danger icon={<ReloadOutlined />}/>
                                    </Popover>
                                </Popconfirm>
                            }
                            {(tableContext.role == ROLE.ADMIN || tableContext.role == ROLE.OWNER) &&
                                <Popconfirm disabled={isNormalizeNumbersLoading} title={'Вы точно хотите нормализовать нумерацию?'} okText={"Да, я уверен"} onConfirm={normalizeNumberHandler}>
                                    <Popover placement={'right'}
                                             content={isNormalizeNumbersLoading ? 'Пум-пум-пум... Как много записей 🧮 📱' : 'Нормализовать нумерацию'}>
                                        <Button className={isNormalizeNumbersLoading ? 'smooth-flashing-rotate-btn' : ''} danger icon={<CalculatorOutlined />}/>
                                    </Popover>
                                </Popconfirm>
                            }
                        </Flex>
                        <Divider type={'vertical'} style={{height: 40}}/>
                        <Flex gap={'small'}>
                            <Input placeholder={"Полнотекстовой поиск"} value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
                            <Popover placement={'bottom'} content={'Найти'}>
                                <Button icon={<SearchOutlined/>} onClick={searchHandler} disabled={isTableDataLoading}/>
                            </Popover>
                            <Popover placement={'bottomLeft'} content={'Сбросить поиск'}>
                                <Button danger icon={<CloseOutlined/>} onClick={clearSearchHandler} disabled={isTableDataLoading}/>
                            </Popover>
                        </Flex>
                        <Divider type={'vertical'} style={{height: 40}}/>
                        {id == '275' &&
                            <Dropdown
                                menu={{ items: pivotItems, onClick: handleMenuClick }}
                                placement="bottomRight"
                                trigger={['click']}
                            >
                                <Button icon={<DownOutlined />}>Сводные отчеты</Button>
                            </Dropdown>
                        }
                        {
                            id == '251' && <Button onClick={downloadPivotReportHandler} icon={<FileTextOutlined/>}>Сводный отчет</Button>
                        }
                        <Divider type={'vertical'} style={{height: 40}}/>
                        <Button disabled={tableContext.role != ROLE.ADMIN && tableContext.role != ROLE.OWNER} onClick={create_view_table} loading={tableViewLoading}>Создать представление в БД</Button>
                    </Flex>
                    <Flex style={{fontSize: 12}} vertical gap={'small'}>
                        {wsAlive ?
                            <Flex gap={'small'} align={'center'}>
                                {tableContext.usersOnline.map((online: UserModel) => (
                                    <RandomAvatar key={online.id} user={online} />
                                ))}
                                <Popover placement={'bottomRight'} content={'Все в порядке! Можете работать дальше'}>
                                    <Tag icon={<CheckCircleOutlined/>} color="success">
                                        Соединение активно
                                    </Tag>
                                </Popover>
                            </Flex>
                            :
                            <Popover placement={'bottom'} content={'Что-то не так! Попробуйте перезагрузить страницу, если не поможет, то обращайтесь в службу поддержки 50-125'}>
                                <Tag icon={<CloseCircleOutlined/>} color="error">
                                    Соединение отсутствует
                                </Tag>
                            </Popover>
                        }
                    </Flex>
                </Flex>

                {tableInfo &&
                    <CoreGrid
                        wsCellLocks={wsCellLocksUpdate}
                        wsCellsUpdate={wsCellsUpdate}
                        setContext={setTableContext}
                        insertRow={createRow}
                    />
                }
            </Flex>
        </TableContext.Provider>
    );
};

export default TablePage;