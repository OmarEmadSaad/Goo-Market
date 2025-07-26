import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchUsers = createAsyncThunk("users/fetchUsers", async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users.json`);
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data;
});

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/${id}.json`
      );
      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(
          errorData.message || `Failed to fetch user: ${res.statusText}`
        );
      }
      const data = await res.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, userData }) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/users/${id}.json`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to update user");
    }
    const data = await res.json();
    return data;
  }
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/users/${id}.json`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete user");
      }
      localStorage.removeItem("userId");
      return id;
    } catch (error) {
      console.error("Delete user error:", error);
      return rejectWithValue(error.message || "Failed to delete user");
    }
  }
);

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
    currentUser: null,
    status: "idle",
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.userId = null;
      state.currentUser = null;
      state.users = [];
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("userId");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.users = Object.values(action.payload || {});
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(updateUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.currentUser = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.currentUser = null;
        state.userId = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || action.error.message;
        localStorage.removeItem("userId");
      })
      .addCase(setUserId.fulfilled, (state, action) => {
        state.userId = action.payload;
      });
  },
});

export const { logout } = usersSlice.actions;
export default usersSlice.reducer;
