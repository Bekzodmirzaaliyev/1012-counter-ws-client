import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedUser: null
}

const selectedUserSlice = createSlice({
    name: "selectedUser",
    initialState,
    reducers: {
        setSelect: (state, action) => {
            state.selectedUser = action.payload
        }
    }
})

export const { setSelect } = selectedUserSlice.actions
export default selectedUserSlice.reducer