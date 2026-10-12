import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {UpdateColumnTableV2Request, UpdateColumnTableV2Response} from "pages/TablePageV2";
import {ColumnV2Model} from "entities/ColumnV2Model";

export const columnV2API = createApi({
    reducerPath: 'columnV2API ',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/denormalized_column_storage/`,
    }),
    tagTypes: ['columnV2'],
    endpoints: (build) => ({
        updateColumn: build.mutation<UpdateColumnTableV2Response, UpdateColumnTableV2Request>({
            query: (body) => ({
                url: `update_column/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['columnV2']
        }),
        getColumn: build.mutation<ColumnV2Model, { table_id: string, column_system_name: string }>({
            query: ({table_id, column_system_name}) => ({
                url: `get_column/?table_id=${table_id}&system_name=${column_system_name}`,
                method: 'GET'
            }),
            invalidatesTags: ['columnV2']
        }),
        createColumnSelectList: build.mutation<void, { column_id: number, value: string }>({
            query: (body) => ({
                url: `create_column_select_list/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['columnV2']
        }),
        updateColumnSelectList: build.mutation<void, { id: number, value: string }>({
            query: (body) => ({
                url: `update_column_select_list/`,
                method: 'PATCH',
                body
            }),
            invalidatesTags: ['columnV2']
        }),
        deleteColumnSelectList: build.mutation<void, number>({
            query: (id) => ({
                url: `delete_column_select_list/?id=${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['columnV2']
        }),
    })
});
