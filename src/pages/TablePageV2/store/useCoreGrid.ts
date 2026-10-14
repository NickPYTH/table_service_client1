import {tableV2API} from "service/TableServiceV2";
import {GridApiPremium, GridCellParams} from "@mui/x-data-grid-premium";
import {useParams} from "react-router-dom";
import React, {RefObject, useState} from "react";
import {useSelector} from "react-redux";
import {TableV2ModelStateType} from "store/slice/TableV2Slice";

export const useCoreGrid = (apiRef: RefObject<GridApiPremium | null>) => {

    // Params
    const {id} = useParams();
    // -----

    // Store
    const tableV2State = useSelector((state: { tableV2Slice: TableV2ModelStateType }) => state.tableV2Slice);
    // -----

    // States
    const [gridContextMenu, setGridContextMenu] = useState<{
        mouseX: number;
        mouseY: number;
        rowId: string;
        columnSystemName: string;
    } | null>(null);
    // -----

    // Web requests
    const [updateCell, {}] = tableV2API.useUpdateCellMutation();
    // -----


    // Handlers
    const onCellEditStopHandler = (params: GridCellParams) => {
        setTimeout(() => {
            const api = apiRef.current;
            if (api && "getCellValue" in api) {
                const cellValue = api.getCellValue(params.id, params.field);

                if (id) {
                    updateCell({
                        table_id: id,
                        column_name: params.field,
                        row_id: params.id as unknown as number,
                        value: cellValue
                    });
                }
            }
        }, 100);
    };
    const processPromptHandler = async (prompt: string, context: string, conversationId?: string) => {
        const columns = apiRef.current?.getAllColumns?.() || [];

        // Получаем все загруженные строки
        const rowModelsMap = apiRef.current?.getRowModels?.() || new Map();
        const rows = Array.from(rowModelsMap.values());

        const customContext = columns.map((col) => {
            const examples = [];
            const seen = new Set();
            for (const row of rows) {
                const value = row[col.field];
                if (value != null && !seen.has(value)) {
                    seen.add(value);
                    examples.push(value);
                    if (examples.length >= 5) break;
                }
            }

            return {
                field: col.field,
                description: col.description || null,
                examples: examples,
                type: col.type || 'string',
                allowedOperators: col.filterOperators?.map(op => op.value) || [],
            };
        });

        const contextString = JSON.stringify(customContext);

        const response = await fetch('http://localhost:8000/ai_assistant/process_prompt/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({query: prompt, contextString, conversationId}),
        });

        const result = await response.json();

        if (!result.ok) {
            throw new Error(result.message || 'Ошибка обработки промпта');
        }

        return result.data;
    }
    const handleCellContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();
        const cellEl = event.currentTarget as HTMLElement;
        const rowEl = cellEl.closest('.MuiDataGrid-row') as HTMLElement | null;
        if (!rowEl) return;
        const columnSystemName = cellEl.getAttribute('data-field') ?? "";
        const rowIndexStr = rowEl.getAttribute('data-rowindex');
        if (rowIndexStr != null && apiRef.current) {
            const rowId:any = apiRef.current.getRowIdFromRowIndex(Number(rowIndexStr));
            setGridContextMenu({
                mouseX: event.clientX,
                mouseY: event.clientY,
                rowId,
                columnSystemName,
            });
        }
    };
    // -----

    return {
        tableV2State,
        onCellEditStopHandler,
        processPromptHandler,
        gridContextMenu,
        setGridContextMenu,
        handleCellContextMenu
    }
}
