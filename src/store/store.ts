import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import aiMapReducer from './slices/aiMapSlice';

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      aiMap: aiMapReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
