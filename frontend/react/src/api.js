export const API_BASE = window.API_BASE || "http://localhost:5432"; // e.g., 'http://localhost:4000'

async function handleRes(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function fetchImages() {
  const res = await fetch(`${API_BASE}/api/images`);
  if (!res.ok) throw new Error(await handleRes(res));
  return res.json();
}

export async function fetchCharacters(imageId) {
  const res = await fetch(`${API_BASE}/api/images/${imageId}/characters`);
  if (!res.ok) throw new Error(await handleRes(res));
  return res.json();
}

export async function createSession(imageId) {
  const res = await fetch(`${API_BASE}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image_id: imageId }),
  });
  if (!res.ok) throw new Error(await handleRes(res));
  return res.json();
}

export async function validateSelection(sessionId, x_pct, y_pct, character_id) {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ x_pct, y_pct, character_id }),
  });
  if (!res.ok) throw new Error(await handleRes(res));
  return res.json();
}

export async function getSessionStatus(sessionId) {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/status`);
  if (!res.ok) throw new Error(await handleRes(res));
  return res.json();
}

export async function finishSession(sessionId, anonymous_id, player_name) {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/finish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ anonymous_id, player_name }),
  });
  if (!res.ok) throw new Error(await handleRes(res));
  return res.json();
}

export async function fetchHighScores(imageId) {
  const res = await fetch(`${API_BASE}/api/scores?image_id=${imageId}`);
  if (!res.ok) throw new Error(await handleRes(res));
  return res.json();
}
