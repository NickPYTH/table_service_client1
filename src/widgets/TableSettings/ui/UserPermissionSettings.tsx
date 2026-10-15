import {useUserPermissionSettings} from "../model/useUserPermissionSettings";
import {Button, Flex} from "antd";
import {DataGridPremium} from "@mui/x-data-grid-premium";
import {ruRU} from "@mui/x-data-grid-premium/locales";
import {UserPermissionModal} from "widgets/TableSettings/ui/UserPermissionModal";

export const UserPermissionSettings = () => {

    const {
        apiRef,
        columns,
        dataSource,
        createRecordHandler,
        onCellEditStopHandler,
        visibleUserPermissionModal,
        setVisibleUserPermissionModal,
    } = useUserPermissionSettings();

    return (
        <Flex vertical gap={'small'}>
            {visibleUserPermissionModal && <UserPermissionModal visible={visibleUserPermissionModal} setVisible={setVisibleUserPermissionModal} />}
            <Flex gap={'small'}>
                <Button size={'small'} onClick={createRecordHandler}>Добавить</Button>
            </Flex>
            <DataGridPremium
                apiRef={apiRef}
                dataSource={dataSource}
                columns={columns}
                columnHeaderHeight={50}
                rowHeight={31}
                disableAggregation
                disableRowGrouping
                disablePivoting
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                showCellVerticalBorder
                showColumnVerticalBorder
                onCellEditStop={onCellEditStopHandler}
            />
        </Flex>
    )
}