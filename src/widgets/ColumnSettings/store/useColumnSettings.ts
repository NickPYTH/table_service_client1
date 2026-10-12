import {useForm, useWatch} from "antd/es/form/Form";
import {FieldType} from "widgets/ColumnSettings/store/types";
import {tableV2API} from "service/TableServiceV2";
import {useEffect} from "react";
import {useParams} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {setIsVisibleColumnSettingsModal, TableV2ModelStateType} from "store/slice/TableV2Slice";
import {useNotification} from "app/providers/NotificationProvider";

export const useColumnSettings = () => {

    // Params
    const {id} = useParams();
    // -----

    // Notification
    const notification = useNotification();
    // -----

    // Store
    const tableV2State = useSelector((state:{tableV2Slice:TableV2ModelStateType}) => state.tableV2Slice);
    const dispatch = useDispatch();
    // -----

    // State
    const [form] = useForm<FieldType>();
    const type = useWatch('type', form);
    // -----

    // Web requests
    const [get, {
        isLoading: isGetLoading,
        data: columnData
    }] = tableV2API.useGetColumnMutation();
    const [update, {
        isSuccess: isUpdateSuccess,
        isError: isUpdateError,
        isLoading: isUpdateLoading
    }] = tableV2API.useUpdateColumnMutation();
    // -----


    // Effects
    useEffect(() => {
        if (tableV2State.selectedColumnSystemName)
            if (id) {
                get({
                    table_id: id,
                    column_system_name: tableV2State.selectedColumnSystemName
                });
            }
    }, []);
    useEffect(() => {
        if (columnData){
            form.setFieldsValue({
                name: columnData.alternative_name,
                type: columnData.type,
                hidden: columnData.hidden,
                readonly: columnData.readonly,
                required: columnData.required,
            });
        }
    }, [columnData]);
    useEffect(() => {
        if (isUpdateSuccess){
            form.resetFields();
            notification.success({
                message: "Успешно",
                description: "Настройки колонки сохранены"
            });
            if (tableV2State.refreshColumns)
                tableV2State.refreshColumns();
            closeHandler();
        }
    }, [isUpdateSuccess]);
    useEffect(()=>{
        if (isUpdateError){
            notification.error({
                message: "Ошибка",
                description: "Настройки колонки не сохранены"
            });
        }
    }, [isUpdateError])
    // -----

    // Handlers
    const saveHandler = async () => {
        try {
            const values = await form.validateFields();
            if (id && tableV2State.selectedColumnSystemName)
                update({
                    table_id: id,
                    column_system_name: tableV2State.selectedColumnSystemName,
                    column_alternative_name: values.name,
                    type: values.type,
                    readonly: values.readonly,
                    required: values.required,
                    hidden: values.hidden
                });
        } catch (error) {
            console.error('Ошибка:', error);
        }
    };
    const closeHandler = () => {
        dispatch(setIsVisibleColumnSettingsModal(false));
    };
    // -----

    return{
        tableV2State,
        form,
        type,
        saveHandler,
        closeHandler,
        isGetLoading,
        isUpdateLoading
    }
}