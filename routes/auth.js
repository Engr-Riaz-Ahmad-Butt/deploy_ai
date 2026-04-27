const express = require('express');
const axios   = require('axios');
const router  = express.Router();

const GITHUB_CLIENT_ID     = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const GITHUB_CALLBACK_URL  = process.env.GITHUB_CALLBACK_URL
    || 'http://localhost:3000/auth/github/callback';


// ════════════════════════════════════════════════════════════
//  GITHUB OAuth
// ════════════════════════════════════════════════════════════

router.get('/github', (req, res) => {
    const params = new URLSearchParams({
        client_id:    GITHUB_CLIENT_ID,
        redirect_uri: GITHUB_CALLBACK_URL,
        scope:        'repo,user'
    });
    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/github/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) return res.status(400).send('No code provided');

    try {
        const tokenRes = await axios.post(
            'https://github.com/login/oauth/access_token',
            {
                client_id:     GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
                redirect_uri:  GITHUB_CALLBACK_URL
            },
            { headers: { Accept: 'application/json' } }
        );

        const accessToken = tokenRes.data.access_token;
        if (!accessToken) return res.status(401).send('GitHub authentication failed');

        req.session.githubToken = accessToken;

        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });

        req.session.githubUsername = userRes.data.login;
        req.session.githubUserId   = userRes.data.id;
        req.session.githubAvatar   = userRes.data.avatar_url;
        res.redirect('/dashboard');
    } catch (err) {
        console.error('GitHub auth error:', err.response?.data || err.message);
        res.status(500).send('GitHub authentication error. <a href="/">Try again</a>');
    }
});


// ════════════════════════════════════════════════════════════
//  VERCEL — Personal Access Token
//
//  Vercel Marketplace Integrations require publishing/review
//  before the OAuth flow works. Instead we validate the user's
//  personal token directly — same result, zero friction.
//
//  User creates token at: https://vercel.com/account/tokens
// ════════════════════════════════════════════════════════════

router.post('/vercel/token', async (req, res) => {
    const { token } = req.body;
    if (!token || !token.trim()) {
        return res.status(400).json({ error: 'Token is required' });
    }

    try {
        // Validate the token against Vercel's API
        const userRes = await axios.get('https://api.vercel.com/v2/user', {
            headers: { Authorization: `Bearer ${token.trim()}` }
        });

        // Token is valid — store in session
        req.session.vercelToken    = token.trim();
        req.session.vercelUsername = userRes.data.user?.username || userRes.data.user?.name;
        req.session.vercelEmail    = userRes.data.user?.email;

        res.json({
            success:  true,
            username: req.session.vercelUsername,
            email:    req.session.vercelEmail
        });
    } catch (err) {
        const status = err.response?.status;
        if (status === 401 || status === 403) {
            return res.status(401).json({ error: 'Invalid token. Please check and try again.' });
        }
        console.error('Vercel token validation error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Could not verify token. Try again.' });
    }
});

router.post('/vercel/disconnect', (req, res) => {
    delete req.session.vercelToken;
    delete req.session.vercelUsername;
    delete req.session.vercelEmail;
    res.json({ success: true });
});


// ════════════════════════════════════════════════════════════
//  LOGOUT
// ════════════════════════════════════════════════════════════

router.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
