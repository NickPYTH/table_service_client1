import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {CellComment} from "entities/CellComment";

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
