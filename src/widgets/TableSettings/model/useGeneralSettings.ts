import {FieldType} from "./types";
import {useForm} from "antd/es/form/Form";
import {useEffect} from "react";
import {tableV2API} from "service/TableServiceV2";
import {useParams} from "react-router-dom";
import {useNotification} from "app/providers/NotificationProvider";

export const useGeneralSettings = () => {

    // Params
    const {id} = useParams();
    // -----

    // Notification
    const notification = useNotification();
    // -----

    // State
    const [form] = useForm<FieldType>();
    // -----

    // Web requests
    const [getTableInfo, {
        data: tableInfo,
        isLoading: isGetLoading,
    }] = tableV2API.useGetMutation();
    const [updateTableInfo, {
        isSuccess: isUpdateSuccess,
        isLoading: isUpdateLoading,
    }] = tableV2API.useUpdateTableInfoMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) getTableInfo(id);
    }, []);
    useEffect(() => {
        if (tableInfo) {
            form.setFieldsValue({
                alternative_name: tableInfo.table_name,
            });
        }
    }, [tableInfo]);
    useEffect(() => {
        if (isUpdateSuccess)
            notification.success({
                message: "Успешно",
                description: "Настройки обнолвены"
            });
    }, [isUpdateSuccess]);
    // -----

    // Handlers
    const saveHandler = async () => {
        try {
            if (id) {
                const values = await form.validateFields();
                updateTableInfo({
                    table_id: id,
                    alternative_name: values.alternative_name,
                });
            }
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };
    // -----

    return {
        form,
        isGetLoading,
        isUpdateLoading,
        saveHandler
    }
}