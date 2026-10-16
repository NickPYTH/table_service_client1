import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";

type GetFilialTablePermissionResponse = {
    id: number;
    table_id: number;
    filial_id: number;
    filial: string;
    role_id: number;
    role_name: string;
}

export const tableFilialPermissionV2API = createApi({
    reducerPath: 'tableFilialPermissionV2API',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/denormalized_column_storage/`,
    }),
    tagTypes: ['tableFilialPermissionV2'],
    endpoints: (build) => ({
        getFilialTablePermissions: build.mutation<GetFilialTablePermissionResponse[], string>({
            query: (id) => ({
                url: `get_table_filial_permissions/?table_id=${id}`,
                method: 'GET',
            }),
            invalidatesTags: ['tableFilialPermissionV2']
        }),
        getFilialTablePermission: build.mutation<{ filial: string, role: string }, number>({
            query: (id) => ({
                url: `get_table_filial_permission/?id=${id}`,
                method: 'GET',
            }),
            invalidatesTags: ['tableFilialPermissionV2']
        }),
        updateFilialTablePermission: build.mutation<void, {
            table_id: string,
            filial: string,
            role: string,
            permission_id: number | null,
        }>({
            query: (body) => ({
                url: `update_table_filial_permission/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['tableFilialPermissionV2']
        }),
        removeTableFilialPermission: build.mutation<void, {
            permission_id: number,
        }>({
            query: (body) => ({
                url: `remove_table_filial_permission/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['tableFilialPermissionV2']
        }),
    })
});
