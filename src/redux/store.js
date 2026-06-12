import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";
import orderReducer from "./orderSlice";

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        orders: orderReducer, 
    },
});

export default store;