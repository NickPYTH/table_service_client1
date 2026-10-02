import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {UserModel} from "entities/UserModel";
import {ProfileModel} from "entities/ProfileModel";
import {RowValuePermission} from "entities/RowValuePermission";

export const userAPI = createApi({
    reducerPath: 'userAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api`,
    }),
    tagTypes: ['user'],
    endpoints: (build) => ({
        getCurrent: build.mutation<any, void>({
            query: () => ({
                url: `/get_current_user`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
        getAllByTableId: build.mutation<UserModel[], string>({
            query: (tableId) => ({
                url: `/users/?table_id=${tableId}`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
        getAllByRowId: build.mutation<UserModel[], {tableId: string, rowId: number}>({
            query: ({tableId,  rowId}) => ({
                url: `/users/?table_id=${tableId}&row_id=${rowId}`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
        getAllByColumnId: build.mutation<UserModel[], {tableId: string, columnId: number}>({
            query: ({tableId,  columnId}) => ({
                url: `/users/?table_id=${tableId}&column_id=${columnId}`,
                method: 'GET',
            }),
            invalidatesTags: ['user']
        }),
        search: build.mutation<ProfileModel[], {text: string, id: number, type: string}>({
            query: ({text, id, type}) => ({
                url: `/users_search`,
                method: 'POST',
                body: {text, id, type}
            }),
            invalidatesTags: ['user']
        }),
        getAllById: build.mutation<UserModel[], number[]>({
            query: (user_ids) => ({
                url: `/users/?user_ids=${user_ids}`,
                method: 'GET'
            }),
            invalidatesTags: ['user']
        }),
    })
});
