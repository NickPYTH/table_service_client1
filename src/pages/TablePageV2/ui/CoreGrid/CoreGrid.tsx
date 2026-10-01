import {useCoreGrid} from "pages/TablePageV2/store/useCoreGrid";
import {useColumns} from "../../store/useColumns";
import {useRows} from "../../store/useRows";
import {DataGridPremium} from "@mui/x-data-grid-premium";
import {ruRU} from "@mui/x-data-grid-premium/locales";

export const CoreGrid = () => {

    const {
        columns
    } = useColumns();
    const {
        rows,
        rowCount,
        paginationModel,
        setPaginationModelHandler,
        filterModel,
        setFilterModelHandler,
        sortModel,
        setSortModelHandler,
        rowGroupingModel,
        setRowGroupingModelHandler,
    } = useRows();
    const {
        onCellEditStopHandler,
        apiRef
    } = useCoreGrid();

    return(
        <div>
            <DataGridPremium
                apiRef={apiRef}
                rows={rows}
                columns={columns}
                columnHeaderHeight={50}
                rowHeight={31}
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                // Настройки пагинации
                pagination
                paginationMode="server"
                sortingMode="server"
                filterMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModelHandler}
                sortModel={sortModel}
                onSortModelChange={setSortModelHandler}
                filterModel={filterModel}
                onFilterModelChange={setFilterModelHandler}
                rowGroupingModel={rowGroupingModel}
                onRowGroupingModelChange={setRowGroupingModelHandler}
                pageSizeOptions={[25, 50, 100, 200, 500, 1000]}
                rowCount={rowCount}
                // -----
                rowBufferPx={300}
                columnBufferPx={300}
                throttleRowsMs={100} // сглаживает перезапись строк при смене страницы/сортировки
                onCellEditStop={onCellEditStopHandler}
                initialState={{
                    pinnedColumns: {right: ['action'], left: ['order_f']},
                }}
                showCellVerticalBorder
                showColumnVerticalBorder
            />
        </div>
    )
}
