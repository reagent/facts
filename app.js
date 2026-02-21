// ═══════════════════════════════════════════
// APP LOGIC
// ═══════════════════════════════════════════
let currentFact = null;

function getFactById(id) {
  return facts.find(f => f.id === id);
}

function getShareUrl(factId) {
  return `${window.location.origin}${window.location.pathname}#${factId}`;
}

function showFact(fact) {
  currentFact = fact;

  // Update hash without triggering hashchange
  history.replaceState(null, '', `#${fact.id}`);

  // Render
  const card = document.getElementById('factCard');
  card.style.animation = 'none';
  card.offsetHeight; // trigger reflow
  card.style.animation = 'fadeIn 0.4s ease forwards';

  document.getElementById('factNumber').textContent = `Fact #${fact.id} of ${facts.length}`;
  document.getElementById('factText').textContent = fact.text;

  const sourceEl = document.getElementById('factSource');
  const sourceLinks = fact.sources.map(s =>
    `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`
  ).join(' · ');
  sourceEl.innerHTML = `Source: ${sourceLinks}`;

  // Update page title
  document.title = `Fact #${fact.id} — Facts Archive`;
}

function showRandomFact() {
  let next;
  do {
    next = facts[Math.floor(Math.random() * facts.length)];
  } while (next === currentFact && facts.length > 1);
  showFact(next);
}

function copyLink() {
  if (!currentFact) return;
  const url = getShareUrl(currentFact.id);
  navigator.clipboard.writeText(url).then(() => {
    showToast('Link copied to clipboard');
  }).catch(() => {
    // Fallback
    const input = document.createElement('input');
    input.value = url;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast('Link copied to clipboard');
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ═══════════════════════════════════════════
// QR CODE
// ═══════════════════════════════════════════
function showQR() {
  if (!currentFact) return;
  const url = getShareUrl(currentFact.id);

  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();

  const canvas = document.getElementById('qrCanvas');
  const ctx = canvas.getContext('2d');
  const moduleCount = qr.getModuleCount();
  const cellSize = 6;
  const margin = 16;
  const size = moduleCount * cellSize + margin * 2;

  canvas.width = size;
  canvas.height = size;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#1a1a1a';

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(col * cellSize + margin, row * cellSize + margin, cellSize, cellSize);
      }
    }
  }

  document.getElementById('qrUrl').textContent = url;
  document.getElementById('qrOverlay').classList.add('active');
}

function closeQR(event) {
  if (event && event.target !== event.currentTarget) return;
  document.getElementById('qrOverlay').classList.remove('active');
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
(function init() {
  const hash = window.location.hash.slice(1);
  const id = parseInt(hash, 10);

  // Detect navigation type: "reload" vs "navigate" (e.g. clicking a shared link)
  const navType = (performance.getEntriesByType('navigation')[0] || {}).type;
  const isReload = navType === 'reload';

  if (!isReload && id && getFactById(id)) {
    // Arrived via a shared link — show the specific fact
    showFact(getFactById(id));
  } else {
    // Fresh visit or page reload — show a random fact
    showRandomFact();
  }

  // Handle back/forward
  window.addEventListener('hashchange', () => {
    const id = parseInt(window.location.hash.slice(1), 10);
    if (id && getFactById(id)) {
      showFact(getFactById(id));
    }
  });

  // Escape closes QR
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeQR();
  });
})();
