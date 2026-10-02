import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {TablePermissionsModel} from "entities/TablePermissionsModel";

export const tablepermissionsAPI = createApi({
    reducerPath: 'tablepermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/tablepermissions`,
    }),
    tagTypes: ['tablepermissions'],
    endpoints: (build) => ({
        getAllByTableId: build.mutation<TablePermissionsModel[], string>({
            query: (table_id) => ({
                url: `/?table_id=${table_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['tablepermissions']
        }),
        getByTableIdAndUserId: build.mutation<TablePermissionsModel[], { table_id: string, user_id: number }>({
            query: ({table_id, user_id}) => ({
                url: `/?table_id=${table_id}&user_id=${user_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['tablepermissions']
        }),
        create: build.mutation<TablePermissionsModel, { tableId: string, userId: number }>({
            query: ({tableId, userId}) => ({
                url: `/`,
                method: 'POST',
                body: {
                    table: tableId,
                    user_id: userId,
                    can_view: true
                }
            }),
            invalidatesTags: ['tablepermissions']
        }),
        patch: build.mutation<TablePermissionsModel, { id: number, canEdit: boolean, role: string }>({
            query: ({id, canEdit, role}) => ({
                url: `/${id}/`,
                method: 'PATCH',
                body: {
                    id,
                    can_edit: canEdit,
                    role
                }
            }),
            invalidatesTags: ['tablepermissions']
        }),
        delete: build.mutation<void, number>({
            query: (tablePermissionId) => ({
                url: `/${tablePermissionId}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['tablepermissions']
        }),
    })
});
