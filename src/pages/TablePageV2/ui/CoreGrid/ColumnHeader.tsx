import {Flex} from "antd";
import React from "react";
import {GetColumnsTableV2Response} from "pages/TablePageV2";

type ColumnHeaderType = {
    column: GetColumnsTableV2Response
}
export const ColumnHeader = ({column}:ColumnHeaderType) => {
    return(
        <Flex vertical gap={'small'}>
            <div style={{position:'absolute', fontWeight: 800, color:"#1975d0", bottom: 0, left: 2}}>{column.system_name}</div>
            <Flex style={{
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                lineHeight: 1.2,
                textAlign: 'center',
                fontSize: 12
            }}>
                {column.alternative_name}
            </Flex>
        </Flex>
        )
}