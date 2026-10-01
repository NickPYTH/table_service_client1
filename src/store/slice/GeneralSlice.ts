import {createSlice} from "@reduxjs/toolkit";
import {UserModel} from "entities/UserModel";
import {FilialModel} from "entities/FilialModel";

export type CurrentUserModelStateType = {
    user: UserModel | null;
    filials: FilialModel[];
}

const initialState: CurrentUserModelStateType = {
    user: null,
    filials: []
}

const generalSlice = createSlice({
    name: 'userSlice',
    initialState,
    reducers: {
        setCurrentUser: (state, action: { type: string, payload: any }) => {
            state.user = action.payload;
        },
        setFilials: (state, action: {type: string, payload: FilialModel[]}) => {
            state.filials = action.payload;
        }
    }
});

export const {setCurrentUser, setFilials} = generalSlice.actions;

export default generalSlice.reducer;
