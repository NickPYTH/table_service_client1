import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {PermissionModel} from "entities/PermissionModel";

export const columnFilialPermissionsAPI = createApi({
    reducerPath: 'columnfiliapermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/`,
    }),
    tagTypes: ['columnfilialpermissions'],
    endpoints: (build) => ({
        getAllByRowId: build.mutation<PermissionModel[], number>({
            query: (column_id) => ({
                url: `columnfilialpermissions/?column_id=${column_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['columnfilialpermissions']
        }),
        getAllByUserId: build.mutation<PermissionModel[], { user_id: number, table_id: string, columnIds: number[] }>({
            query: ({user_id, table_id, columnIds}) => ({
                url: `columnfilialpermissions/?user_id=${user_id}&table_id=${table_id}&columns_ids=[${columnIds}]`,
                method: 'GET'
            }),
            invalidatesTags: ['columnfilialpermissions']
        }),
        create: build.mutation<PermissionModel, { filial: number, column: number, table: number}>({
            query: ({column, filial, table}) => ({
                url: `columnfilialpermissions/`,
                method: 'POST',
                body: {
                    column_id: column,
                    filial: filial,
                    filial_id: filial,
                    table_id: table,
                    table: table
                }
            }),
            invalidatesTags: ['columnfilialpermissions']
        }),
        patch: build.mutation<PermissionModel, PermissionModel>({
            query: (columnPermission) => ({
                url: `columnfilialpermissions/${columnPermission.id}/`,
                method: 'PATCH',
                body: {
                    column: columnPermission.column,
                    user: columnPermission.user,
                    table: columnPermission.table,
                    can_edit: columnPermission.can_edit,
                    can_view: true
                }
            }),
            invalidatesTags: ['columnfilialpermissions']
        }),
        delete: build.mutation<void, number>({
            query: (columnPermissionId) => ({
                url: `columnfilialpermissions/${columnPermissionId}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['columnfilialpermissions']
        }),
    })
});
