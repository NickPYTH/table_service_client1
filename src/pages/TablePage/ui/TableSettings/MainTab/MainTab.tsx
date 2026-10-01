import {Button, Flex, Radio, Typography} from "antd";
import React, {useContext, useEffect, useState} from "react";
import {TableModel} from "entities/TableModel";
import {TableContext} from "../../TablePage";
import {tableAPI} from "service/TableService";
import {useNotification} from "app/providers/NotificationProvider/ui/NotificationProvider";

type PropsType = {
    table: TableModel;
    setContext: Function;
};

const {Text} = Typography;

export const MainTab = (props:PropsType) => {

    // Context
    const tableContext = useContext(TableContext);
    // -----

    // Notification context
    const notification = useNotification();
    // -----

    // States
    const [withCellConfirm, setWithCellConfirm] = useState(false);
    const [withCellLogging, setWithCellLogging] = useState(false);
    const [showLockedRow, setShowLockedRow] = useState(false);
    const [allowInsertRowForUsers, setAllowInsertRowForUsers] = useState(false);
    const [allowInsertColumnForUsers, setAllowInsertColumnForUsers] = useState(false);
    const [openLastPageByDefault, setOpenLastPageByDefault] = useState(false);
    // -----

    // Web requests
    const [update, {
        isSuccess: isUpdateSuccess,
    }] = tableAPI.usePatchMutation();
    // -----

    // Handlers
    const updateHandler = () => {
        update({...props.table,
            show_locked_row: showLockedRow,
            with_cell_confirm: withCellConfirm,
            with_cell_logging: withCellLogging,
            allow_user_insert_row: allowInsertRowForUsers,
            allow_user_insert_column: allowInsertColumnForUsers,
            open_last_page_by_default: openLastPageByDefault
        });
        props.setContext({...tableContext, withCellConfirm, withCellLogging, showLockedRow});
    };
    // -----

    // Effects
    useEffect(() => {
        setWithCellLogging(props.table.with_cell_logging);
        setWithCellConfirm(!!tableContext?.withCellConfirm);
        setShowLockedRow(props.table.show_locked_row);
        setShowLockedRow(!!tableContext?.showLockedRow);
        setAllowInsertRowForUsers(props.table.allow_user_insert_row);
        setAllowInsertColumnForUsers(props.table.allow_user_insert_column);
        setOpenLastPageByDefault(props.table.open_last_page_by_default);
    }, []);
    useEffect(() => {
        if (isUpdateSuccess) {
            notification.success({
                message: "Успешно!",
                description: "Настройки сохранены."
            });
        }
    }, [isUpdateSuccess]);
    // -----

    return (
        <Flex gap={'small'} vertical>
            <Flex vertical gap={'small'}>
                <Flex gap={'small'}>
                    <Text style={{width: 450}}>
                        Подтверждение ввода в ячейку
                    </Text>
                    <Radio.Group
                        value={withCellConfirm}
                        options={[
                            {value: true, label: "Да"},
                            {value: false, label: "Нет"},
                        ]}
                        onChange={(e) => setWithCellConfirm(e.target.value)}
                    />
                </Flex>
                <Flex gap={'small'}>
                    <Text style={{width: 450}}>
                        Показывать заблокированные строки
                    </Text>
                    <Radio.Group
                        value={showLockedRow}
                        options={[
                            {value: true, label: "Да"},
                            {value: false, label: "Нет"},
                        ]}
                        onChange={(e) => setShowLockedRow(e.target.value)}
                    />
                </Flex>
                <Flex gap={'small'}>
                    <Text style={{width: 450}}>
                        Вставка строк через контекстное меню пользователям
                    </Text>
                    <Radio.Group
                        value={allowInsertRowForUsers}
                        options={[
                            {value: true, label: "Да"},
                            {value: false, label: "Нет"},
                        ]}
                        onChange={(e) => setAllowInsertRowForUsers(e.target.value)}
                    />
                </Flex>
                <Flex gap={'small'}>
                    <Text style={{width: 450}}>
                        Вставка колонок через контекстное меню пользователям
                    </Text>
                    <Radio.Group
                        value={allowInsertColumnForUsers}
                        options={[
                            {value: true, label: "Да"},
                            {value: false, label: "Нет"},
                        ]}
                        onChange={(e) => setAllowInsertColumnForUsers(e.target.value)}
                    />
                </Flex>
                <Flex gap={'small'}>
                    <Text style={{width: 450}}>
                        Открывать последнюю страницу по умолчанию
                    </Text>
                    <Radio.Group
                        value={openLastPageByDefault}
                        options={[
                            {value: true, label: "Да"},
                            {value: false, label: "Нет"},
                        ]}
                        onChange={(e) => setOpenLastPageByDefault(e.target.value)}
                    />
                </Flex>
                <Button style={{width: 120, marginTop: 15}} onClick={updateHandler}>Сохранить</Button>
            </Flex>
        </Flex>
    )
}
