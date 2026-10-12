import {tableV2API} from "service/TableServiceV2";
import {
    GridApiPremium,
    GridCellParams,
    unstable_gridDefaultPromptResolver as promptResolver
} from "@mui/x-data-grid-premium";
import {useParams} from "react-router-dom";
import {RefObject} from "react";
import {useSelector} from "react-redux";
import {TableV2ModelStateType} from "store/slice/TableV2Slice";

export const useCoreGrid = (apiRef: RefObject<GridApiPremium | null>) => {

    // Params
    const {id} = useParams();
    // -----

    // Store
    const tableV2State = useSelector((state: { tableV2Slice: TableV2ModelStateType }) => state.tableV2Slice);
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
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: prompt, contextString, conversationId }),
        });

        const result = await response.json();

        if (!result.ok) {
            throw new Error(result.message || 'Ошибка обработки промпта');
        }

        return result.data;
    }
    // -----

    return {
        tableV2State,
        onCellEditStopHandler,
        processPromptHandler
    }
}
