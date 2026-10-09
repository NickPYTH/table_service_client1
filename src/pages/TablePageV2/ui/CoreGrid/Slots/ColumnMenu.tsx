import React from 'react';
import {
    GridColumnMenuColumnsItem,
    GridColumnMenuContainer,
    GridColumnMenuFilterItem,
    GridColumnMenuGroupingItem,
    GridColumnMenuSortItem,
    useGridApiContext
} from '@mui/x-data-grid-premium';
import {Divider, MenuItem} from '@mui/material';
import {useDispatch} from "react-redux";
import {setIsVisibleColumnSettingsModal, setSelectedColumnSystemName} from "store/slice/TableV2Slice";

export const ColumnMenu = (props:any) => {

    // Store
    const dispatch = useDispatch();
    // -----

    // Useful utils
    const { hideMenu, colDef, open } = props; // Используйте colDef вместо currentColumn
    if (!open) return null;
    // -----

    // Handlers
    const settingsHandler = (event:any) => {
        dispatch(setIsVisibleColumnSettingsModal(true));
        dispatch(setSelectedColumnSystemName(colDef.field));
        hideMenu(event);
    };
    // -----

    return (
        <GridColumnMenuContainer
            hideMenu={hideMenu}
            colDef={colDef}
            open={open}
        >
            <GridColumnMenuSortItem onClick={hideMenu} colDef={colDef} />
            <GridColumnMenuFilterItem onClick={hideMenu} colDef={colDef} />
            <GridColumnMenuGroupingItem onClick={hideMenu} colDef={colDef} />
            <GridColumnMenuColumnsItem onClick={hideMenu}  colDef={colDef}/>
            <>
                <Divider />
                <MenuItem onClick={settingsHandler}>
                    Настройки
                </MenuItem>
            </>
        </GridColumnMenuContainer>
    );
};
