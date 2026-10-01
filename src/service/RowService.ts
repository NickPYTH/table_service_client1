import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/dist/query/react";
import {host} from "shared/config/constants";
import {RowModel} from "entities/RowModel";
import {GridFilterItem, GridLogicOperator, GridSortDirection} from "@mui/x-data-grid-premium";

export const rowAPI = createApi({
    reducerPath: 'rowAPI',
    baseQuery: fetchBaseQuery({
        baseUrl: `${host}/api`,
    }),
    tagTypes: ['row'],
    endpoints: (build) => ({
        create: build.mutation<RowModel, {tableId: string, position?: number, withCopy?: boolean, currentRowId?: number}>({
            query: ({tableId, position, withCopy, currentRowId}) => ({
                url: `/row/`,
                method: 'POST',
                body: {
                    table: tableId,
                    position,
                    withCopy,
                    currentRowId
                }
            }),
            invalidatesTags: ['row']
        }),
        delete: build.mutation<void, number>({
            query: (id) => ({
                url: `/row/${id}/`,
                method: 'DELETE',
            }),
            invalidatesTags: ['row']
        }),
        getAllByTableId: build.mutation<{ count: number, next: string, previous: string, results: RowModel[], total_pages: number },
            { tableId: string, page: number, limit: number, search?: string, sortField?: number[], sortDirection?: GridSortDirection }>({
            query: ({tableId, page, limit, search, sortField, sortDirection}) => {
                page += 1;
                let sort = '';
                if (sortField && sortDirection) sort = `&sort_field=${`[${sortField.toString()}]`}&sort_direction=${sortDirection}`
                return {
                    url: search ?
                        `/rows/?table=${tableId}&page=${page}&limit=${limit}&search=${search}${sort}`
                        :
                        sort ?
                            `/rows/?table=${tableId}&page=${page}&limit=${limit}${sort}`
                            :
                            `/rows/?table=${tableId}&page=${page}&limit=${limit}`,
                    method: 'GET'
                }
            },
            invalidatesTags: ['row']
        }),
        getAllByTableIdWithColumnFilter: build.mutation<{ count: number, next: string, previous: string, results: RowModel[] },
            { tableId: string, page: number, limit: number, filters: GridFilterItem[], mode?: GridLogicOperator, sortField?: number[], sortDirection?: GridSortDirection }>({
            query: ({tableId, page, limit, filters, mode, sortField, sortDirection}) => {
                // Используем URLSearchParams для правильного порядка
                const params = new URLSearchParams();

                // ВАЖНО: СНАЧАЛА ДОБАВЛЯЕМ table (всегда первый)
                page = page + 1
                params.append('table', tableId);
                params.append('page', page.toString());
                params.append('limit', limit.toString());
                params.append('is_column_search', 'True');

                // Добавляем mode, если есть
                if (mode) {
                    params.append('column_search_mode', mode);
                }

                // Добавляем фильтры - они добавятся в порядке добавления, но после основных параметров
                if (filters && Array.isArray(filters)) {
                    filters.forEach((filter) => {
                        if (filter.value) {
                            params.append("column", filter.field);
                            params.append("data", filter.value);
                            params.append("operator", filter.operator);
                        }
                    });
                }

                // Добавляем сортировку
                if (sortField && sortDirection) {
                    params.append('sort_field', `[${sortField.toString()}]`);
                    params.append('sort_direction', sortDirection);
                }

                return {
                    url: `/rows/?${params.toString()}`,
                    method: 'GET'
                }
            },
            invalidatesTags: ['row']
        }),
    })
});
