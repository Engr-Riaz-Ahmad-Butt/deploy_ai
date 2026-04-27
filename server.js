require('dotenv').config();
const express = require('express');
const axios = require('axios');
const session = require('express-session');

const app = express();

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }  // Set to true if using HTTPS
}));

// ========== SIMPLE STATIC WEBSITE TO DEPLOY ==========
const getSampleWebsite = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Deployed Website</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .card {
            background: white;
            border-radius: 20px;
            padding: 50px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            animation: fadeIn 0.5s ease;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        h1 {
            color: #667eea;
            font-size: 2rem;
            margin-bottom: 20px;
        }
        
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .badge {
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 50px;
            display: inline-block;
            font-size: 14px;
            margin-bottom: 20px;
        }
        
        button {
            background: #667eea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        button:hover {
            transform: scale(1.05);
        }
        
        .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">🚀 Deployed with Vercel</div>
        <h1>Success! 🎉</h1>
        <p>This website was generated and deployed automatically using:</p>
        <p>
            📦 GitHub API<br>
            🚀 Vercel API<br>
            🔐 GitHub OAuth
        </p>
        <button onclick="alert('Hello from your deployed website!')">Click Me</button>
        <div class="footer">
            Deployed at: <span id="time"></span>
        </div>
    </div>
    
    <script>
        document.getElementById('time').textContent = new Date().toLocaleString();
    </script>
</body>
</html>
`;

// ========== FRONTEND UI ==========
app.get('/', (req, res) => {
    const isGithubLoggedIn = !!req.session.githubToken;
    const isVercelLoggedIn = !!req.session.vercelToken;
    const githubUsername = req.session.githubUsername || '';

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>GitHub + Vercel One-Click</title>
            <style>
                :root {
                    --primary: #6366f1;
                    --bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: var(--bg-gradient);
                    min-height: 100vh;
                    margin: 0;
                    padding: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                
                .container { width: 100%; max-width: 500px; }
                
                .card {
                    background: white;
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    text-align: center;
                }
                
                h1 { color: #333; margin-bottom: 10px; }
                .subtitle { color: #666; margin-bottom: 30px; }
                
                .btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    width: 100%;
                    padding: 14px;
                    font-size: 16px;
                    font-weight: 600;
                    border: none;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-bottom: 12px;
                    text-decoration: none;
                }
                
                .btn-github { background: #24292e; color: white; }
                .btn-vercel { background: #000; color: white; }
                .btn-deploy { background: var(--primary); color: white; margin-top: 20px; }
                .btn-preview { background: #f1f5f9; color: #475569; }
                
                .btn:hover { transform: translateY(-2px); opacity: 0.9; }
                .btn:disabled { background: #ccc; cursor: not-allowed; transform: none; }
                
                .status-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 15px;
                }
                .status-connected { background: #dcfce7; color: #166534; }
                .status-pending { background: #fef2f2; color: #991b1b; }
                
                .form-group { text-align: left; margin-bottom: 20px; }
                label { font-weight: 600; color: #333; display: block; margin-bottom: 8px; }
                
                input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e1e4e8;
                    border-radius: 8px;
                    font-size: 16px;
                    box-sizing: border-box;
                }
                
                .preview-box {
                    display: none;
                    height: 300px;
                    border: 2px solid #eee;
                    border-radius: 12px;
                    margin-bottom: 20px;
                    overflow: hidden;
                }
                
                iframe { width: 100%; height: 100%; border: none; }
                
                .status-msg { margin-top: 20px; padding: 15px; border-radius: 10px; font-size: 14px; text-align: left; }
                .status-info { background: #eff6ff; color: #1e40af; }
                .status-success { background: #f0fdf4; color: #166534; }
                .status-error { background: #fef2f2; color: #991b1b; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <h1>🚀 Multi-User Deploy</h1>
                    <p class="subtitle">Connect accounts to deploy your sites</p>
                    
                    <!-- GitHub Connection -->
                    ${isGithubLoggedIn ? `
                        <div class="status-badge status-connected">✅ GitHub: ${githubUsername}</div>
                    ` : `
                        <a href="/auth/github" class="btn btn-github">🔐 Connect GitHub</a>
                    `}
                    
                    <!-- Vercel Connection -->
                    ${isVercelLoggedIn ? `
                        <div class="status-badge status-connected">✅ Vercel: Connected</div>
                    ` : `
                        <a href="/auth/vercel" class="btn btn-vercel">▲ Connect Vercel</a>
                    `}
                    
                    ${isGithubLoggedIn && isVercelLoggedIn ? `
                        <div style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 25px;">
                            <div class="form-group">
                                <label>Project Name (Repository):</label>
                                <input type="text" id="repoName" value="site-${Date.now()}">
                            </div>
                            
                            <button class="btn btn-preview" onclick="togglePreview()">🌐 Preview Template</button>
                            
                            <div id="previewBox" class="preview-box">
                                <iframe srcdoc="${getSampleWebsite().replace(/"/g, '&quot;')}"></iframe>
                            </div>
                            
                            <button id="deployBtn" class="btn btn-deploy" onclick="deploy()">🚀 Deploy to Your Vercel</button>
                        </div>
                    ` : `
                        <p style="color: #666; font-size: 14px; margin-top: 20px;">Please connect both accounts to enable deployment.</p>
                    `}
                    
                    <div id="result"></div>
                    
                    ${isGithubLoggedIn || isVercelLoggedIn ? `
                        <div style="margin-top: 30px;">
                            <a href="/auth/logout" style="color: #999; font-size: 13px; text-decoration: none;">Logout and clear session</a>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <script>
                function togglePreview() {
                    const box = document.getElementById('previewBox');
                    box.style.display = box.style.display === 'block' ? 'none' : 'block';
                }

                async function deploy() {
                    const repoName = document.getElementById('repoName').value;
                    const deployBtn = document.getElementById('deployBtn');
                    const resultDiv = document.getElementById('result');
                    
                    if (!repoName.trim()) return alert('Enter project name');
                    
                    deployBtn.disabled = true;
                    deployBtn.textContent = '⏳ Deploying...';
                    resultDiv.innerHTML = '<div class="status-msg status-info">1. Creating GitHub Repo...<br>2. Pushing files...<br>3. Deploying to Vercel...</div>';
                    
                    try {
                        const response = await fetch('/api/deploy', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ repoName: repoName.trim() })
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok) {
                            resultDiv.innerHTML = \`
                                <div class="status-msg status-success">
                                    <strong>✅ Successfully Deployed!</strong><br><br>
                                    <a href="\${data.vercelUrl}" target="_blank">🌐 Open Live Website</a><br>
                                    <a href="\${data.repoUrl}" target="_blank">📦 Open GitHub Repo</a><br><br>
                                    <small>It may take a minute for the content to appear.</small>
                                </div>
                            \`;
                        } else {
                            resultDiv.innerHTML = \`<div class="status-msg status-error">❌ Error: \${data.error}<br>\${data.details || ''}</div>\`;
                        }
                    } catch (err) {
                        resultDiv.innerHTML = \`<div class="status-msg status-error">❌ Network Error: \${err.message}</div>\`;
                    } finally {
                        deployBtn.disabled = false;
                        deployBtn.textContent = '🚀 Deploy to Your Vercel';
                    }
                }
            </script>
        </body>
        </html>
    `);
});

