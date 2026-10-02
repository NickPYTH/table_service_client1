import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
import {host} from "shared/config/constants";
import {FilialModel} from "entities/FilialModel";

export const filialAPI = createApi({
    reducerPath: 'filialAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/filials`,
    }),
    tagTypes: ['filial'],
    endpoints: (build) => ({
        getAll: build.mutation<FilialModel[], void>({
            query: () => ({
                url: `/`,
                method: 'GET',
            }),
            invalidatesTags: ['filial']
        }),
        getAllByTableId: build.mutation<FilialModel[], string>({
            query: (tableId) => ({
                url: `/?table_id=${tableId}`,
                method: 'GET',
            }),
            invalidatesTags: ['filial']
        }),
        getAllByRowId: build.mutation<FilialModel[], number>({
            query: (rowId) => ({
                url: `/?row_id=${rowId}`,
                method: 'GET',
            }),
            invalidatesTags: ['filial']
        }),
        getAllByColumnId: build.mutation<FilialModel[], number>({
            query: (columnId) => ({
                url: `/?column_id=${columnId}`,
                method: 'GET',
            }),
            invalidatesTags: ['filial']
        }),
    })
});
