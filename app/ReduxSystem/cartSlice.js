import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users.json`);
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      const users = Object.entries(data || {});
      const userEntry = users.find(([_, value]) => value.id === userId);

      if (!userEntry) throw new Error("User not found");

      const [, userData] = userEntry;
      const cart = Array.isArray(userData.cart) ? userData.cart : [];

      return cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async ({ userId, cart }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users.json`);
      if (!res.ok) throw new Error("Failed to fetch users");

      const data = await res.json();
      const users = Object.entries(data || {});
      const userEntry = users.find(([_, value]) => value.id === userId);

      if (!userEntry) throw new Error("User not found");

      const [firebaseKey] = userEntry;

      const patchRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/${firebaseKey}.json`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cart }),
        }
      );

      if (!patchRes.ok) throw new Error("Failed to update cart");

      return cart;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    status: "idle",
    error: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existing = state.cartItems.find((i) => i.id === item.id);

      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        state.cartItems.push({ ...item, quantity: item.quantity || 1 });
      }
    },
    decrementQuantity: (state, action) => {
      const itemId = action.payload;
      const existing = state.cartItems.find((i) => i.id === itemId);

      if (existing) {
        existing.quantity -= 1;
        if (existing.quantity <= 0) {
          state.cartItems = state.cartItems.filter((i) => i.id !== itemId);
        }
      }
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      state.cartItems = state.cartItems.filter((i) => i.id !== itemId);
    },
    setCartItems: (state, action) => {
      state.cartItems = action.payload;
    },
    clearCart: (state) => {
      state.cartItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cartItems = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.cartItems = action.payload;
      })
      .addCase(updateCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  addToCart,
  decrementQuantity,
  removeFromCart,
  setCartItems,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
