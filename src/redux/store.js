import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./cartSlice";
import authReducer from "./authSlice";
import orderReducer from "./orderSlice";
import { saveCart } from "../api/demoApi";

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        orders: orderReducer, 
    },
});

// Demo mode: save the signed-in user's cart to the browser whenever it changes.
let lastItems = null;
store.subscribe(() => {
    const { auth, cart } = store.getState();
    if (auth.token && cart.isHydrated && cart.items !== lastItems) {
        lastItems = cart.items;
        saveCart(auth.token, cart.items);
    }
});

export default store;