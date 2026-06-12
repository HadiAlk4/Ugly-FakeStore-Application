import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
    isHydrated: false,
};

export const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const itemIndex = state.items.findIndex((item) => item.id === action.payload.id);
            if(itemIndex >= 0){
                state.items[itemIndex].quantity += 1;
            } else {
                state.items.push({...action.payload, quantity: 1});
            }
        },
        incrementQuantity: (state, action) => {
            const item = state.items.find((item) => item.id === action.payload);
            if(item){
                item.quantity +=1;
            }
        },
        decrementQuantity: (state, action) => {
            const item = state.items.find((item) => item.id === action.payload);
            if(item){
                if(item.quantity === 1){
                    state.items = state.items.filter((i) => i.id !== action.payload);
                } else {
                    item.quantity -= 1;
                }
            }
        }, 
        removeFromCart: (state, action) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
        },
        clearCart: (state) => {
            state.items = [];
            state.isHydrated = false;
        },
        setCartItems: (state, action) => {
            state.items = action.payload;
            state.isHydrated = true;
        },
    },
});

export const { addToCart, incrementQuantity, decrementQuantity, removeFromCart, clearCart, setCartItems } = cartSlice.actions;

export default cartSlice.reducer;