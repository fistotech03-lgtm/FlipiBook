import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiModalReducer from './slices/uiModalSlice';
import activeBookReducer from './slices/activeBookSlice';
import pageEditorReducer from './slices/pageEditorSlice';
import customizedEditorReducer from './slices/customizedEditorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    uiModal: uiModalReducer,
    activeBook: activeBookReducer,
    pageEditor: pageEditorReducer,
    customizedEditor: customizedEditorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
});

export default store;
