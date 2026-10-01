import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {ColumnModel} from "entities/ColumnModel";

export const columnAPI = createApi({
    reducerPath: 'columnAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api`,
    }),
    tagTypes: ['column'],
    endpoints: (build) => ({
        create: build.mutation<ColumnModel, ColumnModel>({
            query: (body) => ({
                url: `/columns/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['column']
        }),
        getAllByTableId: build.mutation<ColumnModel[], string>({
            query: (tableId) => ({
                url: `/columns/?table=${tableId}`,
                method: 'GET',
            }),
            invalidatesTags: ['column']
        }),
        get: build.mutation<ColumnModel, number>({
            query: (id) => ({
                url: `/columns/${id}/`,
                method: 'GET',
            }),
            invalidatesTags: ['column']
        }),
        patch: build.mutation<ColumnModel, { id: number, body: ColumnModel }>({
            query: ({id, body}) => ({
                url: `/columns/${id}/`,
                method: 'PATCH',
                body
            }),
            invalidatesTags: ['column']
        }),
        delete: build.mutation<void, number>({
            query: (id) => ({
                url: `/columns/${id}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['column']
        }),
        clearDuplicates: build.mutation<void, number>({
            query: (id) => ({
                url: `/columns/${id}/clear_duplicates/`,
                method: 'GET'
            }),
            invalidatesTags: ['column']
        }),
        setPermissions: build.mutation<void, number>({
            query: (id) => ({
                url: `/set_permissions_by_filial_code_column?column_id=${id}`,
                method: 'GET'
            }),
            invalidatesTags: ['column']
        }),
        updateGeneralFormulaByColumn: build.mutation<void, {formula: string, column_id: number}>({
            query: (body) => ({
                url: `/update_general_formula_by_column`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['column']
        }),
    })
});
