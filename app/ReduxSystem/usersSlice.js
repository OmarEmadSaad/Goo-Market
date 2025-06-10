import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const res = await fetch(process.env.NEXT_PUBLIC_USERS_URL);
  const data = await res.json();
  return data;
});

export const setUserId = createAsyncThunk("users/setUserId", async (id) => {
  if (id) {
    localStorage.setItem("userId", id);
  } else {
    localStorage.removeItem("userId");
  }

  return id;
});

const usersSlice = createSlice({
  name: "users",
  initialState: {
    users: [],
    userId: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(setUserId.fulfilled, (state, action) => {
        state.userId = action.payload;
      });
  },
});

export default usersSlice.reducer;

// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
//   const res = await fetch(process.env.NEXT_PUBLIC_USERS_URL);
//   const data = await res.json();
//   return data;
// });

// const usersSlice = createSlice({
//   name: "users",
//   initialState: {
//     users: [],
//     status: "idle",
//     error: null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchUsers.pending, (state) => {
//         state.status = "loading";
//       })
//       .addCase(fetchUsers.fulfilled, (state, action) => {
//         state.status = "succeeded";
//         state.users = action.payload;
//       })
//       .addCase(fetchUsers.rejected, (state, action) => {
//         state.status = "failed";
//         state.error = action.error.message;
//       });
//   },
// });

// export default usersSlice.reducer;
