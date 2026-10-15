import {BgColorsOutlined, CopyOutlined, DeleteOutlined, HistoryOutlined, PlusOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import {Dropdown} from "antd";
import {rowV2API} from "service/RowV2Service";
import {useParams} from "react-router-dom";
import {useNotification} from "app/providers/NotificationProvider";
import {excludeColumns} from "shared/config/constants";
import {columnV2API} from "service/ColumnV2Service";

export const GridContextMenu = ({apiRef, gridContextMenu, setGridContextMenu}: any) => {
    console.log()
    // Params
    const {id} = useParams();
    // -----

    // Notifications
    const notification = useNotification();
    // -----

    // Web requests
    const [insertRow, {
        isSuccess: isInsertRowSuccess,
    }] = rowV2API.useInsertRowMutation();
    const [insertColumn, {
        isSuccess: isInsertColumnSuccess,
    }] = columnV2API.useInsertColumnMutation();
    // -----

    // Effects
    useEffect(() => {
        if (isInsertRowSuccess)
            notification.success({
                message: "Успешно",
                description: "Строка вставлена"
            });
    }, [isInsertRowSuccess]);
    useEffect(() => {
        if (isInsertColumnSuccess)
            notification.success({
                message: "Успешно",
                description: "Столбец добавлен"
            });
    }, [isInsertColumnSuccess]);
    // -----

    // Handlers
    const insertRowHandler = (position: string | null, withValues: boolean) => {
        if (id) {
            if (apiRef?.current) {
                const row = apiRef?.current?.getRow(gridContextMenu.rowId);
                let values: Record<string, string> = {};
                if (withValues)
                    Object.keys(row).filter(k => !excludeColumns.includes(k)).forEach((filtered_key: string) => {
                        values[filtered_key] = row[filtered_key];
                    });
                let requestParams: Record<string, any> = {
                    table_id: id,
                    values
                }
                if (position)
                    requestParams[position] = gridContextMenu.rowId;
                insertRow(requestParams);
            }
            setGridContextMenu(null);
        }
    };
    const insertColumnHandler = (position_name: string | null) => {
        if (id) {
            if (apiRef?.current) {
                let requestParams: Record<string, any> = {
                    table_id: id,
                    neighborhood_system_name: gridContextMenu.columnSystemName,
                    position_name,
                    alternative_name: "Новая колонка",
                    column_type: 'text',
                    hidden: false,
                    required: false,
                    readonly: false
                } 
                insertColumn(requestParams);
            }
        }
    }
    // -----

    const contextMenuItems = [
        {
            key: 'add-before',
            label: 'Добавить строку "до" пустую',
            icon: <PlusOutlined/>,
            onClick: () => insertRowHandler('before_id', false),
        },
        {
            key: 'add-before-with-copy',
            label: 'Добавить строку "до" и скопировать данные',
            icon: <CopyOutlined/>,
            onClick: () => insertRowHandler('before_id', true),
        },
        {
            key: 'add-after',
            label: 'Добавить строку "после" пустую',
            icon: <PlusOutlined/>,
            onClick: () => insertRowHandler('after_id', false),
        },
        {
            key: 'add-after-with-copy',
            label: 'Добавить строку "после" и скопировать данные',
            icon: <CopyOutlined/>,
            onClick: () => insertRowHandler('after_id', true),
        },
        {
            key: 'add-column-before',
            label: 'Добавить столбец слева',
            icon: <PlusOutlined/>,
            onClick: () => insertColumnHandler('before_id'),
        },
        {
            key: 'add-column-after',
            label: 'Добавить столбец справа',
            icon: <PlusOutlined/>,
            onClick: () => insertColumnHandler('after_id'),
        },
        {
            key: 'show-history',
            label: 'Просмотреть историю изменений',
            icon: <HistoryOutlined/>,
            onClick: () => {
            },
        },
        {
            key: 'copy-content',
            label: 'Растянуть значения',
            icon: <PlusOutlined/>,
            onClick: () => {
            },
        },
        {
            key: 'clear-content',
            label: 'Очистить',
            icon: <DeleteOutlined/>,
            onClick: () => {
            },
        },
        {
            key: 'color-picker',
            label: 'Выбрать цвет',
            icon: <BgColorsOutlined/>,
            onClick: () => {
            },
        }
    ];

    return (
        <Dropdown
            open={!!gridContextMenu}
            onOpenChange={(open) => !open && setGridContextMenu(null)}
            menu={{items: contextMenuItems}}
            trigger={['contextMenu']}
        >
            <div
                style={{
                    position: 'fixed',
                    left: gridContextMenu?.mouseX || 0,
                    top: gridContextMenu?.mouseY || 0,
                    width: 1,
                    height: 1,
                }}
            />
        </Dropdown>
    )
}