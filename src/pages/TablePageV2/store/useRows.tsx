import {tableV2API} from "service/TableServiceV2";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useParams} from "react-router-dom";
import {GridFilterModel, GridPaginationModel, GridRowGroupingModel, GridSortModel} from "@mui/x-data-grid-premium";
//@ts-ignore
import {debounce} from "lodash";
import {CellValueType} from "pages/TablePageV2/store/types";
import {useWebSocket} from "app/providers/WebSocketProvider";

export const useRows = () => {

    // Params
    const {id} = useParams();
    // -----

    // States
    const { isConnected, registerHandler, sendMessage } = useWebSocket();
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(()=>{
        const model = localStorage.getItem(`table_pagination_${id}`);
        if (model)
            return JSON.parse(model);
        else
            return {page: 0, pageSize: 100};
    });
    const [filterModel, setFilterModel] = useState<GridFilterModel>(() => {
        const model = localStorage.getItem(`table_filter_${id}`);
        if (model)
            return JSON.parse(model);
        else
            return {items: []};
    });
    const [sortModel, setSortModel] = useState<GridSortModel>(() => {
        const model = localStorage.getItem(`table_sort_${id}`);
        if (model)
            return JSON.parse(model);
        else
            return [];
    });
    const [rowGroupingModel, setRowGrouping] = useState<GridRowGroupingModel>(() => {
        const model = localStorage.getItem(`table_row_grouping_${id}`);
        if (model)
            return JSON.parse(model);
        else
            return undefined;
    });
    const [rows, setRows] = useState<Record<string, CellValueType>[]>([]);
    const [rowCount, setRowCount] = useState(0);
    // -----

    // Web requests
    const [getTableData, {
        data: tableData,
    }] = tableV2API.useGetDataMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id){
            if (localStorage.getItem(`table_pagination_${id}`) || localStorage.getItem(`table_filter_${id}`) || localStorage.getItem(`table_sort_${id}`)) {
                const pm_ls = localStorage.getItem(`table_pagination_${id}`);
                let pm;
                if (pm_ls)
                    pm = JSON.parse(pm_ls);
                else
                    pm = {page: 0, pageSize: 100};
                const fm_ls = localStorage.getItem(`table_filter_${id}`);
                let fm;
                if (fm_ls)
                    fm = JSON.parse(fm_ls);
                else
                    fm = {items: []};
                const sm_ls = localStorage.getItem(`table_sort_${id}`);
                let sm;
                if (sm_ls)
                    sm = JSON.parse(sm_ls);
                else
                    sm = [];
                getTableData({
                    table_id: parseInt(id),
                    ...pm,
                    sort: sm,
                    filter: fm,
                    group_keys: []
                });
            } else {
                getTableData({
                    table_id: parseInt(id),
                    ...paginationModel,
                    sort: sortModel,
                    filter: filterModel,
                    group_keys: []
                });
            }
        }
    }, []);
    useEffect(() => {
        if (tableData) {
            setRows(tableData.rows);
            setRowCount(tableData.paginator.totalPages)
        }
    }, [tableData]);
    useEffect(() => {
        const handler = registerHandler(
            'cell_update',
            (data: { entity: {table_id: number, row_id: number, column_name: string, value: string}[] }) => {
                setRows(rows.map((row: Record<string,string>) => {
                    let rowCopy: Record<string,string> | null = null;
                    let updated_row_cell = data.entity.filter((r)=>r.row_id.toString()==row['id']);
                    if (updated_row_cell.length > 0)
                        rowCopy = JSON.parse(JSON.stringify(row));
                    updated_row_cell.forEach((urc)=>{
                        if (rowCopy)
                            rowCopy[urc.column_name] = urc.value;
                    });
                    if (rowCopy) {
                        return rowCopy
                    }
                    return row;
                }));
            }
        );
        // Удаляем обработчик при размонтировании компонента
        return handler;
    }, [registerHandler, rows]);
    // -----

    // Handlers
    const debounceFilter = useCallback(
        debounce((filterModel:GridFilterModel)=>{
            if (id) {
                getTableData({
                    table_id: parseInt(id),
                    ...paginationModel,
                    sort: sortModel,
                    filter: filterModel,
                    group_keys: []
                });
            }
        }, 2000),
        [id, sortModel, paginationModel]
    );
    const setPaginationModelHandler = (model: GridPaginationModel) => {
        if (tableData == undefined) return;
        setPaginationModel(model);
        localStorage.setItem(`table_pagination_${id}`, JSON.stringify(model));
        if (id) {
            getTableData({
                table_id: parseInt(id),
                ...model,
                sort: sortModel,
                filter: filterModel,
                group_keys: []
            })
        }
    }
    const setFilterModelHandler = (model: GridFilterModel) => {
        if (tableData == undefined) return;
        setFilterModel(model);
        localStorage.setItem(`table_filter_${id}`, JSON.stringify(model));
        debounceFilter(model);
    }
    const setSortModelHandler = (model: GridSortModel) => {
        if (tableData == undefined) return;
        setSortModel(model);
        localStorage.setItem(`table_sort_${id}`, JSON.stringify(model));
        if (id) {
            getTableData({
                table_id: parseInt(id),
                ...paginationModel,
                sort: model,
                filter: filterModel,
                group_keys: []
            });
        }
    }
    const setRowGroupingModelHandler = (model: GridRowGroupingModel) => {
        if (tableData == undefined) return;
        setRowGrouping(model);
        localStorage.setItem(`table_row_grouping_{id}`, JSON.stringify(model));
        if (id) {
            getTableData({
                table_id: parseInt(id),
                ...paginationModel,
                sort: sortModel,
                filter: filterModel,
                group_keys: []
            });
        }
    }
    // -----

    return {
        rows,
        rowCount,
        paginationModel,
        setPaginationModelHandler,
        filterModel,
        setFilterModelHandler,
        sortModel,
        setSortModelHandler,
        rowGroupingModel,
        setRowGroupingModelHandler,
    }
}
