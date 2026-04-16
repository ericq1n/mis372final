import express from 'express';
import * as jose from 'jose';

const router = express.Router();

// For testing: exchange authorization code for a test JWT
router.post('/token', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // In production, you would:
    // 1. Exchange the code with Asgardeo using client_id, client_secret
    // 2. Get the actual access token and ID token from Asgardeo
    // 3. Validate the ID token's signature
    // 4. Extract user info from the ID token

    // For now, create a test JWT that the backend will accept
    // WARNING: This is only for development/testing!
    const testUserId = 'test_user_' + code.substring(0, 8);
    
    // Create a simple test token (this won't validate with real Asgardeo JWKS)
    // For actual production, you need real tokens from Asgardeo
    const testToken = `test_jwt_${code}`;

    // For development, just return a token and userId that we can use
    // In production, this would be exchanged with Asgardeo's token endpoint
    res.json({
      access_token: testToken,
      token_type: 'Bearer',
      userId: testUserId,
      message: 'Development token - would exchange with Asgardeo in production',
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({
      error: 'Token exchange failed',
      detail: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
