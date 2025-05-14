import { createAsyncThunk } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
export const registerUser = createAsyncThunk("auth/register", async (data) => {
  const res = await axios.post(
    "http://localhost:8000/api/v1/auth/register",
    data
  );
  return res.data;
});

export const loginUser = createAsyncThunk("auth/login", async (data) => {
  const res = await axios.post("http://localhost:8000/api/v1/auth/login", data);
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    isAuth: false,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.isAuth = true;
    },
    register: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.isAuth = true;
    },
    logout: (state, action) => {
      state.user = null;
      state.loading = false;
      state.isAuth = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      });
  },
});


export const { login, register, logout } = authSlice.actions;
export default authSlice.reducer;
