const API_BASE_URL = window.APP_CONFIG?.API_BASE_URL || "";

const subscribeForm = document.getElementById("subscribe-form");
const eventForm = document.getElementById("event-form");
const subscribeButton = document.getElementById("subscribe-btn");
const eventButton = document.getElementById("event-btn");
const subscribeMessage = document.getElementById("subscribe-message");
const eventMessage = document.getElementById("event-message");
const eventsStatus = document.getElementById("events-status");
const eventsList = document.getElementById("events-list");

function setMessage(el, text, type) {
  el.textContent = text;
  el.classList.remove("success", "error");
  if (type) {
    el.classList.add(type);
  }
}

function setLoading(button, isLoading, idleText, loadingText = "Loading...") {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : idleText;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function postJson(path, body, extraHeaders = {}) {
  if (!API_BASE_URL) {
    throw new Error("Configure frontend/config.js with your backend URL.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders
    },
    body: JSON.stringify(body)
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEvents(events) {
  if (!events || events.length === 0) {
    eventsList.innerHTML = "<p>No events yet.</p>";
    return;
  }

  eventsList.innerHTML = events
    .map(
      (event) => `
      <article class="event-item">
        <h3>${escapeHtml(event.title || "")}</h3>
        <p class="event-meta">Date: ${escapeHtml(event.date || "")}</p>
        <p class="event-meta">Created: ${new Date(event.createdAt).toLocaleString()}</p>
        <p class="event-desc">${escapeHtml(event.description || "")}</p>
      </article>
    `
    )
    .join("");
}

async function loadEvents() {
  try {
    setMessage(eventsStatus, "Loading events...", "");
    const response = await fetch(`${API_BASE_URL}/events`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || "Failed to load events.");
    }
    renderEvents(data.events || []);
    setMessage(eventsStatus, "", "");
  } catch (error) {
    setMessage(eventsStatus, error.message, "error");
    eventsList.innerHTML = "";
  }
}

subscribeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();

  if (!isValidEmail(email)) {
    setMessage(subscribeMessage, "Enter a valid email address.", "error");
    return;
  }

  setMessage(subscribeMessage, "", "");
  setLoading(subscribeButton, true, "Subscribe", "Subscribing...");

  try {
    const data = await postJson("/subscribe", { email });
    setMessage(
      subscribeMessage,
      data.message || "Subscribed successfully.",
      "success"
    );
    subscribeForm.reset();
  } catch (error) {
    setMessage(subscribeMessage, error.message, "error");
  } finally {
    setLoading(subscribeButton, false, "Subscribe");
  }
});

eventForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const date = document.getElementById("date").value;
  const description = document.getElementById("description").value.trim();

  if (!title || !date || !description) {
    setMessage(eventMessage, "All event fields are required.", "error");
    return;
  }

  setMessage(eventMessage, "", "");
  setLoading(eventButton, true, "Create Event", "Creating...");

  try {
    const data = await postJson("/create-event", { title, date, description });
    setMessage(eventMessage, data.message || "Event created successfully.", "success");
    document.getElementById("title").value = "";
    document.getElementById("date").value = "";
    document.getElementById("description").value = "";
    await loadEvents();
  } catch (error) {
    setMessage(eventMessage, error.message, "error");
  } finally {
    setLoading(eventButton, false, "Create Event");
  }
});

loadEvents();
