import {useForm} from "antd/es/form/Form";
import {UserPermissionModalFieldType} from "./types";
//@ts-ignore
import {debounce} from "lodash";
import {tableV2API} from "service/TableServiceV2";
import {tablePermissionV2API} from "service/TablePermissionServiceV2";
import {useParams} from "react-router-dom";
import {useNotification} from "app/providers/NotificationProvider";
import {useEffect} from "react";

type PropsType = {
    setVisible: (visible: boolean) => void;
    selectedUserPermissionId: number | null;
    setSelectedUserPermissionId: (selectedUserPermission: number | null) => void;
    apiRef: any
}

export const useUserPermissionModal = ({
                                           setVisible,
                                           selectedUserPermissionId,
                                           setSelectedUserPermissionId,
                                           apiRef
                                       }: PropsType) => {

    // Params
    const {id} = useParams();
    // -----

    // Notification
    const notification = useNotification();
    // -----

    // State
    const [form] = useForm<UserPermissionModalFieldType>();
    // -----

    // Web requests
    const [searchUser, {
        data: userList
    }] = tableV2API.useSearchUserMutation();
    const [update, {
        isSuccess: isUpdateSuccess,
        isLoading: isUpdateLoading
    }] = tablePermissionV2API.useUpdateUserTablePermissionMutation();
    const [get, {
        data: userTablePermission,
        isLoading: isGetLoading
    }] = tablePermissionV2API.useGetUserTablePermissionMutation();
    const [deletePermission, {
        isLoading: isDeleteLoading,
        isSuccess: isDeleteSuccess,
    }] = tablePermissionV2API.useRemoveTablePermissionMutation();
    // -----

    // Effects
    useEffect(() => {
        if (selectedUserPermissionId)
            get(selectedUserPermissionId);
    }, []);
    useEffect(() => {
        if (userTablePermission)
            form.setFieldsValue({
                username: userTablePermission.username,
                role: userTablePermission.role,
            });
    }, [userTablePermission]);
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
        setSelectedUserPermissionId(null);
    };
    const saveHandler = async () => {
        if (id) {
            try {
                const values = await form.validateFields();
                if (selectedUserPermissionId) {
                    update({
                        table_id: id,
                        username: values.username,
                        role: values.role,
                        permission_id: selectedUserPermissionId
                    });
                } else {
                    update({
                        table_id: id,
                        username: values.username,
                        role: values.role,
                        permission_id: null
                    });
                }
            } catch (e) {
                console.log(e);
            }
        }
    };
    const searchUserHandler = debounce((value: string) => {
        if (value.trim() != "")
            searchUser(value.trim());
    }, 1000);
    const deleteHandler = async () => {
        if (selectedUserPermissionId) {
            deletePermission({
                permission_id: selectedUserPermissionId
            })
        }
    };
    // -----

    return {
        form,
        closeHandler,
        saveHandler,
        deleteHandler,
        searchUserHandler,
        userList,
        isUpdateLoading,
        isDeleteLoading,
        isGetLoading
    }
}