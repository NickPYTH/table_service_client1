import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {tableV2API} from "service/TableServiceV2";
import React, {useEffect, useState} from "react";
import {GridColDef, GridRenderEditCellParams} from "@mui/x-data-grid-premium";
import {ColumnHeader} from "pages/TablePageV2/ui/CoreGrid/ColumnHeader";
import {TextEditCell} from "pages/TablePageV2/ui/CoreGrid/EditCell/TextEditCell";
import ActionColumn from "pages/TablePageV2/ui/CoreGrid/ExtraColumn/ActionColumn";
import OrderColumn from "pages/TablePageV2/ui/CoreGrid/ExtraColumn/OrderColumn";

export const useColumns = () => {

    // Params
    const {id} = useParams();
    // -----

    // States
    const [columns, setColumns] = useState<GridColDef[]>([]);
    // -----

    // Web requests
    const [getTableColumns, {
        data: tableColumns,
    }] = tableV2API.useGetColumnsMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id)
            getTableColumns(id);
    }, []);
    useEffect(() => {
        if (tableColumns){
            let columns_l: GridColDef[] = tableColumns.map((column)=> {
                return {
                    field: column.system_name,
                    headerName: column.alternative_name,
                    editable: true,
                    minWidth: 200,
                    type: column.type,
                    renderHeader: () => <ColumnHeader column={column} />,
                    renderEditCell: (params: GridRenderEditCellParams) => {
                        switch (column.type) {
                            case "text":
                                return <TextEditCell params={params}/>
                            default:
                                return <TextEditCell params={params}/>
                        }
                    }
                } as GridColDef;
            });
            columns_l.push(OrderColumn);
            columns_l.push(ActionColumn);
            setColumns(columns_l);
        }
    }, [tableColumns]);
    // -----

    return {
        columns
    }
}