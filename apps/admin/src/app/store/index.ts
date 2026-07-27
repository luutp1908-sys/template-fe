import { configureStore } from '@reduxjs/toolkit';
import categoriesReducer from '../categories/store/categories.slice';

export const store = configureStore({
  reducer: {
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
