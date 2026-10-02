import {tableV2API} from "service/TableServiceV2";
import {GridCellParams, useGridApiRef} from "@mui/x-data-grid-premium";
import {useParams} from "react-router-dom";
import {GridApiPremium} from "@mui/x-data-grid-premium/models/gridApiPremium";
import {RefObject} from "react";

export const useCoreGrid = (apiRef:RefObject<GridApiPremium | null>) => {

    // Params
    const {id} = useParams();
    // -----

    // Web requests
    const [updateCell, {
    }] = tableV2API.useUpdateCellMutation();
    // -----


    // Handlers
    const onCellEditStopHandler = (params:  GridCellParams) => {
        // Снимаем блокировку
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
    // -----

    return {
        onCellEditStopHandler,
    }
}
