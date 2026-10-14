import {useParams} from "react-router-dom";
import {useDispatch} from "react-redux";
import {tableV2API} from "service/TableServiceV2";
import React, {useEffect, useState} from "react";
import {GridCellParams, GridColDef, GridRenderEditCellParams} from "@mui/x-data-grid-premium";
import {ColumnHeader} from "pages/TablePageV2/ui/CoreGrid/ColumnHeader";
import {TextEditCell} from "pages/TablePageV2/ui/CoreGrid/EditCell/TextEditCell";
import ActionColumn from "pages/TablePageV2/ui/CoreGrid/ExtraColumn/ActionColumn";
import OrderColumn from "pages/TablePageV2/ui/CoreGrid/ExtraColumn/OrderColumn";
import {setRefreshColumns} from "store/slice/TableV2Slice";
import { SelectEditCell } from "../ui/CoreGrid/EditCell/SelectEditCell";

export const useColumns = () => {

    // Params
    const {id} = useParams();
    // -----

    // Store
    const dispatch = useDispatch();
    // -----

    // States
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>({});
    // -----

    // Web requests
    const [getTableColumns, {
        data: tableColumns,
    }] = tableV2API.useGetColumnsMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) {
            getTableColumns(id);
            dispatch(setRefreshColumns(() => getTableColumns(id)));
        }
    }, []);
    useEffect(() => {
        if (tableColumns) {
            let hiddenColumnsTmp: Record<string, boolean> = {};
            let columns_l: GridColDef[] = tableColumns.map((column) => {
                // Заполняем скрытые колонки
                hiddenColumnsTmp[column.system_name] = !column.hidden;
                // -----
                return {
                    field: column.system_name,
                    headerName: column.alternative_name,
                    editable: true,
                    minWidth: 200,
                    type: column.type,
                    renderHeader: () => <ColumnHeader column={column}/>,
                    renderEditCell: (params: GridRenderEditCellParams) => {
                        switch (column.type) {
                            case "text":
                                return <TextEditCell params={params}/>
                            case "list":
                                return <SelectEditCell params={params} columnId={column.id}/>
                            default:
                                return <TextEditCell params={params}/>
                        }
                    }
                } as GridColDef;
            });
            setHiddenColumns(hiddenColumnsTmp);
            columns_l.push(OrderColumn);
            columns_l.push(ActionColumn);
            setColumns(columns_l);
        }
    }, [tableColumns]);
    // -----

    // Handlers
    const isCellEditableHandler = (p: GridCellParams) => {
        let column = tableColumns?.find(c => c.system_name == p.field);
        return column ? !column.readonly : true;
    }
    // -----

    return {
        columns,
        hiddenColumns,
        isCellEditableHandler
    }
}