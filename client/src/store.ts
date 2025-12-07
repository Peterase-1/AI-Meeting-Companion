import { configureStore } from '@reduxjs/toolkit'
import meetingReducer from './features/meetingSlice'
import authReducer from './features/authSlice'

export const store = configureStore({
  reducer: {
    meeting: meetingReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
