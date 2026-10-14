import {useEffect} from "react";
import { useDispatch } from "react-redux";
import {useParams} from "react-router-dom";
import {tableV2API} from "service/TableServiceV2";
import {setTableName} from "store/slice/TableV2Slice";

export const useTablePage = () => {

    // Params
    let {id} = useParams();
    // -----

    // Store
    const dispatch = useDispatch();
    // -----

    // Web requests
    const [getTableInfo, {
        data: tableInfo,
    }] = tableV2API.useGetMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) getTableInfo(id);
    }, []);
    useEffect(() => {
        if (tableInfo){
            dispatch(setTableName(tableInfo.table_name));
        }
    }, [tableInfo]);
    // -----

    return {
    }
}
