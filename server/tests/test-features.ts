import { api, getAuthToken, logResult } from './utils';

const runFeaturesTests = async () => {
  console.log('--- Starting AI Features Tests ---');
  const { token } = await getAuthToken();
  const headers = { Authorization: `Bearer ${token}` };

  const transcript = `
    Alice: Welcome everyone. We need to plan the launch of Version 2.0.
    Bob: I'll handle the frontend deployment by Friday.
    Alice: Make sure to update the documentation.
    Charlie: I'm working on the database migration, it's complex but I'll finish by Wednesday.
    Alice: We also need a marketing blog post.
    Bob: I can draft that.
    Alice: Great, let's prioritize the migration.
    `;

  // Setup: Create Meeting
  const createRes = await api.post('/meetings', { title: "Feature Test", transcript }, { headers });
  if (createRes.status !== 201) {
    logResult('Setup: Create Meeting', false);
    return;
  }
  const meetingId = createRes.data.id;
  logResult('Setup: Create Meeting', true);

  // 1. Generate Action Plan
  console.log('Testing Action Plan...');
  const planRes = await api.post(`/meetings/${meetingId}/action-plan`, {}, { headers });
  logResult('Action Plan Generation', planRes.status === 200 && !!planRes.data.tasks);

  // 2. Cluster Topics
  console.log('Testing Topic Clustering...');
  const topicRes = await api.post(`/meetings/${meetingId}/topics`, {}, { headers });
  logResult('Topic Clustering', topicRes.status === 200 && !!topicRes.data.topics);

  // 3. Chat Q&A
  console.log('Testing Chat Q&A...');
  const chatRes = await api.post(`/meetings/${meetingId}/chat`, { query: "Who is doing the migration?" }, { headers });
  logResult('Chat Q&A', chatRes.status === 200 && !!chatRes.data.answer);

  // 4. Generate Slides
  console.log('Testing Slide Generation...');
  const slideRes = await api.post(`/meetings/${meetingId}/generate/slides`, {}, { headers });
  logResult('Slide Generation', slideRes.status === 200 && !!slideRes.data.slides);

  // 5. Generate Document
  console.log('Testing Doc Generation...');
  const docRes = await api.post(`/meetings/${meetingId}/generate/proposal`, {}, { headers });
  logResult('Document Generation', docRes.status === 200 && !!docRes.data.content);
};

runFeaturesTests();
