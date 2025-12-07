import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface MeetingState {
  id?: string
  transcript: string
  summary: {
    short: string
    long: string
  }
  actionItems: Array<{
    who: string
    what: string
    dueDate: string | null
    priority: 'High' | 'Medium' | 'Low'
  }>
  decisions: string[]
  attendees: Array<{ name: string; role: string }>
  sentiment: {
    sentiment: string
    tone: string
    highlights: string[]
  }
  actionPlan?: {
    goals: string[]
    tasks: Array<{
      description: string
      owner: string
      deadline: string
      priority: string
      status: string
    }>
    timeline: Array<{
      milestone: string
      date: string
    }>
  }
}

const initialState: MeetingState = {
  transcript: '',
  summary: { short: '', long: '' },
  actionItems: [],
  decisions: [],
  attendees: [],
  sentiment: { sentiment: '', tone: '', highlights: [] },
}

export const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload
    },
    setMeetingData: (state, action: PayloadAction<Partial<MeetingState>>) => {
      return { ...state, ...action.payload }
    },
  },
})

export const { setTranscript, setMeetingData } = meetingSlice.actions
export default meetingSlice.reducer
