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
    })
});
