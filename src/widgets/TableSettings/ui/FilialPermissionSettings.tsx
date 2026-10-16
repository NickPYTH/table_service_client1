import {Button, Flex} from "antd";
import {DataGridPremium} from "@mui/x-data-grid-premium";
import {ruRU} from "@mui/x-data-grid-premium/locales";
import {FilialPermissionModal} from "./FilialPermissionModal";
import {useFilialPermissionSettings} from "widgets/TableSettings/model/useFilialPermissionSettings";

export const FilialPermissionSettings = () => {

    const {
        apiRef,
        columns,
        dataSource,
        createRecordHandler,
        onCellEditStopHandler,
        visibleFilialPermissionModal,
        setVisibleFilialPermissionModal,
        selectedFilialPermissionId,
        setSelectedFilialPermissionId,
        onRowDoubleClickHandler
    } = useFilialPermissionSettings();

    return (
        <Flex vertical gap={'small'}>
            {visibleFilialPermissionModal &&
                <FilialPermissionModal
                    visible={visibleFilialPermissionModal}
                    setVisible={setVisibleFilialPermissionModal}
                    selectedFilialPermissionId={selectedFilialPermissionId}
                    setSelectedFilialPermissionId={setSelectedFilialPermissionId}
                    apiRef={apiRef}
                />}
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
                onRowDoubleClick={onRowDoubleClickHandler}
            />
        </Flex>
    )
}