// ========== GITHUB OAUTH ROUTES ==========

app.get('/auth/github', (req, res) => {
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=repo`;
    res.redirect(githubAuthUrl);
});

app.get('/auth/github/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.redirect('/');

    try {
        const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: code
        }, { headers: { Accept: 'application/json' } });

        const accessToken = tokenResponse.data.access_token;
        const userResponse = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        req.session.githubToken = accessToken;
        req.session.githubUsername = userResponse.data.login;
        res.redirect('/');
    } catch (error) {
        res.send('GitHub Auth failed. <a href="/">Try again</a>');
    }
});

app.get('/debug-env', (req, res) => {
    res.json({
        VERCEL_CLIENT_ID: process.env.VERCEL_CLIENT_ID,
        VERCEL_CLIENT_ID_prefix: process.env.VERCEL_CLIENT_ID?.substring(0, 6),
        VERCEL_CLIENT_SECRET_exists: !!process.env.VERCEL_CLIENT_SECRET,
        VERCEL_REDIRECT_URI: process.env.VERCEL_REDIRECT_URI,
        dotenv_loaded: !!process.env.SESSION_SECRET
    });
});

app.get('/auth/vercel/debug', (req, res) => {
    const clientId = process.env.VERCEL_CLIENT_ID;
    const redirectUri = process.env.VERCEL_REDIRECT_URI;
    const authUrl = `https://vercel.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    res.send(`
        <h3>Debug Info</h3>
        <p><b>Client ID:</b> ${clientId}</p>
        <p><b>Redirect URI:</b> ${redirectUri}</p>
        <p><b>Full Auth URL:</b> <a href="${authUrl}">${authUrl}</a></p>
        <p><a href="${authUrl}">Click to test OAuth</a></p>
    `);
});

// ========== VERCEL OAUTH ROUTES ==========

// ========== VERCEL OAUTH ROUTES (FIXED FOR INTEGRATION) ==========

app.get('/auth/vercel', (req, res) => {
    const clientId = process.env.VERCEL_CLIENT_ID;
    const redirectUri = process.env.VERCEL_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
        return res.status(500).send(`
            <h3>Configuration Error</h3>
            <p>Missing Vercel OAuth configuration in .env file.</p>
            <p>VERCEL_CLIENT_ID: ${clientId ? '✅' : '❌'}</p>
            <p>VERCEL_REDIRECT_URI: ${redirectUri ? '✅' : '❌'}</p>
            <a href="/">Go Back</a>
        `);
    }
    
    // CORRECT Vercel OAuth URL format
    const authUrl = `https://vercel.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code`;
    
    console.log('Redirecting to:', authUrl);
    res.redirect(authUrl);
});

