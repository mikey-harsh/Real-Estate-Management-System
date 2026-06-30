import express from 'express';
import rateLimit from 'express-rate-limit';
import { searchProperties, getLocationTrends, createUserListing, getUserListings, updateUserListing, deleteUserListing, getCacheStats } from '../controller/propertyController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/multer.js';
import { createDistributedRateLimiter } from '../utils/distributedRateLimiter.js';

const router = express.Router();

// ── AI-specific distributed rate limiter (works across multiple instances) ────
// Each AI call costs real Firecrawl + GitHub Models quota, so cap per IP/hour.
// Uses filesystem-based storage to work across multiple server instances.
const distributedLimiter = createDistributedRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10,                   // max 10 AI searches per IP per hour
    keyGenerator: (req) => {
        // Respect Render/Vercel proxy header
        const forwarded = req.headers['x-forwarded-for'];
        return forwarded ? forwarded.split(',')[0].trim() : req.ip;
    },
    message: {
        success: false,
        message: 'AI search limit reached (10 searches per hour). Please try again later.',
        error: 'RATE_LIMIT_EXCEEDED',
    },
    storePath: process.env.RATE_LIMIT_STORE_PATH || './.rate-limit-store'
});

const aiLimiter = distributedLimiter.createMiddleware();

router.post('/properties/search', aiLimiter, searchProperties);
router.get('/properties/trends/:city', aiLimiter, getLocationTrends);

router.post('/properties/validate-keys', (req, res) => {
    const githubKey = req.headers['x-github-key']?.trim() || process.env.GITHUB_MODELS_API_KEY?.trim();
    const firecrawlKey = req.headers['x-firecrawl-key']?.trim() || process.env.FIRECRAWL_API_KEY?.trim();
    if (!githubKey || !firecrawlKey) {
        return res.status(403).json({ success: false, message: 'Both API keys are required.', error: 'KEYS_REQUIRED' });
    }
    if (!githubKey.startsWith('ghp_') && !githubKey.startsWith('github_pat_')) {
        return res.status(403).json({ success: false, message: 'GitHub key format is invalid.', error: 'KEYS_INVALID' });
    }
    if (!firecrawlKey.startsWith('fc-')) {
        return res.status(403).json({ success: false, message: 'Firecrawl key format is invalid.', error: 'KEYS_INVALID' });
    }
    res.json({ success: true, message: 'Keys validated successfully.' });
});

// ── User listing routes (auth required) ──────────────────────────────────────
router.post('/user/properties', protect, upload.array('images', 4), createUserListing);
router.get('/user/properties', protect, getUserListings);
router.put('/user/properties/:id', protect, upload.array('images', 4), updateUserListing);
router.delete('/user/properties/:id', protect, deleteUserListing);

// ── Rate limiter stats (for monitoring) ──────────────────────────────────────
router.get('/rate-limit/stats', async (req, res) => {
    try {
        const stats = await distributedLimiter.getStats();
        res.json({
            success: true,
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching rate limit stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch rate limit statistics',
            error: error.message
        });
    }
});

// ── Cache stats (for monitoring MongoDB cache) ──────────────────────────────
router.get('/cache/stats', async (req, res) => {
    try {
        const stats = await getCacheStats();
        res.json({
            success: true,
            ...stats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching cache stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch cache statistics',
            error: error.message
        });
    }
});

export default router;