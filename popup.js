'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const pageStatus = document.getElementById('page-status');

  try {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    const url = activeTab?.url || '';
    const onKick = url.includes('kick.com/sam');

    if (onKick) {
      if (statusDot) statusDot.classList.remove('inactive');
      if (statusText) statusText.textContent = 'Active';
      if (pageStatus) pageStatus.textContent = '✅ Running on this page';
    } else {
      if (statusDot) statusDot.classList.add('inactive');
      if (statusText) statusText.textContent = 'Not active';
      if (pageStatus) pageStatus.textContent = 'Navigate to kick.com/sam to use';
    }
  } catch (_) {
    if (statusText) statusText.textContent = 'Active on kick.com/sam';
  }
});