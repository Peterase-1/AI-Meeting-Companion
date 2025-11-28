import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MeetingState {
  transcript: string
  summary: string
  actionItems: any[]
}

const initialState: MeetingState = {
  transcript: '',
  summary: '',
  actionItems: [],
}

export const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload
    },
    setSummary: (state, action: PayloadAction<string>) => {
      state.summary = action.payload
    },
  },
})

export const { setTranscript, setSummary } = meetingSlice.actions
export default meetingSlice.reducer
