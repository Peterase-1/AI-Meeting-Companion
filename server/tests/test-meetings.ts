import { api, getAuthToken, logResult } from './utils';

const runMeetingTests = async () => {
  console.log('--- Starting Meeting Tests ---');
  const { token } = await getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };

  // 1. Create Meeting
  const meetingData = {
    title: "Test Meeting",
    date: new Date().toISOString(),
    transcript: "John: Let's discuss the Q4 budget. We need to save 10% on marketing. Jane: Agreed, I'll update the spreadsheet."
  };

  const createRes = await api.post('/meetings', meetingData, { headers });
  logResult('Create Meeting', createRes.status === 201, createRes.data);

  if (createRes.status !== 201) return;
  const meetingId = createRes.data.id;

  // 2. List Meetings
  const listRes = await api.get('/meetings', { headers });
  const isListValid = listRes.status === 200 && Array.isArray(listRes.data) && listRes.data.length > 0;
  logResult('List Meetings', isListValid);

  // 3. Get Meeting Details
  const detailRes = await api.get(`/meetings/${meetingId}`, { headers });
  const isDetailValid = detailRes.status === 200 && detailRes.data.id === meetingId;
  logResult('Get Meeting Details', isDetailValid);
};

runMeetingTests();
