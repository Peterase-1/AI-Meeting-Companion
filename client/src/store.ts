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

import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
