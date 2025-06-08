import { configureStore } from "@reduxjs/toolkit";
import productSlice from "./productSlice";
import usersSlice from "./usersSlice";
import cartSlice from "./cartSlice";

export const store = configureStore({
  reducer: {
    products: productSlice,
    users: usersSlice,
    cart: cartSlice,
  },
});
