import {Divider} from "antd";
import {UserPermission} from "pages/TablePage/ui/TableSettings/PrivelegeTab/UserSettings/UserPermission";
import {FilialPermission} from "pages/TablePage/ui/TableSettings/PrivelegeTab/FilialSettings/FilialPermission";

export const PrivilegeTab = () => {

    return (
        <>
            <UserPermission />
            <Divider style={{margin: 0}}/>
            <FilialPermission/>
            <Divider style={{margin: 0}}/>
        </>
    )
}