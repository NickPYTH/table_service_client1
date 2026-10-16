import {useForm} from "antd/es/form/Form";
import {FilialPermissionModalFieldType} from "./types";
import {useParams} from "react-router-dom";
import {useNotification} from "app/providers/NotificationProvider";
import {useEffect} from "react";
import { tableFilialPermissionV2API } from "service/TableFilialPermissionServiceV2";

type PropsType = {
    setVisible: (visible: boolean) => void;
    selectedFilialPermissionId: number | null;
    setSelectedFilialPermissionId: (selectedFilialPermission: number | null) => void;
    apiRef: any
}

export const useFilialPermissionModal = ({
                                             setVisible,
                                             selectedFilialPermissionId,
                                             setSelectedFilialPermissionId,
                                             apiRef
                                         }: PropsType) => {

    // Params
    const {id} = useParams();
    // -----

    // Notification
    const notification = useNotification();
    // -----

    // State
    const [form] = useForm<FilialPermissionModalFieldType>();
    // -----

    // Web requests
    const [update, {
        isSuccess: isUpdateSuccess,
        isLoading: isUpdateLoading
    }] = tableFilialPermissionV2API.useUpdateFilialTablePermissionMutation();
    const [get, {
        data: filialTablePermission,
        isLoading: isGetLoading
    }] = tableFilialPermissionV2API.useGetFilialTablePermissionMutation();
    const [deletePermission, {
        isLoading: isDeleteLoading,
        isSuccess: isDeleteSuccess,
    }] = tableFilialPermissionV2API.useRemoveTableFilialPermissionMutation();
    // -----

    // Effects
    useEffect(() => {
        if (selectedFilialPermissionId)
            get(selectedFilialPermissionId);
    }, []);
    useEffect(() => {
        if (filialTablePermission)
            form.setFieldsValue({
                filial: filialTablePermission.filial,
                role: filialTablePermission.role,
            });
    }, [filialTablePermission]);
    useEffect(() => {
        if (isUpdateSuccess || isDeleteSuccess) {
            notification.success({
                message: "Успешно!",
                description: "Права обновлены"
            });
            apiRef?.current.dataSource.fetchRows(undefined, {skipCache: true});
            closeHandler();
        }
    }, [isUpdateSuccess, isDeleteSuccess]);
    // -----

    // Handlers
    const closeHandler = () => {
        setVisible(false);
        setSelectedFilialPermissionId(null);
    };
    const saveHandler = async () => {
        if (id) {
            try {
                const values = await form.validateFields();
                if (selectedFilialPermissionId) {
                    update({
                        table_id: id,
                        filial: values.filial,
                        role: values.role,
                        permission_id: selectedFilialPermissionId
                    });
                } else {
                    update({
                        table_id: id,
                        filial: values.filial,
                        role: values.role,
                        permission_id: null
                    });
                }
            } catch (e) {
                console.log(e);
            }
        }
    };
    const deleteHandler = () => {
        if (selectedFilialPermissionId) {
            deletePermission({
                permission_id: selectedFilialPermissionId,
            })
        }
    };
    // -----

    return {
        form,
        closeHandler,
        saveHandler,
        deleteHandler,
        isUpdateLoading,
        isDeleteLoading,
        isGetLoading
    }
}