import React, {useEffect, useId, useState} from "react";
import {
    AiAssistantPanelTrigger,
    ChartsPanelTrigger,
    ColumnsPanelTrigger,
    ExportCsv,
    ExportExcel,
    ExportPrint,
    FilterPanelTrigger,
    type GridToolbarProps,
    GridToolbarQuickFilter,
    PivotPanelTrigger,
    Toolbar,
    ToolbarButton,
    useGridApiContext,
    useGridRootProps,
} from "@mui/x-data-grid-premium";
import {Divider, Menu, MenuItem} from "@mui/material";
import {InsertRowBelowOutlined, InsertRowRightOutlined} from "@ant-design/icons";
import {TableV2ModelStateType} from "store/slice/TableV2Slice";
import {useSelector} from "react-redux";
import {useParams} from "react-router-dom";
import {rowV2API} from "service/RowV2Service";
import {useNotification} from "app/providers/NotificationProvider";
import {columnV2API} from "service/ColumnV2Service";

export const CustomToolbar = ({
                                  showQuickFilter = true,
                                  quickFilterProps,
                                  csvOptions,
                                  printOptions,
                                  excelOptions,
                              }: GridToolbarProps) => {
    // Params
    const {id} = useParams();
    // -----

    // Store
    const tableV2State = useSelector((state: { tableV2Slice: TableV2ModelStateType }) => state.tableV2Slice);
    const notification = useNotification();
    // -----

    // Web requests
    const [insertRow, {
        isSuccess: isInsertRowSuccess,
        isLoading: isInsertRowLoading
    }] = rowV2API.useInsertRowMutation();
    const [insertColumn, {
        isSuccess: isInsertColumnSuccess,
    }] = columnV2API.useInsertColumnMutation();
    // -----

    // States
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const exportMenuTriggerRef = React.useRef<HTMLButtonElement>(null);
    const exportMenuId = useId();
    const exportMenuTriggerId = useId();

    const Tooltip = rootProps.slots.baseTooltip;
    const Badge = rootProps.slots.baseBadge;
    const ColumnIcon = rootProps.slots.columnSelectorIcon;
    const FilterIcon = rootProps.slots.openFilterButtonIcon;
    const PivotIcon = rootProps.slots.pivotIcon;
    const ChartsIcon = rootProps.slots.chartsIcon;
    const AiIcon = rootProps.slots.aiAssistantIcon;
    const ExportIcon = rootProps.slots.exportIcon;

    const showExport = !csvOptions?.disableToolbarButton
        || !printOptions?.disableToolbarButton
        || !excelOptions?.disableToolbarButton;
    const showDividerBeforeExport = showExport && (!rootProps.disableColumnFilter || !rootProps.disableColumnSelector);
    // -----

    // Effects
    useEffect(() => {
        if (isInsertRowSuccess)
            notification.success({
                message: "Успешно",
                description: "Строка вставлена"
            });
    }, [isInsertRowSuccess]);
    useEffect(() => {
        if (isInsertColumnSuccess)
            notification.success({
                message: "Успешно",
                description: "Колонка добавлена"
            });
    }, [isInsertColumnSuccess]);
    // -----

    // Handlers
    const closeExportMenu = () => setExportMenuOpen(false);
    const insertRowHandler = () => {
        if (id) {
            insertRow({table_id: id});
        }
    }
    const insertColumnHandler = () => {
        if (id) {
            if (apiRef?.current) {
                let requestParams: Record<string, any> = {
                    table_id: id,
                    alternative_name: "Новая колонка",
                    column_type: 'text',
                    hidden: false,
                    required: false,
                    readonly: false
                }
                insertColumn(requestParams);
            }
        }
    }
    // -----

    return (
        <Toolbar style={{width: "100%", justifyContent: "flex-start"}}>
            <span style={{
                fontWeight: 800,
                margin: "0 24px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap"
            }}>
                {tableV2State.tableName}
            </span>
            <Tooltip title="Вставить строку">
                <ToolbarButton disabled={isInsertRowLoading} aria-label="Вставить строку" onClick={insertRowHandler}>
                    <InsertRowBelowOutlined style={{fontSize: 18}}/>
                </ToolbarButton>
            </Tooltip>
            <Tooltip title="Вставить колонку">
                <ToolbarButton aria-label="Вставить столбец" onClick={insertColumnHandler}>
                    <InsertRowRightOutlined style={{fontSize: 18}}/>
                </ToolbarButton>
            </Tooltip>

            {/* Забирает свободное место */}
            <div style={{flex: 1}}/>

            {!rootProps.disableColumnSelector &&
                <Tooltip title={apiRef.current.getLocaleText("toolbarColumns")}>
                    <ColumnsPanelTrigger render={<ToolbarButton/>}>
                        <ColumnIcon fontSize="small"/>
                    </ColumnsPanelTrigger>
                </Tooltip>
            }
            {!rootProps.disableColumnFilter &&
                <Tooltip title={apiRef.current.getLocaleText("toolbarFilters")}>
                    <FilterPanelTrigger
                        render={(triggerProps, state) => (
                            <ToolbarButton
                                {...triggerProps}
                                color={state.filterCount > 0 ? "primary" : "default"}
                            >
                                <Badge badgeContent={state.filterCount} color="primary" variant="dot">
                                    <FilterIcon fontSize="small"/>
                                </Badge>
                            </ToolbarButton>
                        )}
                    />
                </Tooltip>
            }
            {!rootProps.disablePivoting &&
                <PivotPanelTrigger
                    render={(triggerProps, state) => (
                        <Tooltip title={apiRef.current.getLocaleText("toolbarPivot")}>
                            <ToolbarButton
                                {...triggerProps}
                                color={state.active ? "primary" : "default"}
                            >
                                <PivotIcon fontSize="small"/>
                            </ToolbarButton>
                        </Tooltip>
                    )}
                />
            }
            {rootProps.chartsIntegration &&
                <ChartsPanelTrigger
                    render={(triggerProps) => (
                        <Tooltip title={apiRef.current.getLocaleText("toolbarCharts")}>
                            <ToolbarButton {...triggerProps} color="default">
                                <ChartsIcon fontSize="small"/>
                            </ToolbarButton>
                        </Tooltip>
                    )}
                />
            }
            {rootProps.aiAssistant &&
                <AiAssistantPanelTrigger
                    render={(triggerProps) => (
                        <Tooltip title={apiRef.current.getLocaleText("toolbarAssistant")}>
                            <ToolbarButton {...triggerProps} color="default">
                                <AiIcon fontSize="small"/>
                            </ToolbarButton>
                        </Tooltip>
                    )}
                />
            }
            {showDividerBeforeExport &&
                <Divider orientation="vertical" variant="middle" flexItem sx={{mx: 0.5}}/>
            }
            {showExport &&
                <>
                    <Tooltip title={apiRef.current.getLocaleText("toolbarExport")} disableInteractive={exportMenuOpen}>
                        <ToolbarButton
                            ref={exportMenuTriggerRef}
                            id={exportMenuTriggerId}
                            aria-controls={exportMenuId}
                            aria-haspopup="true"
                            aria-expanded={exportMenuOpen ? "true" : undefined}
                            onClick={() => setExportMenuOpen(!exportMenuOpen)}
                        >
                            <ExportIcon fontSize="small"/>
                        </ToolbarButton>
                    </Tooltip>
                    <Menu
                        id={exportMenuId}
                        anchorEl={exportMenuTriggerRef.current}
                        open={exportMenuOpen}
                        onClose={closeExportMenu}
                        anchorOrigin={{vertical: "bottom", horizontal: "right"}}
                        transformOrigin={{vertical: "top", horizontal: "right"}}
                        slotProps={{
                            list: {"aria-labelledby": exportMenuTriggerId},
                        }}
                    >
                        {!printOptions?.disableToolbarButton &&
                            <ExportPrint render={<MenuItem/>} onClick={closeExportMenu}>
                                {apiRef.current.getLocaleText("toolbarExportPrint")}
                            </ExportPrint>
                        }
                        {!csvOptions?.disableToolbarButton &&
                            <ExportCsv render={<MenuItem/>} onClick={closeExportMenu}>
                                {apiRef.current.getLocaleText("toolbarExportCSV")}
                            </ExportCsv>
                        }
                        {!excelOptions?.disableToolbarButton &&
                            <ExportExcel render={<MenuItem/>} onClick={closeExportMenu}>
                                {apiRef.current.getLocaleText("toolbarExportExcel")}
                            </ExportExcel>
                        }
                    </Menu>
                </>
            }
            {showQuickFilter &&
                <>
                    <Divider orientation="vertical" variant="middle" flexItem sx={{mx: 0.5}}/>
                    <GridToolbarQuickFilter {...quickFilterProps}/>
                </>
            }
        </Toolbar>
    );
};
