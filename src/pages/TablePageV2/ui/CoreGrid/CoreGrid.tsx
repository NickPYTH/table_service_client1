import {useCoreGrid} from "pages/TablePageV2/store/useCoreGrid";
import {useColumns} from "../../store/useColumns";
import {useRows} from "../../store/useRows";
import {DataGridPremium, GridAiAssistantPanel, GridToolbarQuickFilter } from "@mui/x-data-grid-premium";
import {ruRU} from "@mui/x-data-grid-premium/locales";
import {ColumnSettings} from "widgets/ColumnSettings";
import {ColumnMenu} from "./Slots/ColumnMenu";
import {CustomPaginationWithSelect} from "./Slots/CustomPagination";
import {RowSettings} from "widgets/RowSettings";


export const CoreGrid = () => {

    const {
        columns
    } = useColumns();
    const {
        apiRef,
        dataSource,
        handleQuickFilterChange
    } = useRows();
    const {
        tableV2State,
        onCellEditStopHandler,
        processPromptHandler
    } = useCoreGrid(apiRef);
    return (
        <>
            {tableV2State.isVisibleColumnSettingsModal && <ColumnSettings/>}
            {tableV2State.isVisibleRowSettingsModal && <RowSettings/>}
            <DataGridPremium
                dataSource={dataSource}
                disablePivoting
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
                initialState={{
                    pinnedColumns: {right: ['action'], left: ['order_f']},
                }}
                showCellVerticalBorder
                showColumnVerticalBorder
                showToolbar
                slots={{
                    columnMenu: ColumnMenu,
                    pagination: CustomPaginationWithSelect,
                    aiAssistantPanel: GridAiAssistantPanel,
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
            />
        </>
    )
}
