import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";

type GetUserTablePermissionResponse = {
    id: number;
    table_id: number;
    user_id: number;
    fio: string;
    role_id: number;
    role_name: string;
}

export const tablePermissionV2API = createApi({
    reducerPath: 'tablePermissionV2API',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/denormalized_column_storage/`,
    }),
    tagTypes: ['tablePermissionV2'],
    endpoints: (build) => ({
        getUserTablePermissions: build.mutation<GetUserTablePermissionResponse[], string>({
            query: (id) => ({
                url: `get_user_table_permissions/?table_id=${id}`,
                method: 'GET',
            }),
            invalidatesTags: ['tablePermissionV2']
        }),
        getUserTablePermission: build.mutation<{username: string, role:string}, number>({
            query: (id) => ({
                url: `get_user_table_permission/?id=${id}`,
                method: 'GET',
            }),
            invalidatesTags: ['tablePermissionV2']
        }),
        updateUserTablePermission: build.mutation<void, {
            table_id: string,
            username: string,
            role: string,
            is_create: boolean,
        }>({
            query: (body) => ({
                url: `update_table_permission/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['tablePermissionV2']
        }),
        removeTablePermission: build.mutation<void, {
            table_id: string,
            username: string,
        }>({
            query: (body) => ({
                url: `remove_table_permission/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['tablePermissionV2']
        }),
    })
});
