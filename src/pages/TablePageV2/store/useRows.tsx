import {useEffect, useMemo} from "react";
import {useParams} from "react-router-dom";
import {useGridApiRef} from "@mui/x-data-grid-premium";
//@ts-ignore
import {debounce} from "lodash";
import {useWebSocket} from "app/providers/WebSocketProvider";

export const useRows = () => {

    // Params
    const {id} = useParams();
    // -----

    // States
    const apiRef = useGridApiRef();
    const { isConnected, registerHandler, sendMessage } = useWebSocket();
    // -----

    // Web requests

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
                // getTableData({
                //     table_id: parseInt(id),
                //     ...pm,
                //     sort: sm,
                //     filter: fm,
                //     group_keys: []
                // });
            } else {
                // getTableData({
                //     table_id: parseInt(id),
                //     ...paginationModel,
                //     sort: sortModel,
                //     filter: filterModel,
                //     group_keys: []
                // });
            }
        }
    }, []);
    useEffect(() => {
        const handler = registerHandler(
            'cell_update',
            (data: { entity: { table_id: number, row_id: number, column_name: string, value: string }[] }) => {
                const api = apiRef.current;
                if (!api) return;

                // Группируем изменения по row_id, чтобы за один вызов обновить все поля строки
                const updatesByRow = new Map<number, Record<string, string>>();

                data.entity.forEach((record) => {
                    const existing = updatesByRow.get(record.row_id) ?? {};
                    existing[record.column_name] = record.value;
                    updatesByRow.set(record.row_id, existing);
                });

                // Формируем массив для updateRows: [{ id, field1: value1, field2: value2 }, ...]
                const rowsToUpdate = Array.from(updatesByRow.entries()).map(([id, fields]) => ({
                    id,
                    ...fields,
                }));

                api.updateRows(rowsToUpdate);
            }
        );
        // Удаляем обработчик при размонтировании компонента
        return handler;
    }, [registerHandler]);
    // -----

    // Handlers

    // -----

    const dataSource = useMemo(() => ({
        getRows: async (params: any) => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            console.log(params)
            const raw = JSON.stringify({
                "table_id": id ?? 99,
                "page": params.paginationModel.page,
                "pageSize": params.paginationModel.pageSize,
                "sort": params.sortModel,
                "filter": params.filterModel,
                "group_keys": params.groupKeys,
                "group_fields": params.groupFields
            });

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow' as RequestRedirect
            };

            const response = await fetch(
                "http://localhost:8000/denormalized_column_storage/get_table_data/",
                requestOptions
            );

            const data = await response.json();

            return {
                rows: data.rows,
                rowCount: data.paginator.total,
            };
        },
        getGroupKey: (row: any) => row.name,
        getChildrenCount: (row: any) => row.childrenCount,
    }), [id]);

    return {
        apiRef,
        dataSource
    }
}
