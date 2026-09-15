const API_BASE =
  "http://127.0.0.1:8000";


async function request(
  endpoint,
  options = {}
) {
  const response = await fetch(
    `${API_BASE}${endpoint}`,
    {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        "Request failed"
    );
  }

  if (data.success === false) {
    throw new Error(
      data.error ||
        "Request failed"
    );
  }

  return data;
}


// --------------------------------------------------
// Research
// --------------------------------------------------

export async function runResearch(
  query,
  sessionId = null
) {
  return request("/research", {
    method: "POST",
    body: JSON.stringify({
      query,
      session_id: sessionId,
    }),
  });
}


// --------------------------------------------------
// Research History / Persistent Conversations
// --------------------------------------------------

export async function getSessions() {
  return request("/sessions");
}


export async function getSessionMessages(
  sessionId
) {
  return request(
    `/sessions/${sessionId}/messages`
  );
}


export async function deleteSession(
  sessionId
) {
  return request(
    `/sessions/${sessionId}`,
    {
      method: "DELETE",
    }
  );
}


// --------------------------------------------------
// Watchlist
// --------------------------------------------------

export async function getWatchlist() {
  return request("/watchlist");
}


export async function addToWatchlist(
  symbol,
  companyName
) {
  return request("/watchlist", {
    method: "POST",
    body: JSON.stringify({
      symbol,
      company_name: companyName,
    }),
  });
}


export async function removeFromWatchlist(
  symbol
) {
  return request(
    `/watchlist/${encodeURIComponent(
      symbol
    )}`,
    {
      method: "DELETE",
    }
  );
}


// --------------------------------------------------
// Market Data
// --------------------------------------------------

export async function getMarketOverview(
  symbol
) {
  return request(
    `/market/${encodeURIComponent(
      symbol
    )}`
  );
}


export async function getMarketHistory(
  symbol
) {
  return request(
    `/market/${encodeURIComponent(
      symbol
    )}/history`
  );
}