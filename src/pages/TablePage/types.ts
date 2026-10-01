import {GridColDef, GridFilterModel, GridRowId, GridSortModel} from "@mui/x-data-grid-premium";
import {PermissionModel} from "entities/PermissionModel";
import {TablePermissionsModel} from "entities/TablePermissionsModel";
import {ColumnModel} from "entities/ColumnModel";
import {MessageModel} from "entities/MessageModel";
import {TableModel} from "entities/TableModel";
import {UserModel} from "entities/UserModel";


export type DataRowModel = {
    id: GridRowId;
    order: number;
};

export type TableContextType = {
    table: TableModel | null, // TODO Убрать дубликаты свойств
    role: string | null,
    withCellConfirm: boolean,
    ws: WebSocket | null;
    demonWS: WebSocket | null;
    lockedCellsIds: { user_id: number, cell_id: number }[];
    rowPermissions: PermissionModel[] | null;
    columnPermissions: PermissionModel[] | null;
    tablePermission: TablePermissionsModel | null;
    rows: DataRowModel[];
    columns: GridColDef[];
    columnsModels: ColumnModel[];
    pageSize: number;
    refresh: Function;
    paginationModel: {
        pageSize: number,
        page: number
    };

    // Параметры модалки по настройке колонок
    setSelectedColumnId: (id: number) => void;
    setIsVisibleColumnSettingsModal: (isVisible: boolean) => void;
    // -----

    // Параметры модалки по настройке строк
    setSelectedRowId: (id: number) => void;
    setIsVisibleRowSettingsModal: (isVisible: boolean) => void;
    // -----

    // Данные о чате
    newMessages: MessageModel[];
    unreadMessageCount: number;
    // -----

    //Показ заблокированных ячеек
    showLockedRow: boolean;

    usersOnline: UserModel[];

};