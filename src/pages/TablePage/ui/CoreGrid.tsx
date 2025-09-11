import {
    DataGridPremium,
    GridCellParams,
    gridClasses,
    GridColDef,
    GridRowId,
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarFilterButton,
    GridToolbarQuickFilter,
} from "@mui/x-data-grid-premium";
import {ruRU} from '@mui/x-data-grid-premium/locales';
import {useEffect, useState} from "react";
import {columnAPI} from "service/ColumnService";
import {useParams} from "react-router-dom";
import {ColumnModel} from "entities/ColumnModel";
import {rowAPI} from "service/RowService";
import {CellModel} from "entities/CellModel";
import {RowModel} from "entities/RowModel";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";

type DataRowModel = {
    id: GridRowId;
}

type PropsType = {
    ws: WebSocket | null,
}

export const  CoreGrid = (props: PropsType) => {

    const CustomToolbar = () => {
        return (
            <GridToolbarContainer>
                <div style={{display: 'flex', justifyContent: 'space-between', width: window.innerWidth}}>
                    <div style={{display: 'flex'}}>
                        <GridToolbarColumnsButton/>
                        <GridToolbarFilterButton/>
                        <GridToolbarExport/>
                    </div>
                    <div style={{display: 'flex'}}>
                        <GridToolbarQuickFilter/>
                    </div>
                </div>
            </GridToolbarContainer>
        );
    }

    // Params
    let {id} = useParams();
    // -----

    // States
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    const [rows, setRows] = useState<DataRowModel[]>([]);
    const [columns, setColumns] = useState<GridColDef[]>([]);
    const [paginationModel, setPaginationModel] = useState({
        pageSize: 25,
        page: 0,
    });
    // -----

    // Web requests
    const [getTableColumns, {
        data: columnsFromRequest,
        isLoading: isTableColumnsLoading
    }] = columnAPI.useGetAllByTableIdMutation();
    const [getTableData, {
        data: tableData,
        isError: isErrorTableData,
        isLoading: isTableDataLoading
    }] = rowAPI.useGetAllByTableIdMutation();
    // -----

    // Effects
    useEffect(() => {
        if (id) {
            getTableColumns(id);
        }
    }, []);
    useEffect(() => {
        if (columnsFromRequest && id) {
            const columns: GridColDef[] = columnsFromRequest.map((column:ColumnModel) => {
                return {
                    field: column.id ? column.id.toString() : "999",
                    headerName: column.name,
                    editable: true,
                    width: 200,
                    type: column.data_type == 'text' ? 'string' : 'number',
                    valueGetter: (params:CellModel) => {
                        return params.value;
                    },
                    valueSetter: (value, row) => {
                        let rowCopy = JSON.parse(JSON.stringify(row));
                        rowCopy[column.id??0].value = value
                        return rowCopy;
                    },
                    valueFormatter: (params:string) => {
                        return params;
                    },
                }
            });
            setColumns(columns);

            // Отправляю запрос на получение данных знаю кол-во колонок
            getTableData({tableId: id, page: 1, limit: 25});
            // -----
        }
    }, [columnsFromRequest]);
    useEffect(() => {
        if (tableData){
            // Получение списка уникальных строк
            let rowsIds: number[] = tableData.results.reduce((acc: number[], rowModel: RowModel) => {
                if (!acc.find((row: number) => row == rowModel.id)) {
                    return acc.concat(rowModel.id);
                }
                return acc;
            }, []);
            // -----

            // Формирование датасета
            const rowsForTable = tableData.results.map((row: RowModel) => {
                let item: any = {};
                item.id = row.id;
                // Получив список всех ячеек в строке формируем объект для датасета где ключ это ИД колонки из ячейки
                row.cells_list.forEach((cell: CellModel) => {
                    if (cell.column) item[cell.column] = cell;
                });
                // -----
                return item;
            });
            setRows(rowsForTable);
            // -----
        }
    }, [tableData]);
    // -----

    // Handler
    const onCellEditStartHandler = (params: GridCellParams) => {
        // Создаем блокировку на сервере
        if (props.ws) {
            let cellId: number = params.row[params.field].id;
            props.ws.send(JSON.stringify({cell_id: cellId, type: 'create', user_id: currentUser?.id}));
        }
        // -----
    };
    const onCellEditStopHandler = (params:GridCellParams) => {
        // Снимаем блокировку на сервере

        // -----
    };
    // -----

    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGridPremium
                onCellEditStart={onCellEditStartHandler}
                onCellEditStop={onCellEditStopHandler}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                columnBufferPx={100}
                rowBufferPx={100}
                localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
                rows={rows}
                columns={columns}
                getRowHeight={() => 'auto'}
                initialState={{
                    sorting: {
                        sortModel: [{field: 'date', sort: 'desc'}],
                    },
                }}
                sx={{
                    [`& .${gridClasses.cell}`]: {
                        py: 1,
                    },
                }}
                /*@ts-ignore*/
                pageSize={20}
                rowsPerPageOptions={[20]}
                disableSelectionOnClick
                slots={{toolbar: CustomToolbar}}
                loading={false}
                onCellDoubleClick={(params: GridCellParams) => {
                    //setSelectedTask(params.row);
                    //setVisibleTaskModal(true);
                }}
            />
        </div>
    );
}