app.get('/auth/vercel/callback', async (req, res) => {
    const { code, error, error_description } = req.query;

    if (error) {
        console.error('Vercel OAuth Error:', error, error_description);
        return res.send(`<h3>Vercel Auth Error</h3><p>${error_description || error}</p><a href="/">Try again</a>`);
    }

    if (!code) {
        return res.redirect('/');
    }

    try {
        const clientId = process.env.VERCEL_CLIENT_ID?.trim();
        const clientSecret = process.env.VERCEL_CLIENT_SECRET?.trim();
        const redirectUri = process.env.VERCEL_REDIRECT_URI?.trim();

        console.log('Exchanging token for client_id:', clientId);

        const payload = new URLSearchParams();
        payload.append('client_id', clientId);
        payload.append('client_secret', clientSecret);
        payload.append('code', code);
        payload.append('redirect_uri', redirectUri);
        payload.append('grant_type', 'authorization_code');
        
        console.log('Sending payload:', {
            client_id: clientId,
            client_secret: clientSecret ? clientSecret.substring(0, 5) + '...' : 'UNDEFINED',
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
        });

        const tokenResponse = await axios.post('https://api.vercel.com/v2/oauth/access_token', payload, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        req.session.vercelToken = tokenResponse.data.access_token;
        req.session.vercelUserId = tokenResponse.data.user_id;
        req.session.vercelConnected = true;

        console.log('✅ Vercel connected successfully for user:', tokenResponse.data.user_id);
        res.redirect('/');
    } catch (error) {
        const errorData = error.response?.data || {};
        console.error('Vercel Token Error Full Payload:', errorData);
        res.send(`
            <h3>Vercel Authentication Failed</h3>
            <p><strong>Error Type:</strong> ${errorData.error || error.message}</p>
            <p><strong>Description:</strong> ${errorData.error_description || 'No description provided'}</p>
            <p><strong>Full Response:</strong></p>
            <pre>${JSON.stringify(errorData, null, 2)}</pre>
            <a href="/">Try Again</a>
        `);
    }
});

app.get('/auth/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// ========== DEPLOYMENT API ==========

app.post('/api/deploy', async (req, res) => {
    const { repoName, websiteCode } = req.body;

    if (!req.session.githubToken) {
        return res.status(401).json({ error: 'GitHub not connected' });
    }
    if (!req.session.vercelToken) {
        return res.status(401).json({ error: 'Vercel not connected' });
    }

    const finalWebsiteCode = websiteCode || getSampleWebsite();
    const sanitizedName = repoName.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    try {
        // 1. Create GitHub repo (using user's GitHub token)
        const repoResponse = await axios.post('https://api.github.com/user/repos', {
            name: sanitizedName,
            auto_init: false
        }, { headers: { Authorization: `Bearer ${req.session.githubToken}` } });

        const repoFullName = repoResponse.data.full_name;
        const repoUrl = repoResponse.data.html_url;

        // 2. Push file to GitHub
        await axios.put(`https://api.github.com/repos/${repoFullName}/contents/index.html`, {
            message: 'Initial deploy via Vercel Integration',
            content: Buffer.from(finalWebsiteCode).toString('base64'),
            branch: 'main'
        }, { headers: { Authorization: `Bearer ${req.session.githubToken}` } });

        // 3. Deploy to Vercel (using user's Vercel token from OAuth)
        const vercelResponse = await axios.post('https://api.vercel.com/v13/deployments', {
            name: sanitizedName,
            files: [
                {
                    file: 'index.html',
                    data: finalWebsiteCode
                }
            ],
            projectSettings: { framework: null },
            target: 'production'
        }, {
            headers: {
                Authorization: `Bearer ${req.session.vercelToken}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`✅ Deployed to user's Vercel account: https://${vercelResponse.data.url}`);

        res.json({
            success: true,
            repoUrl: repoUrl,
            vercelUrl: `https://${vercelResponse.data.url}`
        });

    } catch (error) {
        console.error('Deploy error:', error.response?.data || error.message);
        res.status(500).json({
            error: 'Deployment failed',
            details: error.response?.data?.error?.message || error.message
        });
    }
});

// ========== HEALTH CHECK ==========
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        config: {
            github: !!process.env.GITHUB_CLIENT_ID,
            vercel: !!process.env.VERCEL_API_TOKEN
        }
    });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════╗
    ║     🚀 GitHub + Vercel Demo Server              ║
    ║                                                  ║
    ║     Server running at: http://localhost:${PORT}   ║
    ║                                                  ║
    ║     Make sure your .env file is configured!     ║
    ╚══════════════════════════════════════════════════╝
    `);
});