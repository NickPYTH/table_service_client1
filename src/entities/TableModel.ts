import {UserModel} from "entities/UserModel";
import {CellModel} from "entities/CellModel";
import {ProfileModel} from "entities/ProfileModel";

export type TableModel = {
    id: number;
    title: string;
    owner: UserModel;
    profile?: ProfileModel;
    created_at: number;
    cells: CellModel[] | null;
    with_cell_confirm: boolean;
    with_cell_logging: boolean;
    show_locked_row: boolean;
    allow_user_insert_row: boolean;
    allow_user_insert_column: boolean;
    open_last_page_by_default: boolean;
    // Роль текущего пользователя системы над таблицей
    role?:string;
}