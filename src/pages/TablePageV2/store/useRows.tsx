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
    const {registerHandler, sendMessage} = useWebSocket();
    // -----

    // Web requests

    // -----

    // Effects
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

                // Формируем массив для updateRows: [{ id, field1: value1, field2: value2 } ]
                const rowsToUpdate = Array.from(updatesByRow.entries()).map(([id, fields]) => ({
                    id,
                    ...fields,
                }));

                api.updateRows(rowsToUpdate);
            }
        );
        // Удаляем обработчик при размонтировании компонента
        return handler;
    }, [registerHandler]); // Обновление ячейки
    useEffect(() => {
        const handler = registerHandler(
            'row_insert',
            (data: { entity: { table_id: number, position: number, value: Record<string, string> } }) => {
                const api = apiRef.current;
                if (!api) return;
                if (id == data.entity.table_id.toString())
                    api.dataSource.fetchRows(undefined, { skipCache: true });
            }
        );
        // Удаляем обработчик при размонтировании компонента
        return handler;
    }, [registerHandler]); // Вставка строки
    useEffect(() => {
        const handler = registerHandler(
            'column_insert',
            (data: { entity: { table_id: number } }) => {
                const api = apiRef.current;
                if (!api) return;
                if (id == data.entity.table_id.toString())
                    api.dataSource.fetchRows(undefined, { skipCache: true });
            }
        );
        // Удаляем обработчик при размонтировании компонента
        return handler;
    }, [registerHandler]); // Вставка колонки
    // -----

    // Handlers

    // -----

    const dataSource = useMemo(() => ({
        getRows: async (params: any) => {
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");
            const raw = JSON.stringify({
                "table_id": id ?? 99,
                "page": params.paginationModel.page,
                "pageSize": params.paginationModel.pageSize,
                "sort": params.sortModel,
                "filter": params.filterModel,
                "group_keys": params.groupKeys,
                "group_fields": params.groupFields,
                "pivot": params.pivotModel,
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
