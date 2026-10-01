import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {CellModel} from "entities/CellModel";

export const cellAPI = createApi({
    reducerPath: 'cellAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api/`,
    }),
    tagTypes: ['cell'],
    endpoints: (build) => ({
        patch: build.mutation<CellModel, { id: number, value: any }>({
            query: ({id, value}) => ({
                url: `cells/${id}/`,
                method: 'PATCH',
                body: {
                    value
                }
            }),
            invalidatesTags: ['cell']
        }),
        getAllByTableId: build.mutation<{ count: number, next: string, previous: string, results: CellModel[] }, { tableId: string, page: number, limit: number, search?: string }>({
            query: ({tableId, page, limit, search}) => ({
                url: search ? `cells/?table=${tableId}&page=${page}&limit=${limit}&search=${search}` : `cells/?table=${tableId}&page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            invalidatesTags: ['cell']
        }),
        clearRange: build.mutation<void, number[]>({
            query: (cells_ids) => ({
                url: 'cells_clear_range',
                method: 'POST',
                body: {cells_ids}
            }),
            invalidatesTags: ['cell']
        }),
        updateRange: build.mutation<void, {value: string, id: number, formula_value: string}[]>({
            query: (cells) => ({
                url: 'cells_update_range',
                method: 'POST',
                body: {cells}
            }),
            invalidatesTags: ['cell']
        }),
    })
});
