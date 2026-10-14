import {BgColorsOutlined, CopyOutlined, DeleteOutlined, HistoryOutlined, PlusOutlined} from "@ant-design/icons";
import React, {useEffect} from "react";
import {Dropdown} from "antd";
import {rowV2API} from "service/RowV2Service";
import {useParams} from "react-router-dom";
import {useNotification} from "app/providers/NotificationProvider";

export const GridContextMenu = ({gridContextMenu, setGridContextMenu}: any) => {

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
    // -----

    // Effects
    useEffect(() => {
        if (isInsertRowSuccess)
            notification.success({
                message: "Успешно",
                description: "Строка вставлена"
            });
    }, [isInsertRowSuccess]);
    // -----

    // Handlers
    const insertEmptyRowBeforeHandler = () => {
        if (id) {
            insertRow({table_id: id, before_id: gridContextMenu.rowId});
            setGridContextMenu(null);
        }
    }
    // -----

    const contextMenuItems = [
        {
            key: 'add-before',
            label: 'Добавить строку "до" пустую',
            icon: <PlusOutlined/>,
            onClick: insertEmptyRowBeforeHandler,
        },
        {
            key: 'add-before-with-copy',
            label: 'Добавить строку "до" и скопировать данные',
            icon: <CopyOutlined/>,
            onClick: () => {
            },
        },
        {
            key: 'add-after',
            label: 'Добавить строку "после" пустую',
            icon: <PlusOutlined/>,
            onClick: () => {
            },
        },
        {
            key: 'add-after-with-copy',
            label: 'Добавить строку "после" и скопировать данные',
            icon: <CopyOutlined/>,
            onClick: () => {
            },
        },
        {
            key: 'add-column-before',
            label: 'Добавить столбец "до" пустой',
            icon: <PlusOutlined/>,
            onClick: () => {
            },
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