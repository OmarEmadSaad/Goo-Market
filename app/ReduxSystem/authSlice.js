import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userId: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserId: (state, action) => {
      state.userId = action.payload;
    },
  },
});

export const { setUserId } = authSlice.actions;
export default authSlice.reducer;
