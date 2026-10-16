const feedbackList = document.querySelector('#feedback-list');
const feedbackCount = document.querySelector('#feedback-count');
const feedbackApiUrl = window.location.port === '5500'
  ? `http://${window.location.hostname}:5000/api/feedback`
  : `${window.location.origin}/api/feedback`;

async function parseJsonResponse(response) {
  const text = await response.text();

  if (!text) {
    throw new Error(
      `The server returned an empty response (HTTP ${response.status}). Make sure the Express backend is running and this page is opened from the same origin.`
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('The server returned an invalid response.');
  }
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[character]);
}

function renderFeedback(feedback) {
  feedbackCount.textContent = feedback.length;
  if (!feedback.length) {
    feedbackList.innerHTML = '<div class="empty-state"><span>◎</span><h3>No feedback yet</h3><p>Be the first to share a reflection.</p></div>';
    return;
  }

  feedbackList.innerHTML = feedback.map((item) => `
    <article class="feedback-card">
      <div class="feedback-card-top"><div class="avatar">${escapeHtml(item.name.trim().charAt(0).toUpperCase())}</div><div><h3>${escapeHtml(item.name)}</h3>
      <time datetime="${item.createdAt}">${new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(item.createdAt))}</time></div><span class="stars" aria-label="${item.rating} out of 5 stars">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</span></div>
      <p>${escapeHtml(item.comments)}</p>
    </article>`).join('');
}

async function loadFeedback() {
  try {
    const response = await fetch(feedbackApiUrl);
    const data = await parseJsonResponse(response);
    if (!response.ok) throw new Error(data.message || 'Could not load reflections.');
    renderFeedback(data);
  } catch (error) {
    feedbackCount.textContent = '—';
    feedbackList.innerHTML = `<div class="empty-state error-state"><span>!</span><h3>Database offline</h3><p>${error.message}</p></div>`;
  }
}

loadFeedback();
