import React, {useContext} from 'react';
import {GridColumnMenuColumnsItem, GridColumnMenuContainer, useGridApiContext} from '@mui/x-data-grid-premium';
import {Divider, MenuItem} from '@mui/material';
import {TableContext} from "pages/TablePage/ui/TablePage";
import {useSelector} from "react-redux";
import {RootStateType} from "store/store";
import {ROLE} from "shared/config/constants";

export const ColumnMenu = (props:any) => {

    // Store
    const currentUser = useSelector((state: RootStateType) => state.currentUser.user);
    // -----

    // Context
    const apiRef = useGridApiContext();
    const tableContext = useContext(TableContext);
    // -----

    // Useful utils
    const { hideMenu, colDef, open } = props; // Используйте colDef вместо currentColumn
    if (!open) return null;
    // -----

    // Handlers
    const sortHandler = (direction:any, event:any) => {
        apiRef.current.sortColumn(colDef.field, direction);
        hideMenu(event);
    };
    const filterHandler = (event:any) => {
        apiRef.current.showFilterPanel(colDef.field);
        hideMenu(event);
    };
    const settingsHandler = (event:any) => {
        if (tableContext) {
            let columnId: number = parseInt(colDef.field);
            tableContext.setSelectedColumnId(columnId);
            tableContext.setIsVisibleColumnSettingsModal(true);
        }
        hideMenu(event);
    };
    // -----

    return (
        <GridColumnMenuContainer
            hideMenu={hideMenu}
            colDef={colDef}
            open={open}
        >
            <MenuItem onClick={(event) => sortHandler('asc', event)}>
                Сортировка по возрастанию
            </MenuItem>
            <MenuItem onClick={(event) => sortHandler('desc', event)}>
                Сортировка по убыванию
            </MenuItem>
            <Divider />
            <GridColumnMenuColumnsItem onClick={hideMenu}  colDef={colDef}/>
            <Divider />
            <MenuItem onClick={filterHandler}>
                Фильтр
            </MenuItem>
            {(tableContext?.role == ROLE.ADMIN || tableContext?.role == ROLE.OWNER) &&
                <>
                    <Divider />
                    <MenuItem onClick={settingsHandler}>
                        Настройки
                    </MenuItem>
                </>
            }
        </GridColumnMenuContainer>
    );
};
