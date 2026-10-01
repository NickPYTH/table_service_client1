import {tableV2API} from "service/TableServiceV2";
import {GridCellParams, useGridApiRef} from "@mui/x-data-grid-premium";
import {useParams} from "react-router-dom";


export const useCoreGrid = () => {

    // Params
    const {id} = useParams();
    // -----

    // Ref
    const apiRef = useGridApiRef();
    // -----

    // Web requests
    const [updateCell, {
    }] = tableV2API.useUpdateCellMutation();
    // -----


    // Handlers
    const onCellEditStopHandler = (params:  GridCellParams) => {
        // Снимаем блокировку
        setTimeout(() => {
            console.log('I M HERE')
            //@ts-ignore
            let cellValue = apiRef.current.getCellValue(params.id, params.field);
            if (id) {
                updateCell({
                    table_id: id,
                    column_name: params.field,
                    row_id: params.id as unknown as number,
                    value: cellValue
                });
            }
        }, 100);
    };
    // -----

    return {
        onCellEditStopHandler,
        apiRef
    }
}
