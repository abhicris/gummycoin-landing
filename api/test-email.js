// Test Email API endpoint
// Tests the welcome email functionality

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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

        console.log('🔍 Email Test Debug Info:', debugInfo);

        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            debugInfo.testResult = 'skipped';
            debugInfo.errorMessage = 'Resend API key not configured';
            
            return res.status(200).json({
                success: true,
                message: 'Email service not configured',
                debug: debugInfo
            });
        }

        // Test email template
        const emailData = {
            from: 'Gummy Team <hello@gummyco.in>',
            to: testEmail,
            subject: '🧪 Test Email from Gummy',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Test Email</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f8f9fa;
                        }
                        .container {
                            background: white;
                            border-radius: 12px;
                            padding: 40px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                        }
                        .logo {
                            font-size: 32px;
                            font-weight: bold;
                            color: #FF6B9D;
                            margin-bottom: 10px;
                        }
                        .test-badge {
                            background: #FF6B9D;
                            color: white;
                            padding: 5px 15px;
                            border-radius: 20px;
                            font-size: 12px;
                            font-weight: bold;
                            display: inline-block;
                            margin-bottom: 20px;
                        }
                        .content {
                            font-size: 16px;
                            color: #4A5568;
                            margin-bottom: 30px;
                        }
                        .success {
                            background: #C6F6D5;
                            border: 1px solid #9AE6B4;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 20px 0;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 40px;
                            padding-top: 20px;
                            border-top: 1px solid #E2E8F0;
                            color: #718096;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="logo">🍬 Gummy</div>
                            <div class="test-badge">TEST EMAIL</div>
                            <h2>Email System Test</h2>
                        </div>
                        
                        <div class="content">
                            <p>Hello ${testName}!</p>
                            
                            <p>This is a test email to verify that the Gummy automated email system is working correctly.</p>
                            
                            <div class="success">
                                <strong>✅ Success!</strong> If you're receiving this email, it means:
                                <ul>
                                    <li>Resend API is properly configured</li>
                                    <li>Email templates are working</li>
                                    <li>Welcome emails will be sent to new signups</li>
                                </ul>
                            </div>
                            
                            <p><strong>Test Details:</strong></p>
                            <ul>
                                <li><strong>Email:</strong> ${testEmail}</li>
                                <li><strong>Name:</strong> ${testName}</li>
                                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                                <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
                            </ul>
                        </div>
                        
                        <div class="footer">
                            <p>This is a test email from the Gummy automated email system.</p>
                            <p>© 2024 Gummy. All rights reserved.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        console.log('📧 Sending test email to:', testEmail);
        
        const result = await resend.emails.send(emailData);
        
        console.log('✅ Test email sent successfully:', result);
        
        debugInfo.testResult = 'success';
        debugInfo.messageId = result.data?.id;
        
        res.status(200).json({
            success: true,
            message: 'Test email sent successfully',
            email: testEmail,
            messageId: result.data?.id,
            debug: debugInfo
        });

    } catch (error) {
        console.error('❌ Error sending test email:', error);
        
        const debugInfo = {
            hasResendApiKey: !!process.env.RESEND_API_KEY,
            apiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
            apiKeyStartsWith: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 3) : 'none',
            testResult: 'error',
            errorMessage: error.message,
            timestamp: new Date().toISOString()
        };
        
        res.status(500).json({
            error: 'Failed to send test email',
            message: error.message,
            debug: debugInfo
        });
    }
}
