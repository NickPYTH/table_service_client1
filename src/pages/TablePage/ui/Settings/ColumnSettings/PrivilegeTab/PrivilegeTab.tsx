import {columnPermissionsAPI} from "service/ColumnPermissionsService";
import {UserPermission} from "../../UserSettings/UserPermission";
import {columnFilialPermissionsAPI} from "service/ColumnFilialPermissionsService";
import {FilialPermission} from "pages/TablePage/ui/Settings/FilialSettings/FilialPermission";

type PropsType = {
    columnId: number|null
}

export const PrivilegeTab = (props:PropsType) => {

    // Web requests
    const [getPermissions, {
        data: permissions,
        isLoading: isPermissionsLoading
    }] = columnPermissionsAPI.useGetAllByRowIdMutation();
    const [deletePermission, {
        isSuccess: isSuccessDeletePermission,
        isLoading: isDeletePermissionLoading
    }] = columnPermissionsAPI.useDeleteMutation();
    const [getFilialPermissions, {
        data: filialPermissions,
        isLoading: isFilialPermissionsLoading
    }] = columnFilialPermissionsAPI.useGetAllByRowIdMutation();
    const [deleteFilialPermission, {
        isSuccess: isSuccessDeleteFilialPermission,
        isLoading: isDeleteFilialPermissionLoading
    }] = columnFilialPermissionsAPI.useDeleteMutation();
    // -----

    return (
        <>
            {props.columnId &&
                <>
                    <UserPermission
                        id={props.columnId}
                        type={'column'}
                        getPermissions={getPermissions}
                        permissions={permissions}
                        isPermissionsLoading={isPermissionsLoading}
                        isDeletePermissionLoading={isDeletePermissionLoading}
                        deletePermission={deletePermission}
                        isSuccessDeletePermission={isSuccessDeletePermission}
                    />
                    <FilialPermission
                        id={props.columnId}
                        type={'column'}
                        getPermissions={getFilialPermissions}
                        permissions={filialPermissions}
                        isPermissionsLoading={isFilialPermissionsLoading}
                        isDeletePermissionLoading={isDeleteFilialPermissionLoading}
                        deletePermission={deleteFilialPermission}
                        isSuccessDeletePermission={isSuccessDeleteFilialPermission}
                    />
                </>
            }
        </>
    )
}