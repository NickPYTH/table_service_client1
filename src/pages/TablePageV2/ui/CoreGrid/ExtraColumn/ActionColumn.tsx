import {GridColDef} from "@mui/x-data-grid-premium";
import {Button, Flex, Popconfirm} from "antd";
import {DeleteRowOutlined, SettingOutlined} from "@ant-design/icons";
import React from "react";

let ActionColumn: GridColDef = {
    disableColumnMenu: true,
    disableReorder: true,
    field: "action",
    headerName: "",
    width: 80,
    groupable: false,
    aggregable: false,
    sortable: false,
    filterable: false,
    renderCell: (data) => (
        <Flex style={{height: '100%'}} gap={'small'} align={'center'} justify={'center'}>
            <Button size={'small'} icon={<SettingOutlined/>} onClick={() => {

            }}/>
            <Popconfirm title={"Вы точно хотите удалить строку?"} okText={"Да"} onConfirm={() => {
                //deleteRow(data.row.id);
            }}>
                <Button size={'small'} danger icon={<DeleteRowOutlined/>}/>
            </Popconfirm>
        </Flex>)
};

export default ActionColumn;