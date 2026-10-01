import {DataGrid} from "shared/component/DataGrid";
import {useEffect} from "react";
import {cellEditLogAPI} from "service/CellEditLogService";
import {Modal} from "antd";
import { GridColDef } from "@mui/x-data-grid-premium";

type PropsType = {
    rowId: any,
    visible: boolean,
    setVisible: Function
}

export const EditLogModal = (props:PropsType) => {

    // Web requests
    const [getLogs, {
        data: logs,
        isLoading: isLogsLoading
    }] = cellEditLogAPI.useGetAllByRowIdMutation();
    // -----

    // Effects
    useEffect(() => {
        getLogs(props.rowId);
    }, []);
    // -----

    // Useful utils
    let columns: GridColDef[] = [
        {
            field: "id",
            headerName: "ИД",
        },
        {
            field: "user",
            headerName: "Пользователь",
            width: 200
        },
        {
            field: "new_value",
            headerName: "Значение",
            width: 200
        },
        {
            field: "cell",
            headerName: "Ячейка",
            width: 200
        },
    ];
    // -----

    return (
        <Modal title={"История"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               loading={isLogsLoading}
               width={'1000px'}
               footer={null}
        >
            <DataGrid columns={columns} gridData={logs} setSelected={() => {}} setModalVisible={() => {}} />
        </Modal>
    )
}