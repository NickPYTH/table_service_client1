import {tableAPI} from "service/TableService";
import {useEffect} from "react";
import {useParams} from "react-router-dom";
import {tableV2API} from "service/TableServiceV2";

export const useTablePage = () => {

    let {id} = useParams();

    const [getTableInfo, {
        data: tableInfo,
        isError: isGetTableInfoError
    }] = tableV2API.useGetMutation();

    useEffect(() => {
        if (id)
            getTableInfo(id);
    }, []);

    return {
        tableInfo
    }
}