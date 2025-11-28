export let API_BASE_URL = "http://localhost:3000";

export const initializeApi = async () => {
  const renderUrl = "https://ai-meeting-companion.onrender.com";
  try {
    // specific check to the root or a health endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

    const response = await fetch(renderUrl, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      API_BASE_URL = renderUrl;
      console.log("Connected to Render Backend:", API_BASE_URL);
    } else {
      console.warn("Render Backend returned non-OK status, using localhost fallback.");
    }
  } catch (error) {
    console.warn("Could not connect to Render Backend, using localhost fallback.", error);
  }
};

export const getApiUrl = () => API_BASE_URL;
