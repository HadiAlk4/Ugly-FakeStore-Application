import { createSlice } from '@reduxjs/toolkit';

export const orderSlice = createSlice({
    name: 'orders',
    initialState: {
        newOrderCount: 0,
    },
    reducers: {
        setNewOrderCount: (state, action) => {
            state.newOrderCount = action.payload;
        },
        clearOrderBadge: (state) => {
            state.newOrderCount = 0;
        }
    }
});

export const { setNewOrderCount, clearOrderBadge } = orderSlice.actions;
export default orderSlice.reducer;