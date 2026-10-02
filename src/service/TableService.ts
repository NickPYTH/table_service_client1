import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {TableModel} from "entities/TableModel";

export const tableAPI = createApi({
    reducerPath: 'tableAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/`,
    }),
    tagTypes: ['table'],
    endpoints: (build) => ({
        getAll: build.mutation<TableModel[], void>({
            query: () => ({
                url: `tables/`,
                method: 'GET',
            }),
            invalidatesTags: ['table']
        }),
        get: build.mutation<TableModel, string>({
            query: (id) => ({
                url: `table/${id}/`,
                method: 'GET',
            }),
            invalidatesTags: ['table']
        }),
        create: build.mutation<TableModel, {title: string, with_cell_confirm: boolean, with_cell_logging: boolean}>({
            query: ({title, with_cell_confirm, with_cell_logging}) => ({
                url: `tables/`,
                method: 'POST',
                body: {
                    title,
                    with_cell_confirm,
                    with_cell_logging
                }
            }),
            invalidatesTags: ['table']
        }),
        getLockedCells: build.mutation<{user_id: number, cell_id: number}[], string>({
            query: (table_id) => ({
                url: `table/${table_id}/locks/`,
                method: 'GET'
            }),
            invalidatesTags: ['table']
        }),
        removeLocks: build.mutation<{success: boolean}, string>({
            query: (table_id) => ({
                url: `table/${table_id}/remove_locks/`,
                method: 'GET'
            }),
            invalidatesTags: ['table']
        }),
        patch: build.mutation<TableModel, TableModel>({
            query: (body) => ({
                url: `table/${body.id}/`,
                method: 'PATCH',
                body
            }),
            invalidatesTags: ['table']
        }),
        delete: build.mutation<TableModel, string>({
            query: (id) => ({
                url: `table/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['table']
        }),
        recalculateFormulas: build.mutation<void, string>({
            query: (id) => ({
                url: `recalculate_formulas?table_id=${id}`,
                method: 'GET',
            }),
            invalidatesTags: ['table']
        }),
        normalizeNumbers: build.mutation<void, string>({
            query: (id) => ({
                url: `normalize_numbers?table_id=${id}`,
                method: 'GET',
            }),
            invalidatesTags: ['table']
        }),
        updateRowValuePermissions: build.mutation<{"success":boolean}, number>({
            query: (pk) => ({
                url: `table/${pk}/update_row_value_permissions/`,
                method: 'POST',
            }),
            invalidatesTags: ['table']
        }),
        createTableView: build.mutation<{"success":boolean,"error"?:string,"message"?:string, "view_name"?:string, "columns"?:string[], "row_count"?:string}, string>({
            query: (pk) => ({
                url: `table/${pk}/create_view/`,
                method: 'POST',
            }),
            invalidatesTags: ['table']
        }),
        updateCellsColor: build.mutation<{ success: boolean }, { pk: number; cells: number[]; color: string }>({
            query: ({ pk, cells, color }) => ({
                url: `table/${pk}/set_cell_color/`,
                method: 'POST',
                body: { cells, color },
            }),
            invalidatesTags: ['table'],
        }),
    })
});
