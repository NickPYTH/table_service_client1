import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {TableModel} from "entities/TableModel";
import {TableV2Model} from "entities/TableV2Model";
import {
    GetCellFormulaTableV2Request,
    GetCellFormulaTableV2Response,
    GetColumnsTableV2Response,
    GetDataTableV2Request,
    GetDataTableV2Response,
    UpdateCellTableV2Request,
    UpdateCellTableV2Response,
    UpdateColumnTableV2Request,
    UpdateColumnTableV2Response
} from "pages/TablePageV2";
import {ColumnV2Model} from "entities/ColumnV2Model";

export const tableV2API = createApi({
    reducerPath: 'tableV2API',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/denormalized_column_storage/`,
    }),
    tagTypes: ['tableV2'],
    endpoints: (build) => ({
        getAll: build.mutation<TableModel[], void>({
            query: () => ({
                url: `get_table_list/`,
                method: 'GET',
            }),
            invalidatesTags: ['tableV2']
        }),
        get: build.mutation<TableV2Model, string>({
            query: (id) => ({
                url: `get_table_info/`,
                method: 'POST',
                body: {
                    "table_id": id
                }
            }),
            invalidatesTags: ['tableV2']
        }),
        getData: build.mutation<GetDataTableV2Response, GetDataTableV2Request>({
            query: (body) => ({
                url: `get_table_data/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['tableV2']
        }),
        getColumns: build.mutation<GetColumnsTableV2Response[], string>({
            query: (id) => ({
                url: `get_table_columns/?table_id=${id}`,
                method: 'GET'
            }),
            invalidatesTags: ['tableV2']
        }),
        getCellFormula: build.mutation<GetCellFormulaTableV2Response, GetCellFormulaTableV2Request>({
            query: (body) => ({
                url: `get_cell_formula/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['tableV2']
        }),
        updateCell: build.mutation<UpdateCellTableV2Response, UpdateCellTableV2Request>({
            query: (body) => ({
                url: `update_cell/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['tableV2']
        }),
        updateColumn: build.mutation<UpdateColumnTableV2Response, UpdateColumnTableV2Request>({
            query: (body) => ({
                url: `update_column/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['tableV2']
        }),
        getColumn: build.mutation<ColumnV2Model, {table_id:string, column_system_name:string}>({
            query: ({table_id, column_system_name}) => ({
                url: `get_column/?table_id=${table_id}&system_name=${column_system_name}`,
                method: 'GET'
            }),
            invalidatesTags: ['tableV2']
        }),
    })
});
