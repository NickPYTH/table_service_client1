import {useTablePage} from "../store/useTablePage";
import {Button, Divider, Flex, Popover, Tag} from "antd";
import {
    ArrowLeftOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    ExportOutlined,
    InsertRowBelowOutlined,
    InsertRowRightOutlined
} from "@ant-design/icons";
import React from "react";
import {CoreGrid} from "./CoreGrid/CoreGrid";

const TablePage = () => {

    const {
        tableInfo,
    } = useTablePage();

    return(
        <Flex vertical={true} gap={'small'} style={{padding: 5, background: '#fafafa', height: window.innerHeight-10}}>
            <Flex align={'center'} justify={'space-between'}>
            <Flex gap={'middle'} align={'center'}>
                <Popover placement={'right'} content={'Выйти'}>
                    <Button style={{height: 40}} icon={<ArrowLeftOutlined/>} onClick={()=>{}}/>
                </Popover>
                <Flex vertical>
                    <Flex align={'center'} gap={'small'}>
                        <div style={{fontWeight: 'bold'}}>{tableInfo ? tableInfo.table_name: "Ждем..."}</div>
                    </Flex>
                </Flex>
                <Divider type={'vertical'} style={{height: 40}}/>
                <Flex gap={'small'}>
                    <Popover placement={'bottomRight'} content={'Добавить колонку'}>
                        <Button icon={<InsertRowRightOutlined />} onClick={()=>{}}/>
                    </Popover>
                    <Popover placement={'bottomRight'} content={'Добавить строку'}>
                        <Button icon={<InsertRowBelowOutlined />} onClick={()=>{}}/>
                    </Popover>
                    <Popover placement={'bottomLeft'} content={'Экспорт таблицы'}>
                        <Button icon={<ExportOutlined />} onClick={()=>{}}/>
                    </Popover>
                </Flex>
            </Flex>
            <Flex style={{fontSize: 12}} vertical gap={'small'}>
                {1 ?
                    <Flex gap={'small'} align={'center'}>
                        <Popover placement={'bottomRight'} content={'Все в порядке! Можете работать дальше'}>
                            <Tag icon={<CheckCircleOutlined/>} color="success">
                                Соединение активно
                            </Tag>
                        </Popover>
                    </Flex>
                    :
                    <Popover placement={'bottom'} content={'Что-то не так! Попробуйте перезагрузить страницу, если не поможет, то обращайтесь в службу поддержки 50-125'}>
                        <Tag icon={<CloseCircleOutlined/>} color="error">
                            Соединение отсутствует
                        </Tag>
                    </Popover>
                }
            </Flex>
        </Flex>
            <CoreGrid />
        </Flex>
    )
}

export default TablePage;
