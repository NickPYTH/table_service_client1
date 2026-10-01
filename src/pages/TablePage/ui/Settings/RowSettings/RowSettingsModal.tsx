import React from 'react';
import {Divider, Flex, Modal} from 'antd';
import {UserPermission} from "pages/TablePage/ui/Settings/UserSettings/UserPermission";
import {FilialPermission} from "pages/TablePage/ui/Settings/FilialSettings/FilialPermission";
import {rowPermissionsAPI} from "service/RowPermissionsService";
import {rowFilialPermissionsAPI} from "service/RowFilialPermissionsService";


type ModalProps = {
    rowId: number,
    visible: boolean,
    setVisible: Function,
    refresh: Function,
}

export const RowSettingsModal = (props: ModalProps) => {

    // Web requests
    const [getPermissions, {
        data: permissions,
        isLoading: isPermissionsLoading
    }] = rowPermissionsAPI.useGetAllByRowIdMutation();
    const [deletePermission, {
        isSuccess: isSuccessDeletePermission,
        isLoading: isDeletePermissionLoading
    }] = rowPermissionsAPI.useDeleteMutation();
    const [getFilialPermissions, {
        data: filialPermissions,
        isLoading: isFilialPermissionsLoading
    }] = rowFilialPermissionsAPI.useGetAllByRowIdMutation();
    const [deleteFilialPermission, {
        isSuccess: isSuccessDeleteFilialPermission,
        isLoading: isDeleteFilialPermissionLoading
    }] = rowFilialPermissionsAPI.useDeleteMutation();
    // -----

    return (
        <Modal title={"Настройки строки"}
               maskClosable={false}
               open={props.visible}
               onCancel={() => props.setVisible(false)}
               width={'650px'}
               loading={false}
               footer={() => (<></>)}
        >
            <Flex gap={'small'} vertical>
                <UserPermission
                    id={props.rowId}
                    type={'row'}
                    getPermissions={getPermissions}
                    permissions={permissions}
                    isPermissionsLoading={isPermissionsLoading}
                    isDeletePermissionLoading={isDeletePermissionLoading}
                    deletePermission={deletePermission}
                    isSuccessDeletePermission={isSuccessDeletePermission}
                />
                <Divider/>
                <FilialPermission
                    id={props.rowId}
                    type={"row"}
                    getPermissions={getFilialPermissions}
                    permissions={filialPermissions}
                    isPermissionsLoading={isFilialPermissionsLoading}
                    deletePermission={deleteFilialPermission}
                    isDeletePermissionLoading={isDeleteFilialPermissionLoading}
                    isSuccessDeletePermission={isSuccessDeleteFilialPermission}
                />
            </Flex>
        </Modal>
    );
};
