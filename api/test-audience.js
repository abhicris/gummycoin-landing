// Test Resend Audience API endpoint
// Tests audience creation and contact addition


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

    // Only allow GET requests for testing
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const testEmail = req.query.email || 'test@example.com';
        const testName = req.query.name || 'Test User';

        // Debug information
        const debugInfo = {
            hasResendApiKey: !!process.env.RESEND_API_KEY,
            apiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
            apiKeyStartsWith: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 3) : 'none',
            testEmail: testEmail,
            testName: testName,
            timestamp: new Date().toISOString()
        };

        console.log('🔍 Audience Test Debug Info:', debugInfo);

        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            debugInfo.testResult = 'skipped';
            debugInfo.errorMessage = 'Resend API key not configured';
            
            return res.status(200).json({
                success: true,
                message: 'Resend API key not configured',
                debug: debugInfo
            });
        }

        // Test: Add contact to general audience using direct API call
        console.log('📧 Testing contact addition to general audience...');
        
        try {
            const response = await fetch(`https://api.resend.com/audiences/2259c518-4aa0-45d2-bf7b-c30c5516feed/contacts`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: testEmail,
                    first_name: testName || '',
                    last_name: '',
                    unsubscribed: false
                })
            });

            if (response.ok) {
                const result = await response.json();
                debugInfo.addContactResult = result;
                console.log('✅ Contact addition result:', result);
                debugInfo.testResult = 'success';
            } else {
                const error = await response.text();
                debugInfo.addContactError = error;
                console.log('⚠️ Contact addition error:', error);
                debugInfo.testResult = 'error';
            }
        } catch (error) {
            debugInfo.addContactError = error.message;
            console.log('⚠️ Contact addition error:', error.message);
            debugInfo.testResult = 'error';
        }

        res.status(200).json({
            success: true,
            message: 'Audience test completed',
            email: testEmail,
            debug: debugInfo
        });

    } catch (error) {
        console.error('❌ Error in audience test:', error);
        
        const debugInfo = {
            hasResendApiKey: !!process.env.RESEND_API_KEY,
            apiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
            apiKeyStartsWith: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 3) : 'none',
            testResult: 'error',
            errorMessage: error.message,
            timestamp: new Date().toISOString()
        };
        
        res.status(500).json({
            error: 'Failed to test audience',
            message: error.message,
            debug: debugInfo
        });
    }
}
