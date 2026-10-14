import {useCoreGrid} from "pages/TablePageV2/store/useCoreGrid";
import {useColumns} from "../../store/useColumns";
import {useRows} from "../../store/useRows";
import {DataGridPremium, GridAiAssistantPanel} from "@mui/x-data-grid-premium";
import {ruRU} from "@mui/x-data-grid-premium/locales";
import {ColumnSettings} from "widgets/ColumnSettings";
import {ColumnMenu} from "./Slots/ColumnMenu";
import {CustomPaginationWithSelect} from "./Slots/CustomPagination";
import {CustomToolbar} from "./Slots/CustomToolbar";
import {RowSettings} from "widgets/RowSettings";
import {GridContextMenu} from "pages/TablePageV2/ui/CoreGrid/GridContextMenu";


export const CoreGrid = () => {

    const {
        columns,
        hiddenColumns,
        isCellEditableHandler
    } = useColumns();
    const {
        apiRef,
        dataSource,
    } = useRows();
    const {
        tableV2State,
        onCellEditStopHandler,
        processPromptHandler,
        gridContextMenu,
        setGridContextMenu,
        handleCellContextMenu
    } = useCoreGrid(apiRef);

    return (
        <>
            {tableV2State.isVisibleColumnSettingsModal && <ColumnSettings/>}
            {tableV2State.isVisibleRowSettingsModal && <RowSettings/>}
            {Object.keys(hiddenColumns).length > 0 &&
                <DataGridPremium
                    dataSource={dataSource}
                    apiRef={apiRef}
                    columns={columns}
                    columnHeaderHeight={50}
                    rowHeight={31}
                    // Настройки пагинации
                    pagination
                    paginationMode="server"
                    sortingMode="server"
                    filterMode="server"
                    // -----
                    rowBufferPx={300}
                    columnBufferPx={300}
                    throttleRowsMs={100}
                    onCellEditStop={onCellEditStopHandler}
                    isCellEditable={isCellEditableHandler}
                    initialState={{
                        pinnedColumns: {right: ['action'], left: ['order_f']},
                        columns: {
                            columnVisibilityModel: {...hiddenColumns}
                        }
                    }}
                    showCellVerticalBorder
                    showColumnVerticalBorder
                    showToolbar
                    slots={{
                        toolbar: CustomToolbar,
                        columnMenu: ColumnMenu,
                        pagination: CustomPaginationWithSelect,
                        aiAssistantPanel: GridAiAssistantPanel,
                    }}
                    slotProps={{
                        cell: {
                            onContextMenu: handleCellContextMenu,
                        },
                    }}
                    columnFilterDebounceMs={500}
                    filterDebounceMs={500}
                    aiAssistant
                    allowAiAssistantDataSampling
                    onPrompt={processPromptHandler}
                    aiAssistantSuggestions={[
                        {value: 'Sort by name'},
                        {value: 'Show people from the EU'},
                        {value: 'Sort by company name and employee name'},
                        {value: 'Order companies by amount of people'},
                    ]}
                    localeText={{
                        ...ruRU.components.MuiDataGrid.defaultProps.localeText,
                        aiAssistantPanelTitle: 'AI Ассистент',
                        aiAssistantSuggestions: 'Примеры запросов',
                        aiAssistantPanelClose: 'Закрыть',
                        aiAssistantPanelConversationHistory: 'История',
                        aiAssistantPanelEmptyConversation: 'Пусто...',
                        aiAssistantPanelNewConversation: 'Новая беседа',
                    }}
                    cellSelection
                />
            }
            <GridContextMenu gridContextMenu={gridContextMenu} setGridContextMenu={setGridContextMenu}/>
        </>
    )
}
