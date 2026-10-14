import {useTablePage} from "../store/useTablePage";
import {Flex} from "antd";
import React from "react";
import {CoreGrid} from "./CoreGrid/CoreGrid";
import { PageBar } from "./PageBar";

const TablePage = () => {
    useTablePage();

    return (
        <Flex vertical style={{height: "100vh", background: "#fafafa"}}>
            <PageBar/>
            <Flex vertical style={{flex: 1, minHeight: 0, padding: 5}}>
                <CoreGrid/>
            </Flex>
        </Flex>
    );
};

export default TablePage;
