import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {PermissionModel} from "entities/PermissionModel";

export const rowPermissionsAPI = createApi({
    reducerPath: 'rowPermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/`,
    }),
    tagTypes: ['rowPermissions'],
    endpoints: (build) => ({
        getAllByRowId: build.mutation<PermissionModel[], number>({
            query: (row_id) => ({
                url: `rowpermissions/?row_id=${row_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['rowPermissions']
        }),
        getAllByUserId: build.mutation<PermissionModel[], { user_id: number, table_id: string, rowsIds: number[] }>({
            query: ({user_id, table_id, rowsIds}) => ({
                url: `rowpermissions/?user_id=${user_id}&table_id=${table_id}&rows_ids=[${rowsIds}]`,
                method: 'GET'
            }),
            invalidatesTags: ['rowPermissions']
        }),
        create: build.mutation<PermissionModel, { rowId: number, userId: number, tableId: string }>({
            query: ({rowId, userId, tableId}) => ({
                url: `rowpermissions/`,
                method: 'POST',
                body: {
                    row: rowId,
                    user: userId,
                    table: tableId,
                    can_view: true
                }
            }),
            invalidatesTags: ['rowPermissions']
        }),
        patch: build.mutation<PermissionModel, PermissionModel>({
            query: (rowPermission) => ({
                url: `rowpermissions/${rowPermission.id}/`,
                method: 'PATCH',
                body: {
                    row: rowPermission.row,
                    user: rowPermission.user,
                    table: rowPermission.table,
                    can_edit: rowPermission.can_edit,
                    can_delete: rowPermission.can_delete,
                    can_view: true
                }
            }),
            invalidatesTags: ['rowPermissions']
        }),
        delete: build.mutation<void, number>({
            query: (rowPermissionId) => ({
                url: `rowpermissions/${rowPermissionId}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['rowPermissions']
        }),
        setAllPermission: build.mutation<void, {tableId: string, userId: number}>({
            query: ({tableId, userId}) => ({
                url: `set_all_permission?table_id=${tableId}&user_id=${userId}`,
                method: 'GET'
            }),
            invalidatesTags: ['rowPermissions']
        }),
        removeAllPermission: build.mutation<void, {tableId: string, userId: number}>({
            query: ({tableId, userId}) => ({
                url: `remove_all_permission?table_id=${tableId}&user_id=${userId}`,
                method: 'GET'
            }),
            invalidatesTags: ['rowPermissions']
        }),
    })
});
