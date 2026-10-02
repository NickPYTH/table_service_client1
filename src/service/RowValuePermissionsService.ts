import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {RowValuePermission} from "entities/RowValuePermission";

export const rowValuePermissionsApi = createApi({
    reducerPath: 'rowValuePermissionsAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/rowvaluepermissions`,
    }),
    tagTypes: ['rowValuePermissions'],
    endpoints: (build) => ({
        getAllByTableId: build.mutation<RowValuePermission[], number>({
            query: (table_id) => ({
                url: `/?table_id=${table_id}`,
                method: 'GET'
            }),
            invalidatesTags: ['rowValuePermissions']
        }),
        create: build.mutation<RowValuePermission, RowValuePermission>({
            query: (body) => ({
                url: `/`,
                method: 'POST',
                body: body,
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            invalidatesTags: ['rowValuePermissions']
        }),
        delete: build.mutation<void, number>({
            query: (id: number) => ({
                url: `/${id}/`,
                method: 'DELETE'
            }),
            invalidatesTags: ['rowValuePermissions']
        }),
    })
});
