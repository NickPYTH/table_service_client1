import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";

export const rowV2API = createApi({
    reducerPath: 'rowV2API ',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/denormalized_column_storage/`,
    }),
    tagTypes: ['rowV2'],
    endpoints: (build) => ({
        insertRow: build.mutation<void, Record<string, any>>({
            query: (body) => ({
                url: `insert_row/`,
                method: 'POST',
                body
            }),
            invalidatesTags: ['rowV2']
        }),
    })
});
