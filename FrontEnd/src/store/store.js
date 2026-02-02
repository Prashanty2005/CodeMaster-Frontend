import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../slices/authSlice"
import problemReducer from "../slices/authSlice1"
//store will match slice name with its reducers
export const store = configureStore({
  reducer: {
    auth: authReducer,
    problems: problemReducer,
  }
});

export default store;

