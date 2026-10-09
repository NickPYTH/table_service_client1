import {useEffect} from "react";
import {useParams} from "react-router-dom";
import {tableV2API} from "service/TableServiceV2";

export const useTablePage = () => {

    // Params
    let {id} = useParams();
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
    // -----

    return {
        tableInfo
    }
}
