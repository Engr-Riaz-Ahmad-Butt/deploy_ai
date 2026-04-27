// ============================================================
// STATE
// ============================================================
const editor         = document.getElementById('code-editor');
const previewFrame   = document.getElementById('preview-frame');
const tabs           = document.querySelectorAll('.tab');
const deployBtn      = document.getElementById('deploy-btn');
const templateSelect = document.getElementById('template-select');

let currentTab  = 'html';
let vercelReady = false;   // updated after /api/user responds

const codeState = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Site</title>
  <style>
    body {
      font-family: sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background: #f8fafc;
    }
    h1 { color: #6366f1; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
</body>
</html>`,
    css: '',
    js:  ''
};

// ============================================================
// TEMPLATES
// ============================================================
const templates = {
    basic: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Landing Page</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hero">
    <span class="badge">🚀 Deployed with Vercel</span>
    <h1>Welcome to my site</h1>
    <p>Built and deployed in one click using Deploy.io.</p>
    <a href="#" class="btn">Get Started</a>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero { text-align: center; color: white; padding: 40px 20px; }
.badge {
  display: inline-block;
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  padding: 6px 16px;
  border-radius: 50px;
  font-size: 14px;
  margin-bottom: 24px;
}
h1 { font-size: 3rem; font-weight: 800; margin-bottom: 16px; }
p  { font-size: 1.1rem; opacity: 0.85; margin-bottom: 32px; }
.btn {
  display: inline-block;
  background: white;
  color: #6366f1;
  padding: 14px 32px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 700;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn:hover { transform: translateY(-3px); box-shadow: 0 12px 30px rgba(0,0,0,0.2); }`,
        js: `console.log('Site loaded!');`
    },

    modern: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Modern Landing</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <div class="logo">Brand</div>
    <a href="#" class="cta">Get Started</a>
  </nav>
  <main>
    <div class="tag">✨ New · Version 2.0</div>
    <h1>The future is<br><span>beautifully dark.</span></h1>
    <p>A modern landing page template with sleek dark aesthetics.</p>
    <div class="actions">
      <a href="#" class="btn-primary">Start for free</a>
      <a href="#" class="btn-ghost">Learn more →</a>
    </div>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: #080e1e; color: #f1f5f9; min-height: 100vh; }
nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid rgba(255,255,255,0.08); }
.logo { font-weight: 800; color: #6366f1; }
.cta { background: #6366f1; color: white; padding: 8px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 0.875rem; }
main { max-width: 800px; margin: 0 auto; padding: 120px 24px; text-align: center; }
.tag { display: inline-block; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.3); color: #a5b4fc; padding: 6px 16px; border-radius: 50px; font-size: 0.8rem; font-weight: 600; margin-bottom: 28px; }
h1 { font-size: 4rem; font-weight: 800; line-height: 1.1; letter-spacing: -2px; margin-bottom: 24px; }
h1 span { background: linear-gradient(135deg, #6366f1, #22d3ee); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
p { color: #64748b; font-size: 1.1rem; margin-bottom: 40px; }
.actions { display: flex; gap: 12px; justify-content: center; }
.btn-primary { background: #6366f1; color: white; padding: 13px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; }
.btn-ghost { color: #94a3b8; padding: 13px 20px; text-decoration: none; font-weight: 600; }`,
        js: ``
    },

    portfolio: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Portfolio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header>
    <div class="avatar">👤</div>
    <h1>Alex Johnson</h1>
    <p class="title">Full-Stack Developer & Designer</p>
    <div class="tags"><span>React</span><span>Node.js</span><span>Figma</span></div>
  </header>
  <section>
    <h2>Projects</h2>
    <div class="grid">
      <div class="card"><div class="card-icon">🛒</div><h3>E-Commerce App</h3><p>Built with React and Stripe.</p></div>
      <div class="card"><div class="card-icon">📊</div><h3>Analytics Dashboard</h3><p>Real-time data with D3.js.</p></div>
      <div class="card"><div class="card-icon">🤖</div><h3>AI Chat Tool</h3><p>GPT-powered Slack assistant.</p></div>
    </div>
  </section>
  <script src="script.js"></script>
</body>
</html>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: #0f172a; color: #f1f5f9; }
header { text-align: center; padding: 80px 24px 60px; border-bottom: 1px solid rgba(255,255,255,0.06); }
.avatar { width: 80px; height: 80px; background: rgba(99,102,241,0.15); border: 2px solid rgba(99,102,241,0.3); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 20px; }
h1 { font-size: 2.2rem; font-weight: 800; margin-bottom: 8px; }
.title { color: #6366f1; font-weight: 600; margin-bottom: 20px; }
.tags { display: flex; gap: 8px; justify-content: center; }
.tags span { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); color: #a5b4fc; padding: 4px 12px; border-radius: 50px; font-size: 0.8rem; }
section { max-width: 900px; margin: 0 auto; padding: 60px 24px; }
h2 { font-size: 1.4rem; font-weight: 700; margin-bottom: 32px; color: #94a3b8; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.card { background: rgba(30,41,59,0.5); border: 1px solid rgba(255,255,255,0.07); border-radius: 14px; padding: 28px; transition: transform 0.2s; }
.card:hover { transform: translateY(-4px); border-color: rgba(99,102,241,0.3); }
.card-icon { font-size: 1.8rem; margin-bottom: 14px; }
.card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
.card p { color: #64748b; font-size: 0.875rem; }`,
        js: ``
    },

    business: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Acme Co.</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <nav>
    <div class="logo">Acme Co.</div>
    <div class="links"><a href="#">Services</a><a href="#">About</a><a href="#" class="cta">Get a Quote</a></div>
  </nav>
  <main>
    <h1>We build things<br>that <span>matter.</span></h1>
    <p>Trusted by 500+ businesses worldwide.</p>
    <a href="#" class="btn">Start a project →</a>
  </main>
  <section class="stats">
    <div><strong>500+</strong><span>Clients</span></div>
    <div><strong>98%</strong><span>Satisfaction</span></div>
    <div><strong>12yr</strong><span>Experience</span></div>
    <div><strong>24/7</strong><span>Support</span></div>
  </section>
  <script src="script.js"></script>
</body>
</html>`,
        css: `* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: -apple-system, sans-serif; background: #fff; color: #0f172a; }
nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; border-bottom: 1px solid #e2e8f0; }
.logo { font-weight: 800; color: #6366f1; }
.links { display: flex; gap: 24px; align-items: center; }
.links a { color: #475569; text-decoration: none; font-size: 0.9rem; }
.cta { background: #6366f1 !important; color: white !important; padding: 8px 20px; border-radius: 8px; }
main { max-width: 860px; margin: 0 auto; padding: 100px 40px 80px; }
h1 { font-size: 4rem; font-weight: 800; letter-spacing: -2px; line-height: 1.1; margin-bottom: 20px; }
h1 span { color: #6366f1; }
p { font-size: 1.1rem; color: #64748b; margin-bottom: 36px; }
.btn { display: inline-block; background: #0f172a; color: white; padding: 14px 30px; border-radius: 10px; text-decoration: none; font-weight: 700; }
.stats { background: #f8fafc; border-top: 1px solid #e2e8f0; display: grid; grid-template-columns: repeat(4, 1fr); padding: 48px 80px; text-align: center; }
.stats div { display: flex; flex-direction: column; gap: 4px; }
.stats strong { font-size: 2rem; font-weight: 800; color: #6366f1; }
.stats span { color: #64748b; font-size: 0.875rem; }`,
        js: ``
    }
};

// ============================================================
// PREVIEW
// ============================================================
function updatePreview() {
    const combined = `<!DOCTYPE html><html><head><style>${codeState.css}</style></head><body>${codeState.html}<script>${codeState.js}<\/script></body></html>`;
    const blob = new Blob([combined], { type: 'text/html' });
    previewFrame.src = URL.createObjectURL(blob);
}

function refreshPreview() { updatePreview(); }
window.refreshPreview = refreshPreview;

// ============================================================
// TABS
// ============================================================
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        codeState[currentTab] = editor.value;
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.dataset.type;
        editor.value = codeState[currentTab];
    });
});

editor.addEventListener('input', () => {
    codeState[currentTab] = editor.value;
    updatePreview();
});

// ============================================================
// TEMPLATES
// ============================================================
function loadTemplate(name) {
    const tpl = templates[name];
    if (!tpl) return;
    codeState.html = tpl.html;
    codeState.css  = tpl.css;
    codeState.js   = tpl.js;
    editor.value   = codeState[currentTab];
    updatePreview();
}

templateSelect.addEventListener('change', e => {
    if (e.target.value) loadTemplate(e.target.value);
    e.target.value = '';
});

// ============================================================
// USER INFO + VERCEL STATUS
// ============================================================
async function loadUser() {
    try {
        const res  = await fetch('/api/user');
        const data = await res.json();
        if (!data.loggedIn) return;

        vercelReady = data.vercelConnected;

        // GitHub badge
        const userEl = document.getElementById('user-info');
        userEl.innerHTML = `
            <div class="user-badge">
                ${data.avatarUrl ? `<img class="user-avatar" src="${data.avatarUrl}" alt="${data.username}">` : ''}
                ${data.username}
            </div>`;

        updateVercelBadge(data.vercelConnected, data.vercelUsername);
    } catch (_) {}
}

function updateVercelBadge(connected, username) {
    const vercelEl = document.getElementById('vercel-status');
    if (connected) {
        vercelEl.innerHTML = `
            <div class="user-badge" style="background:rgba(0,0,0,0.3); border-color:rgba(255,255,255,0.15); gap:6px;">
                <span>▲</span>
                ${username ? username : 'Vercel Connected'}
                <button onclick="disconnectVercel()" title="Disconnect"
                    style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:0.75rem;padding:0;line-height:1;">✕</button>
            </div>`;
    } else {
        vercelEl.innerHTML = `
            <button onclick="openVercelConnect()" class="btn"
                style="background:#000;color:#fff;border:1px solid rgba(255,255,255,0.15);font-size:0.8rem;padding:6px 14px;gap:6px;">
                <span>▲</span> Connect Vercel
            </button>`;
    }
}

function openVercelConnect() {
    const modal = document.getElementById('deploy-modal');
    modal.classList.add('open');
    hideAllModalViews();
    document.getElementById('modal-noVercel-view').style.display = 'block';
    setTimeout(() => document.getElementById('vercel-token-input').focus(), 80);
}

async function connectVercelToken() {
    const input  = document.getElementById('vercel-token-input');
    const errEl  = document.getElementById('vercel-token-error');
    const btn    = document.getElementById('vercel-connect-btn');
    const token  = input.value.trim();

    errEl.style.display = 'none';
    if (!token) { input.focus(); return; }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Verifying…';

    try {
        const res  = await fetch('/auth/vercel/token', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ token })
        });

        let data;
        try { data = await res.json(); }
        catch { throw new Error('Server error — restart the server and try again.'); }

        if (data.success) {
            vercelReady = true;
            updateVercelBadge(true, data.username);
            showToast('▲ Vercel connected!', 'success');
            // Automatically proceed to the deploy name input
            showInputView();
            const nameInput = document.getElementById('repo-name-input');
            nameInput.value = 'my-site-' + Date.now().toString().slice(-5);
            setTimeout(() => { nameInput.focus(); nameInput.select(); }, 80);
        } else {
            errEl.textContent    = data.error || 'Invalid token.';
            errEl.style.display  = 'block';
            input.focus();
        }
    } catch (err) {
        errEl.textContent   = err.message || 'Network error — is the server running?';
        errEl.style.display = 'block';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '▲ &nbsp;Connect Vercel';
    }
}

async function disconnectVercel() {
    try {
        await fetch('/auth/vercel/disconnect', { method: 'POST' });
        vercelReady = false;
        updateVercelBadge(false, null);
        showToast('Vercel disconnected.', 'info');
    } catch (_) {}
}

window.openVercelConnect   = openVercelConnect;
window.connectVercelToken  = connectVercelToken;
window.disconnectVercel    = disconnectVercel;

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info') {
    const existing = document.getElementById('toast');
    if (existing) existing.remove();

    const colors = {
        success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
        error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  text: '#f87171' },
        info:    { bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)', text: '#a5b4fc' }
    };
    const c = colors[type] || colors.info;

    const toast = document.createElement('div');
    toast.id = 'toast';
    Object.assign(toast.style, {
        position:     'fixed',
        bottom:       '24px',
        right:        '24px',
        background:   c.bg,
        border:       `1px solid ${c.border}`,
        color:        c.text,
        padding:      '12px 20px',
        borderRadius: '10px',
        fontSize:     '0.875rem',
        fontWeight:   '600',
        zIndex:       '9999',
        backdropFilter: 'blur(12px)',
        animation:    'fadeUp 0.3s ease'
    });
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

// ============================================================
// HANDLE ?vercel= URL PARAM (after OAuth redirect)
// ============================================================
function handleUrlParams() {
    // Clean up any leftover query params from previous OAuth attempts
    if (window.location.search) {
        window.history.replaceState({}, '', window.location.pathname);
    }
}

// ============================================================
// DEPLOY MODAL
// ============================================================
function openDeployModal() {
    if (!vercelReady) {
        openVercelConnect();
        return;
    }
    const modal = document.getElementById('deploy-modal');
    modal.classList.add('open');
    showInputView();
    const input = document.getElementById('repo-name-input');
    input.value = 'my-site-' + Date.now().toString().slice(-5);
    setTimeout(() => { input.focus(); input.select(); }, 80);
}

function closeDeployModal() {
    document.getElementById('deploy-modal').classList.remove('open');
}

function hideAllModalViews() {
    ['modal-noVercel-view', 'modal-input-view', 'modal-progress-view',
     'modal-success-view', 'modal-error-view'].forEach(id => {
        document.getElementById(id).style.display = 'none';
    });
}

function showInputView() {
    hideAllModalViews();
    document.getElementById('modal-input-view').style.display = 'block';
}

function showProgressView() {
    hideAllModalViews();
    document.getElementById('modal-progress-view').style.display = 'block';
    ['step-repo', 'step-push', 'step-vercel'].forEach(id => {
        const el = document.getElementById(id);
        el.className = 'p-step';
        el.querySelector('.p-step-icon').textContent = el.dataset.num || '●';
    });
    document.getElementById('step-repo').classList.add('active');
}

function advanceStep(doneId, nextId) {
    const done = document.getElementById(doneId);
    done.className = 'p-step done';
    done.querySelector('.p-step-icon').textContent = '✓';
    if (nextId) document.getElementById(nextId).classList.add('active');
}

async function startDeploy() {
    const repoName = document.getElementById('repo-name-input').value.trim();
    if (!repoName) {
        document.getElementById('repo-name-input').focus();
        return;
    }

    showProgressView();

    // Animate steps while the API call runs
    const t1 = setTimeout(() => advanceStep('step-repo', 'step-push'), 2500);
    const t2 = setTimeout(() => advanceStep('step-push', 'step-vercel'), 6000);

    try {
        const res = await fetch('/api/deploy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                html:     codeState.html,
                css:      codeState.css,
                js:       codeState.js,
                repoName
            })
        });

        clearTimeout(t1);
        clearTimeout(t2);
        const data = await res.json();

        if (data.success) {
            // Complete all steps
            ['step-repo', 'step-push', 'step-vercel'].forEach(id => {
                const el = document.getElementById(id);
                el.className = 'p-step done';
                el.querySelector('.p-step-icon').textContent = '✓';
            });

            await delay(350);
            hideAllModalViews();
            document.getElementById('modal-success-view').style.display = 'block';
            document.getElementById('success-msg').textContent = data.message || 'Your site is live!';

            const vLink = document.getElementById('vercel-link');
            const gLink = document.getElementById('github-link');
            if (data.vercelUrl) { vLink.href = data.vercelUrl; vLink.style.display = ''; }
            else { vLink.style.display = 'none'; }
            gLink.href = data.repoUrl || '#';

        } else if (data.needsVercel) {
            // Edge case: session expired
            clearTimeout(t1); clearTimeout(t2);
            vercelReady = false;
            hideAllModalViews();
            document.getElementById('modal-noVercel-view').style.display = 'block';

        } else {
            showError(data.error, data.details);
        }

    } catch (err) {
        clearTimeout(t1);
        clearTimeout(t2);
        showError('Network error', err.message);
    }
}

function showError(title, detail) {
    hideAllModalViews();
    document.getElementById('modal-error-view').style.display = 'block';
    document.getElementById('error-detail').textContent =
        [title, detail].filter(Boolean).join(' — ');
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// Close on backdrop click
document.getElementById('deploy-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeDeployModal();
});

// Keyboard shortcuts
document.getElementById('repo-name-input').addEventListener('keydown', e => {
    if (e.key === 'Enter')  startDeploy();
    if (e.key === 'Escape') closeDeployModal();
});
document.getElementById('vercel-token-input').addEventListener('keydown', e => {
    if (e.key === 'Enter')  connectVercelToken();
    if (e.key === 'Escape') closeDeployModal();
});

// Step numbers for reset
document.getElementById('step-repo' ).dataset.num = '1';
document.getElementById('step-push' ).dataset.num = '2';
document.getElementById('step-vercel').dataset.num = '3';

// Expose globals for HTML onclick
window.closeDeployModal = closeDeployModal;
window.startDeploy      = startDeploy;
window.showInputView    = showInputView;

// ============================================================
// INIT
// ============================================================
deployBtn.addEventListener('click', openDeployModal);

(async function init() {
    handleUrlParams();
    await loadUser();
    loadTemplate('basic');
    editor.value = codeState[currentTab];
})();
