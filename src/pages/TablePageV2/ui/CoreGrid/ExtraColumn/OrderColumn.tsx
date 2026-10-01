import {GridColDef} from "@mui/x-data-grid-premium";
import {Flex, Tag} from "antd";
import React from "react";

let OrderColumn: GridColDef = {
    disableColumnMenu: true,
    disableReorder: true,
    sortable: false,
    filterable: false,
    field: "order_f",
    headerName: "ИД",
    width: 50,
    aggregable: false,
    renderCell: (data) => (<Flex style={{height: '100%'}} gap={'small'} align={'center'} justify={'center'}>
        <Tag>{data.row['id']}</Tag>
    </Flex>)
};

export default OrderColumn;