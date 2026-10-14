import {Input} from "@mui/material";
import {GridRenderEditCellParams} from "@mui/x-data-grid-premium";
import {Flex, Spin} from "antd";
import {tableV2API} from "service/TableServiceV2";
import {useEffect} from "react";
import {useParams} from "react-router-dom";

type PropsType = {
    params: GridRenderEditCellParams;
}
export const TextEditCell = ({params}: PropsType) => {

    // Params
    const {id} = useParams();
    const {field, value, api, id: rowId} = params;
    // -----

    // States

    // -----

    // Web requests
    const [getCellFormula, {
        isLoading: isGetCellFormulaLoading,
        isSuccess: isGetCellFormulaSuccess,
        data: cellFormula,
    }] = tableV2API.useGetCellFormulaMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) {
            getCellFormula({
                table_id: id,
                column_system_name: field,
                row_id: rowId as unknown as number
            });
        }
    }, []);
    useEffect(() => {
        if (cellFormula && isGetCellFormulaSuccess){
            api.setEditCellValue({id:rowId, field, value:cellFormula.formula})
        }
    }, [cellFormula, isGetCellFormulaSuccess]);
    // -----

    // Handlers
    const changeValueHandler = (value:string) => {
       api.setEditCellValue({id:rowId, field, value});
    }
    // -----
    if (isGetCellFormulaLoading)
        return <Flex justify={'center'} align={'center'} style={{width: '100%'}}><Spin /></Flex>
    return(
        <Input
            autoFocus={true}
            fullWidth
            value={value}
            onChange={(e)=>changeValueHandler(e.target.value)}
        />
    )
}
