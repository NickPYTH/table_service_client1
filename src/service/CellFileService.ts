import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {CellFile} from "entities/CellFileModel";

export const cellFileAPI = createApi({
    reducerPath: 'cellFileAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/cellfiles`,
    }),
    tagTypes: ['cellfile'],
    endpoints: (build) => ({
        createFile: build.mutation<CellFile, FormData>({
            query: (body) => ({
                url: `/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['cellfile']
        }),

        updateFile: build.mutation<CellFile, { id: number; body: FormData }>({
            query: ({ id, body }) => ({
                url: `/${id}/replace/`,
                method: 'POST',
                body,
            }),
            invalidatesTags: ['cellfile']
        }),

        deleteFile: build.mutation<void, number>({
            query: (id) => ({
                url: `/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['cellfile']
        }),

    }),
});
