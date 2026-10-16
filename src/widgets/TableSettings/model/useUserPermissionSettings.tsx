import {useParams} from "react-router-dom";
import {GridCellParams, GridColDef, GridRowParams, useGridApiRef} from "@mui/x-data-grid-premium";
import {useMemo, useState} from "react";

export const useUserPermissionSettings = () => {

    const apiRef: any = useGridApiRef();

    // Params
    const {id} = useParams();
    // -----

    // States
    const [visibleUserPermissionModal, setVisibleUserPermissionModal] = useState(false);
    const [selectedUserPermissionId, setSelectedUserPermissionId] = useState<number | null>(null);
    // -----

    // Handlers
    const createRecordHandler = () => {
        setVisibleUserPermissionModal(true);
    };
    const onCellEditStopHandler = (params: GridCellParams) => {
        const api = apiRef.current;
        if (api && "getCellValue" in api) {
            const prev_value = api.getCellValue(params.id, params.field);
            setTimeout(() => {
                const cellValue = api.getCellValue(params.id, params.field);
                if (prev_value != cellValue) {
                    //({id: params.id as unknown as number, value: cellValue});
                }

            }, 100);
        }
    }
    const onRowDoubleClickHandler = (params: GridRowParams) => {
        setSelectedUserPermissionId(params.id as unknown as number);
        setVisibleUserPermissionModal(true);
    };
    // -----

    // Useful utils
    const dataSource = useMemo(() => ({
        getRows: async (params: any) => {
            const requestOptions = {
                method: 'GET',
                redirect: 'follow' as RequestRedirect
            };

            const response = await fetch(
                `http://localhost:8000/denormalized_column_storage/get_user_table_permissions/?table_id=${id}`,
                requestOptions
            );

            const data = await response.json();

            return {
                rows: data,
            };
        }
    }), [id]);

    const columns: GridColDef[] = useMemo(() => {
        return [
            {
                field: "id",
                headerName: "ИД",
            },
            {
                field: "fio",
                headerName: "ФИО",
                minWidth: 300
            },
            {
                field: "role_name",
                headerName: "Роль",
                minWidth: 200
            }
        ]
    }, []);
    // -----

    return {
        apiRef,
        columns,
        dataSource,
        createRecordHandler,
        onCellEditStopHandler,
        visibleUserPermissionModal,
        setVisibleUserPermissionModal,
        selectedUserPermissionId,
        setSelectedUserPermissionId,
        onRowDoubleClickHandler
    }
}
