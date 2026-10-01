export type RowValuePermission = {
    id: number;
    table_id: number;
    column_id: number;
    user_ids: number[];
    cell_value: string;
}