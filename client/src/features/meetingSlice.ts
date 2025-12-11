import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { api } from '../lib/api'

export interface MeetingState {
  id?: string
  transcript: string
  fileUrl?: string | null
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
  topics: Array<{ name: string; description: string; keywords: string[] }>
  chatHistory: Array<{ role: 'user' | 'model'; content: string }>
}

const initialState: MeetingState = {
  transcript: '',
  summary: { short: '', long: '' },
  actionItems: [],
  decisions: [],
  attendees: [],
  sentiment: { sentiment: '', tone: '', highlights: [] },
  topics: [],
  chatHistory: [],
}

export const meetingSlice = createSlice({
  name: 'meeting',
  initialState,
  reducers: {
    setTranscript: (state, action: PayloadAction<string>) => {
      state.transcript = action.payload
    },
    resetMeeting: (state) => {
      return { ...initialState, transcript: state.transcript } // Keep transcript if user is just re-processing same text, but actually usually we want clean slate. Let's keep transcript if needed or just reset all. User wants new results.
    },
    setFileUrl: (state, action: PayloadAction<string | null>) => {
      state.fileUrl = action.payload
    },
    setMeetingData: (state, action: PayloadAction<Partial<MeetingState>>) => {
      return { ...state, ...action.payload }
    },
    setTopics: (state, action: PayloadAction<MeetingState['topics']>) => {
      state.topics = action.payload
    },
    setChatHistory: (state, action: PayloadAction<MeetingState['chatHistory']>) => {
      state.chatHistory = action.payload
    },
    setActionPlan: (state, action: PayloadAction<MeetingState['actionPlan']>) => {
      state.actionPlan = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(saveMeeting.fulfilled, (state, action) => {
      state.id = action.payload.id
    })
  }
})

export const saveMeeting = createAsyncThunk(
  'meeting/save',
  async (meetingData: MeetingState, { rejectWithValue }) => {
    try {
      const { id, ...dataToSave } = meetingData
      const response = await api.post('/api/meetings', dataToSave)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to save meeting')
    }
  }
)

export const { setTranscript, setFileUrl, setMeetingData, setTopics, setChatHistory, setActionPlan, resetMeeting } = meetingSlice.actions
export default meetingSlice.reducer
