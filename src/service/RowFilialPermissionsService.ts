import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {RowFilialPermissionsModel} from "entities/RowFilialPermissionsModel";
import {FilialModel} from "entities/FilialModel";
import {RowModel} from "entities/RowModel";

export const rowFilialPermissionsAPI = createApi({
    reducerPath: 'rowFilialPermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/rowfilialpermissions`,
    }),
    tagTypes: ['rowFilialPermissions'],
    endpoints: (build) => ({
        getAllByRowId: build.mutation<RowFilialPermissionsModel[], number>({
            query: (row_id) => ({
                url: `/?row_id=${row_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['rowFilialPermissions']
        }),
        create: build.mutation<RowFilialPermissionsModel, {row: number, filial: number}>({
            query: ({row, filial}) => ({
                url: `/`,
                method: 'POST',
                body: {
                    row,
                    filial,
                    can_edit: true,
                    can_delete: true,
                }
            }),
            invalidatesTags: ['rowFilialPermissions']
        }),
        delete: build.mutation<void, number>({
            query: (rowPermissionId) => ({
                url: `/${rowPermissionId}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['rowFilialPermissions']
        }),
    })
});
