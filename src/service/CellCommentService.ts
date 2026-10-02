import {host} from "shared/config/constants";
import {CellComment} from "entities/CellComment";
import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";

export const cellCommentAPI = createApi({
    reducerPath: 'cellCommentAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/cellcomment`,
    }),
    tagTypes: ['cellcomment'],
    endpoints: (build) => ({
        getAll: build.mutation<CellComment[], void>({
            query: () => ({
                url: `/`,
                method: 'GET',
            }),
            invalidatesTags: ['cellcomment']
        }),
    })
});
