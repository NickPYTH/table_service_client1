import {createSlice} from "@reduxjs/toolkit";

export type TableV2ModelStateType = {
    isVisibleColumnSettingsModal: boolean;
    selectedColumnSystemName: string | null;
    isVisibleRowSettingsModal: boolean;
    selectedRowId: number | null;
    refreshColumns: Function | null;
    tableName: string | null;
    createRowHandler: Function | null;
}

const initialState: TableV2ModelStateType = {
    isVisibleColumnSettingsModal: false,
    selectedColumnSystemName: null,
    isVisibleRowSettingsModal: false,
    selectedRowId: null,
    refreshColumns: null,
    tableName: null,
    createRowHandler: null,
}

const tableV2Slice = createSlice({
    name: 'tableV2Slice',
    initialState,
    reducers: {
        setIsVisibleColumnSettingsModal: (state, action: { type: string, payload: boolean }) => {
            state.isVisibleColumnSettingsModal = action.payload;
        },
        setSelectedColumnSystemName: (state, action: { type: string, payload: string | null }) => {
            state.selectedColumnSystemName = action.payload;
        },
        setIsVisibleRowSettingsModal: (state, action: { type: string, payload: boolean }) => {
            state.isVisibleRowSettingsModal = action.payload;
        },
        setSelectedRowId: (state, action: { type: string, payload: number | null }) => {
            state.selectedRowId = action.payload;
        },
        setRefreshColumns: (state, action: { type: string, payload: Function }) => {
            state.refreshColumns = action.payload;
        },
        setTableName: (state, action: { type: string, payload: string }) => {
            state.tableName = action.payload;
        },
        setCreateRowHandler: (state, action: { type: string, payload: Function }) => {
            state.createRowHandler = action.payload;
        },
    }
});

export const {
    setIsVisibleColumnSettingsModal,
    setSelectedColumnSystemName,
    setSelectedRowId,
    setIsVisibleRowSettingsModal,
    setRefreshColumns,
    setTableName,
    setCreateRowHandler
} = tableV2Slice.actions;

export default tableV2Slice.reducer;
