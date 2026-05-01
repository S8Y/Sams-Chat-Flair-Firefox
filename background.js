// Service worker — connects to Railway socket for instant flair updates
const API_URL = 'https://shimmering-learning-production.up.railway.app';
const CHANNEL = 'config:user_1772257763092';

let flairData = {};
let ws = null;

// Fetch bulk flair data
async function refreshBulk() {
  try {
    const res = await fetch(API_URL + '/v1/chat-flair/bulk');
    const data = await res.json();
    if (data.success && data.users) {
      flairData = data.users;
      // Store in browser.storage for content script
      browser.storage.local.set({ samFlairData: flairData });
      // Notify all tabs
      const tabs = await browser.tabs.query({ url: 'https://kick.com/sam*' });
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, { type: 'FLAIR_UPDATE', data: flairData }).catch(() => {});
      });
    }
  } catch (e) {
    console.log('[Sam Flair] Bulk fetch error:', e.message);
  }
}

// Connect to Socket.io via polling (simpler than raw WS for Socket.io)
// Socket.io uses HTTP long-polling as transport — we poll the Socket.io endpoint
async function connectSocket() {
  try {
    // Socket.io handshake
    const handshake = await fetch(API_URL + '/socket.io/?EIO=4&transport=polling');
    const text = await handshake.text();
    // Parse the sid from response like: 0{"sid":"abc123",...}
    const match = text.match(/"sid":"([^"]+)"/);
    if (!match) return;
    const sid = match[1];

    // Join the channel
    await fetch(API_URL + '/socket.io/?EIO=4&transport=polling&sid=' + sid, {
      method: 'POST',
      body: '42["join","' + CHANNEL + '"]',
    });

    // Start polling for messages
    pollSocket(sid);
  } catch (e) {
    console.log('[Sam Flair] Socket connect error:', e.message);
    // Fallback to periodic bulk fetch
    setTimeout(connectSocket, 30000);
  }
}

async function pollSocket(sid) {
  try {
    const res = await fetch(API_URL + '/socket.io/?EIO=4&transport=polling&sid=' + sid);
    const text = await res.text();

    // Check for COLOR_EQUIPPED or EMOJI_EQUIPPED events
    if (text.includes('COLOR_EQUIPPED') || text.includes('EMOJI_EQUIPPED')) {
      console.log('[Sam Flair] Socket event — refreshing');
      refreshBulk();
    }

    // Keep polling
    setTimeout(() => pollSocket(sid), 1000);
  } catch (e) {
    console.log('[Sam Flair] Poll error, reconnecting...');
    setTimeout(connectSocket, 5000);
  }
}

// Keepalive — prevent service worker from sleeping
function keepAlive() {
  setInterval(() => {
    browser.storage.local.get('samFlairData'); // No-op to keep alive
  }, 20000);
}

// Init
refreshBulk();
keepAlive();

// Try socket connection for instant updates, fall back to 10s polling
connectSocket();

// Also poll every 10s as fallback
setInterval(refreshBulk, 10000);

// Listen for messages from content script
browser.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'GET_FLAIR') {
    sendResponse({ data: flairData });
  }
  return true;
});