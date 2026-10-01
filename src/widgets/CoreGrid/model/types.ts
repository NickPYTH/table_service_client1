import {TableContextType} from "pages/TablePage/types";
import {GridApiPremium} from "@mui/x-data-grid-premium/models/gridApiPremium";
import {RefObject} from "react";

export type PropsType = {
    wsCellLocks: WebSocket | null;
    wsCellsUpdate: WebSocket | null;
    setContext: Function;
    insertRow: Function;
};

export type ColorPickerPropsType = {
    isModalOpen: boolean;
    setIsModalOpen: Function;
    refreshTable: Function;
    apiRef: any;
    tableId: string| undefined;
    tableContext:  TableContextType | null;
    setContext: Function;
}
