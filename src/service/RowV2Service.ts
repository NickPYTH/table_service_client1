import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";

export const rowV2API = createApi({
    reducerPath: 'rowV2API ',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/denormalized_column_storage/`,
    }),
    tagTypes: ['rowV2'],
    endpoints: (build) => ({
        insertRow: build.mutation<void, {
            table_id: string,
            before_id?: number,
            after_id?: number,
            values?: Record<string, string>
        }>({
            query: (body) => ({
                url: `insert_row/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['rowV2']
        }),
    })
});
