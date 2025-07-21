import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";

import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import selectedUserReducer from "./slices/selectedUserSlice";
import callReducer from './slices/callSlice'; // ✅ import callSlice

const persistConfig = {
  key: "root",
  storage,
  version: 1, // optional
  whitelist: ["auth"], // agar faqat auth saqlamoqchi bo‘lsang
};

const rootReducer = combineReducers({
  auth: authReducer,
  selectedUser: selectedUserReducer,
  call: callReducer, // ✅ call ni qo‘shamiz!
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,

  // redux-persist bilan middleware konfliktini oldini olamiz:
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          FLUSH,
          REHYDRATE, // <== rehydrate shu yerda!
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
        ],
      },
    }),
});

export const persistor = persistStore(store);
