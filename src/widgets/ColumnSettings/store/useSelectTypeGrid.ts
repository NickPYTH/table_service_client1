import {useMemo} from "react";
import {GridColDef} from "@mui/x-data-grid-premium";

export const useSelectTypeGrid = () => {

    const columns: GridColDef[] = useMemo(() => {
        return [
            {
                field: "id",
                headerName: "ИД",
                editable: true
            },
            {
                field: "value",
                headerName: "Значение",
                editable: true,
                minWidth: 300
            }
        ]
    }, []);

    return {
        columns
    }
}