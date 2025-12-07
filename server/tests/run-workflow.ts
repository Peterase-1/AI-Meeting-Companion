import { api, generateUser, logResult } from './utils';

const runWorkflow = async () => {
  console.log('==========================================');
  console.log('   STARTING END-TO-END WORKFLOW TEST');
  console.log('==========================================');

  try {
    // 1. User Registration & Login
    const user = generateUser();
    console.log(`\n[Step 1] Creating User: ${user.email}`);
    await api.post('/auth/register', user);
    const loginRes = await api.post('/auth/login', { email: user.email, password: user.password });
    const token = loginRes.data.token;
    const headers = { Authorization: `Bearer ${token}` };
    logResult('Authentication', !!token);

    // 2. Upload Meeting
    console.log(`\n[Step 2] Uploading Meeting...`);
    const transcript = `
        Manager: We need to reduce our cloud costs by 20% this quarter.
        Dev: We can optimize our image assets and use caching.
        Manager: Good idea. Can you create a plan for that?
        Dev: Yes, I'll have a proposal by Monday.
        Manager: Let's also review the security logs.
        `;
    const uploadRes = await api.post('/meetings', { title: "Cost Optimization", transcript }, { headers });
    const meetingId = uploadRes.data.id;
    logResult('Meeting Upload & Initial Analysis', uploadRes.status === 201 && !!meetingId);

    // 3. Detailed Features
    if (meetingId) {
      console.log(`\n[Step 3] Running Advanced Features on Meeting ${meetingId}...`);

      // Action Plan
      const planRes = await api.post(`/meetings/${meetingId}/action-plan`, {}, { headers });
      logResult('  -> Action Plan', planRes.status === 200);

      // Topics
      const topicsRes = await api.post(`/meetings/${meetingId}/topics`, {}, { headers });
      logResult('  -> Topics', topicsRes.status === 200);

      // Chat
      const chatRes = await api.post(`/meetings/${meetingId}/chat`, { query: "What is the goal?" }, { headers });
      logResult('  -> Chat Answer', chatRes.status === 200);

      // Slide Gen
      const slideRes = await api.post(`/meetings/${meetingId}/generate/slides`, {}, { headers });
      logResult('  -> Slide Generation', slideRes.status === 200);

      // Doc Gen
      const docRes = await api.post(`/meetings/${meetingId}/generate/technical_spec`, {}, { headers });
      logResult('  -> Tech Spec Generation', docRes.status === 200);
    }

    console.log('\n==========================================');
    console.log('   WORKFLOW COMPLETE');
    console.log('==========================================');

  } catch (error: any) {
    console.error('Workflow Failed:', error.response ? error.response.data : error.message);
  }
};

runWorkflow();
