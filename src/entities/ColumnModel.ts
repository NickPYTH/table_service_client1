
export type ColumnModel = {
    id?: number;
    name: string;
    order?: number;
    data_type: any;
    table?: string;
    select_values?: {
        name: string,
        filial_owner_code: string | null
    }[];
    related_column_ids: number[];
    related_number_column_id?: number[];
    default_value?: string;
    default_value_from_user_filial_code: boolean;
    default_value_from_prev_row: boolean;
    available_if_confirm_mode_enabled: boolean;
    hidden: boolean;
    disabled: boolean;
    required: boolean;

    // Вычисляемые поля (для копирования колонок)
    withCopy?: boolean;
}
