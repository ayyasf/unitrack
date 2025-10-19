const BASE_URL = "https://dk6m8bl1-7144.asse.devtunnels.ms";

export  async  function  fetchWithAuth(endpoint, options = {}) {
  const config = { ...options, credentials: "include" };

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401) {
    // try to refresh
    const refreshRes = await fetch(`${BASE_URL}/api/v1/auth/refresh-token`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // retry original request
      response = await fetch(`${BASE_URL}${endpoint}`, config);
    }
  }

  return response;
}