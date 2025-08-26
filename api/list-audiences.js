// List Resend Audiences API endpoint
// Lists all audiences in your Resend account

import { Resend } from 'resend';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            return res.status(200).json({
                success: false,
                message: 'Resend API key not configured'
            });
        }

        const resend = new Resend(process.env.RESEND_API_KEY);
        
        console.log('📧 Listing Resend audiences...');
        
        const result = await resend.audiences.list();
        
        console.log('✅ Audiences list result:', result);
        
        res.status(200).json({
            success: true,
            message: 'Audiences listed successfully',
            audiences: result.data,
            debug: {
                hasResendApiKey: true,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Error listing audiences:', error);
        
        res.status(500).json({
            error: 'Failed to list audiences',
            message: error.message,
            debug: {
                hasResendApiKey: !!process.env.RESEND_API_KEY,
                timestamp: new Date().toISOString()
            }
        });
    }
}

