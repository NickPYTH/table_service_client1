import {GridFilterModel, GridSortModel} from "@mui/x-data-grid-premium";

type TableV2ContextType = {
    isVisibleColumnSettingsModal: boolean;
    selectedColumnSettingsId: number | null;
}

type CellValueType = string | number[] | number | boolean;

type GetDataTableV2Request = {
    table_id: number;
    page: number;
    pageSize: number;
    sort: GridSortModel;
    filter: GridFilterModel;
    group_keys: string[];
}

type GetDataTableV2Response = {
    columns: string[];
    rows: Record<string, CellValueType>[];
    paginator: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    }
}

type GetColumnsTableV2Response = {
    id: number;
    system_name: string;
    alternative_name: string;
    type: string;
}

type GetCellFormulaTableV2Request = {
    table_id: string;
    column_system_name: string;
    row_id: number;
}

type GetCellFormulaTableV2Response = {
    formula: string | null;
}

type UpdateCellTableV2Request = {
    table_id: string;
    column_name: string;
    row_id: number;
    value: string;
}

type UpdateCellTableV2Response = {
    result: string;
}

type UpdateColumnTableV2Request = {
    table_id: string;
    column_system_name: string;
    column_alternative_name: string;
    type: string;
}

type UpdateColumnTableV2Response = {
    result: string;
}

export {
    TableV2ContextType,
    CellValueType,
    GetDataTableV2Request,
    GetDataTableV2Response,
    GetColumnsTableV2Response,
    GetCellFormulaTableV2Request,
    GetCellFormulaTableV2Response,
    UpdateCellTableV2Request,
    UpdateCellTableV2Response,
    UpdateColumnTableV2Request,
    UpdateColumnTableV2Response
}
