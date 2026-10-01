export type CellModel = {
    id: number;
    row: number;
    column: number;
    value: any;
    formula_value: string;
    files : string[];

    // Вычисляемые поля
    type?: string
    color?: string
}

export interface CellFileInfo {
    id: number;
    filename: string;
    file_size: number | null;
    file_extension: string;
    content_type: string;
    version: number;
    uploaded_at: string;
    updated_at: string;
}