import {useMemo} from "react";
import {GridCellParams, GridColDef, useGridApiRef} from "@mui/x-data-grid-premium";
import {columnV2API} from "service/ColumnV2Service";
import {Button, Flex} from "antd";

export const useSelectTypeGrid = (columnId: number) => {

    const apiRef:any = useGridApiRef();

    // Web requests
    const [createRecord, {
        isSuccess: isCreateRecordSuccess
    }] = columnV2API.useCreateColumnSelectListMutation();
    const [updateRecord, {
        isSuccess: isUpdateRecordSuccess
    }] = columnV2API.useUpdateColumnSelectListMutation();
    const [deleteRecord, {
        isSuccess: isDeleteRecordSuccess
    }] = columnV2API.useDeleteColumnSelectListMutation();
    // -----

    // Effects

    // -----

    // Handlers
    const createRecordHandler = () => {
        createRecord({column_id: columnId, value: ""});
    };
    const onCellEditStopHandler = (params: GridCellParams) => {
        const api = apiRef.current;
        if (api && "getCellValue" in api) {
            const prev_value = api.getCellValue(params.id, params.field);
            setTimeout(() => {
                const cellValue = api.getCellValue(params.id, params.field);
                if (prev_value != cellValue)
                    updateRecord({id: params.id as unknown as number, value: cellValue});

            }, 100);
        }
    }
    // -----

    const dataSource = useMemo(() => ({
        getRows: async (params: any) => {
            const requestOptions = {
                method: 'GET',
                redirect: 'follow' as RequestRedirect
            };

            const response = await fetch(
                `http://localhost:8000/denormalized_column_storage/get_column_select_list/?column_id=${columnId}`,
                requestOptions
            );

            const data = await response.json();

            return {
                rows: data.rows,
            };
        }
    }), [columnId, isCreateRecordSuccess, isUpdateRecordSuccess, isDeleteRecordSuccess]);

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
                minWidth: 200
            },
            {
                field: "delete",
                headerName: "",
                sortable: false,
                disableColumnMenu: true,
                renderCell: params => (
                    <Flex justify={'center'} align={'center'} style={{height:'100%'}}>
                        <Button size={'small'} danger onClick={()=>deleteRecord(params.id as number)}>Удалить</Button>
                    </Flex>
                )
            }
        ]
    }, []);

    return {
        apiRef,
        columns,
        dataSource,
        createRecordHandler,
        onCellEditStopHandler
    }
}