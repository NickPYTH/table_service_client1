import {createSlice} from "@reduxjs/toolkit";

export type TableV2ModelStateType = {
    isVisibleColumnSettingsModal: boolean;
    selectedColumnSystemName: string | null;
    isVisibleRowSettingsModal: boolean;
    selectedRowId: number | null;
}

const initialState: TableV2ModelStateType = {
    isVisibleColumnSettingsModal: false,
    selectedColumnSystemName: null,
    isVisibleRowSettingsModal: false,
    selectedRowId: null
}

const tableV2Slice = createSlice({
    name: 'tableV2Slice',
    initialState,
    reducers: {
        setIsVisibleColumnSettingsModal: (state, action: { type: string, payload: boolean }) => {
            state.isVisibleColumnSettingsModal = action.payload;
        },
        setSelectedColumnSystemName: (state, action: {type: string, payload: string | null}) => {
            state.selectedColumnSystemName = action.payload;
        },
        setIsVisibleRowSettingsModal: (state, action: { type: string, payload: boolean }) => {
            state.isVisibleRowSettingsModal = action.payload;
        },
        setSelectedRowId: (state, action: {type: string, payload: number | null}) => {
            state.selected = action.payload;
        },
    }
});

export const {
    setIsVisibleColumnSettingsModal,
    setSelectedColumnSystemName,
    setSelectedRowId,
    setIsVisibleRowSettingsModal
} = tableV2Slice.actions;

export default tableV2Slice.reducer;
