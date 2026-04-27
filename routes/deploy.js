const express = require('express');
const axios   = require('axios');
const router  = express.Router();


// ════════════════════════════════════════════════════════════
//  POST /api/deploy
//  Deploys to the LOGGED-IN USER'S Vercel account via their
//  OAuth token — not the server's own token.
//  Uses file-based deployment (no GitHub→Vercel link needed).
// ════════════════════════════════════════════════════════════

router.post('/deploy', async (req, res) => {
    const { html, css, js, repoName } = req.body;

    const githubToken = req.session.githubToken;
    const vercelToken = req.session.vercelToken;   // user's OAuth token
    const username    = req.session.githubUsername;

    // ── Auth guards ────────────────────────────────────────
    if (!githubToken || !username) {
        return res.status(401).json({ error: 'Not authenticated with GitHub' });
    }
    if (!vercelToken) {
        return res.status(401).json({
            error:       'Vercel account not connected',
            needsVercel: true
        });
    }

    // ── Sanitize repo name ─────────────────────────────────
    const safeName = (repoName || 'site-' + Date.now())
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

    try {
        // ── 1. Create GitHub repository ──────────────────────
        console.log(`Creating GitHub repo: ${safeName} for @${username}`);

        let repoRes;
        try {
            repoRes = await axios.post(
                'https://api.github.com/user/repos',
                {
                    name:        safeName,
                    description: 'Deployed via Deploy.io',
                    private:     false,
                    auto_init:   false
                },
                {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept:        'application/vnd.github.v3+json'
                    }
                }
            );
        } catch (repoErr) {
            if (repoErr.response?.status === 422) {
                return res.status(400).json({
                    error:   'Repository already exists',
                    details: `A repo named "${safeName}" already exists in your GitHub account. Choose a different name.`
                });
            }
            throw repoErr;
        }

        const repoFullName = repoRes.data.full_name;
        const repoUrl      = repoRes.data.html_url;

        // ── 2. Push files to GitHub ──────────────────────────
        const githubFiles = [
            { path: 'index.html', content: html },
            { path: 'style.css',  content: css  },
            { path: 'script.js',  content: js   }
        ];

        for (const file of githubFiles) {
            if (!file.content) continue;
            await axios.put(
                `https://api.github.com/repos/${repoFullName}/contents/${file.path}`,
                {
                    message: `Add ${file.path}`,
                    content: Buffer.from(file.content).toString('base64'),
                    branch:  'main'
                },
                {
                    headers: {
                        Authorization: `Bearer ${githubToken}`,
                        Accept:        'application/vnd.github.v3+json'
                    }
                }
            );
        }

        // ── 3. File-based Vercel deployment ──────────────────
        //  File-based avoids needing a GitHub↔Vercel account link.
        //  We send files directly; Vercel hosts them on the edge.
        console.log(`Deploying to user's Vercel account (file-based)…`);

        const vercelFiles = [];
        if (html) vercelFiles.push({ file: 'index.html', data: html });
        if (css)  vercelFiles.push({ file: 'style.css',  data: css  });
        if (js)   vercelFiles.push({ file: 'script.js',  data: js   });

        const vercelRes = await axios.post(
            'https://api.vercel.com/v13/deployments',
            {
                name:            safeName,
                files:           vercelFiles,
                projectSettings: { framework: null },
                target:          'production'
            },
            {
                headers: {
                    Authorization:  `Bearer ${vercelToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const deployedUrl = `https://${vercelRes.data.url}`;
        console.log(`Deployed to: ${deployedUrl}`);

        res.json({
            success:    true,
            message:    'Deployed to your Vercel account!',
            repoUrl,
            vercelUrl:  deployedUrl,
            projectId:  vercelRes.data.projectId
        });

    } catch (err) {
        const detail = err.response?.data?.error?.message
            || err.response?.data?.message
            || err.message;
        console.error('Deploy error:', err.response?.data || err.message);
        res.status(500).json({ error: 'Deployment failed', details: detail });
    }
});


// ════════════════════════════════════════════════════════════
//  GET /api/user
//  Returns session state so the frontend knows what's connected.
// ════════════════════════════════════════════════════════════

router.get('/user', (req, res) => {
    if (!req.session.githubToken) {
        return res.json({ loggedIn: false });
    }
    res.json({
        loggedIn:        true,
        username:        req.session.githubUsername,
        userId:          req.session.githubUserId,
        avatarUrl:       req.session.githubAvatar,
        vercelConnected: !!req.session.vercelToken,
        vercelUsername:  req.session.vercelUsername || null
    });
});

module.exports = router;
