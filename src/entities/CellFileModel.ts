
export type CellInfo = {
    id: number;
    row: number | null;
    column: number | null;
    value_preview: string | null;
}

export type CellFile = {
    id: number;
    cell: number;
    cell_info: CellInfo;
    filename: string;
    file_extension: string;
    file_size: number | null;
    file_size_kb: number | null;
    content_type: string;
    is_large_file: boolean;
    uploaded_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    version: number;
    previous_file_hash: string | null;
    uploaded_by: string | null;
    description: string | null;
}