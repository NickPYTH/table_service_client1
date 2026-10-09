import {tableV2API} from "service/TableServiceV2";
import {GridCellParams, useGridApiRef} from "@mui/x-data-grid-premium";
import {useParams} from "react-router-dom";
import {GridApiPremium} from "@mui/x-data-grid-premium/models/gridApiPremium";
import {RefObject} from "react";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {TableV2ModelStateType} from "store/slice/TableV2Slice";

export const useCoreGrid = (apiRef:RefObject<GridApiPremium | null>) => {

    // Params
    const {id} = useParams();
    // -----

    // Store
    const tableV2State = useSelector((state:{tableV2Slice:TableV2ModelStateType}) => state.tableV2Slice);
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
        tableV2State,
        onCellEditStopHandler,
    }
}
