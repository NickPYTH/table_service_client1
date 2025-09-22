import {ColumnModel} from "entities/ColumnModel";
import {useContext, useEffect, useState} from "react";
import {TableContext} from "pages/TablePage/ui/TablePage";
import {RootStateType} from "store/store";
import {useSelector} from "react-redux";

type PropsType = {
    formattedValue: string,
    column: ColumnModel,
    row: any,
}
export const Cell = (props: PropsType) => {

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    // ----

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // States
    const [isLocked, setIsLocked] = useState(false);
    // -----

    // Effects
    useEffect(() => {
        if (tableContext){
            let columnId:number = props.column.id as number;
            setIsLocked(!!tableContext.lockedCellsIds.find((lock => lock.cell_id == props.row[columnId].id && currentUser?.id != lock.user_id)))
        }
    }, [tableContext]);
    // -----

    return(
        <div
            style={{minHeight: 30, background: isLocked ? "#c4c4c4" : "inherit"}}>
            {props.formattedValue}
        </div>
    )
}