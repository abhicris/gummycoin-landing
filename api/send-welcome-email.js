// Automated Welcome Email API
// Sends welcome emails when users sign up and adds to audience

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to add contact to Resend audience
async function addToResendAudience(email, name = '') {
    try {
        console.log('📧 Adding to Resend audience:', email);
        
        // Use direct API call as shown in the curl example
        const response = await fetch(`https://api.resend.com/audiences/2259c518-4aa0-45d2-bf7b-c30c5516feed/contacts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                first_name: name || '',
                last_name: '',
                unsubscribed: false
            })
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Added to Resend audience:', result);
            return { success: true, result };
        } else {
            const error = await response.text();
            console.log('⚠️ Audience add response:', response.status, error);
            return { success: false, error: error };
        }
    } catch (error) {
        console.log('❌ Error adding to audience:', error.message);
        return { success: false, error: error.message };
    }
}

// Welcome email template
const createWelcomeEmail = (email, name = '') => {
    const firstName = name ? name.split(' ')[0] : 'there';
    
    return {
        from: 'Gummy Team <hello@gummyco.in>',
        to: email,
        subject: 'Welcome to GummyCoin! 🍬 Your journey starts here',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to GummyCoin!</title>
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
                    .welcome-text {
                        font-size: 24px;
                        font-weight: 600;
                        color: #2D3748;
                        margin-bottom: 20px;
                    }
                    .content {
                        font-size: 16px;
                        color: #4A5568;
                        margin-bottom: 30px;
                    }
                    .cta-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%);
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: 600;
                        font-size: 16px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .features {
                        background: #F7FAFC;
                        padding: 25px;
                        border-radius: 8px;
                        margin: 25px 0;
                    }
                    .feature {
                        margin: 15px 0;
                        padding-left: 20px;
                        position: relative;
                    }
                    .feature:before {
                        content: "🍬";
                        position: absolute;
                        left: 0;
                    }
                    .links-section {
                        background: #FFF5F7;
                        padding: 25px;
                        border-radius: 8px;
                        margin: 25px 0;
                        border-left: 4px solid #FF6B9D;
                    }
                    .link-item {
                        margin: 12px 0;
                        padding: 8px 0;
                    }
                    .link-item a {
                        color: #FF6B9D;
                        text-decoration: none;
                        font-weight: 500;
                    }
                    .link-item a:hover {
                        text-decoration: underline;
                    }
                    .link-label {
                        font-weight: 600;
                        color: #2D3748;
                        margin-right: 8px;
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
                        <div class="logo">🍬 GummyCoin</div>
                        <div class="welcome-text">Welcome, ${firstName}! 🎉</div>
                    </div>
                    
                    <div class="content">
                        <p>Thank you for joining the GummyCoin community! You're now part of the biggest gummy project backed by gummy market OGs and the crypto community.</p>
                        
                        <p>You're among the first to experience the future of wellness where community meets innovation. Here's what's coming:</p>
                        
                        <div class="features">
                            <div class="feature">Early access to the Gummy app beta</div>
                            <div class="feature">Exclusive access to Gummy store and events</div>
                            <div class="feature">Opportunities to co-create gummy brands</div>
                            <div class="feature">Community-driven wellness ecosystem</div>
                        </div>
                        
                        <p>We'll keep you updated on our progress and let you know as soon as the app is ready for you to try!</p>
                    </div>
                    
                    <div style="text-align: center;">
                        <a href="https://gummyco.in" class="cta-button">Visit Our Website</a>
                    </div>
                    
                    <div class="links-section">
                        <h3 style="margin-top: 0; color: #2D3748;">🔗 Core Links</h3>
                        <div class="link-item">
                            <span class="link-label">🐦 Twitter:</span>
                            <a href="https://x.com/gummycollective" target="_blank">x.com/gummycollective</a>
                        </div>
                        <div class="link-item">
                            <span class="link-label">📊 Believe:</span>
                            <a href="https://believe.app/coin/gum" target="_blank">believe.app/coin/gum</a>
                        </div>
                        <div class="link-item">
                            <span class="link-label">👻 Phantom:</span>
                            <a href="https://phantom.com/tokens/solana/GFbDLnZFNwbcjytnkfEzLf2hy6raLfQtj2Qtevg2kBLV" target="_blank">phantom.com/tokens/solana/GUM</a>
                        </div>
                        <div class="link-item">
                            <span class="link-label">🚀 Jupiter:</span>
                            <a href="https://jup.ag/tokens/GFbDLnZFNwbcjytnkfEzLf2hy6raLfQtj2Qtevg2kBLV" target="_blank">jup.ag/tokens/GUM</a>
                        </div>
                        <div class="link-item">
                            <span class="link-label">📈 DexScreener:</span>
                            <a href="https://dexscreener.com/solana/GFbDLnZFNwbcjytnkfEzLf2hy6raLfQtj2Qtevg2kBLV" target="_blank">dexscreener.com/solana/GUM</a>
                        </div>
                        <div class="link-item">
                            <span class="link-label">🔗 Solscan:</span>
                            <a href="https://solscan.io/token/GFbDLnZFNwbcjytnkfEzLf2hy6raLfQtj2Qtevg2kBLV" target="_blank">solscan.io/token/GUM</a>
                        </div>
                        <div class="link-item">
                            <span class="link-label">🌐 Website:</span>
                            <a href="https://gummyco.in" target="_blank">gummyco.in</a>
                        </div>
                        <div class="link-item">
                            <span class="link-label">📩 Support:</span>
                            <a href="mailto:support@gummyco.in">support@gummyco.in</a>
                        </div>
                        <div class="link-item">
                            <span class="link-label">✅ Contract:</span>
                            <span style="font-family: monospace; background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">GFbDLnZFNwbcjytnkfEzLf2hy6raLfQtj2Qtevg2kBLV</span>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent to ${email}</p>
                        <p><strong>💬 Questions? Contact us at support@gummyco.in</strong></p>
                        <p>If you didn't sign up for GummyCoin, you can safely ignore this email.</p>
                        <p>© 2024 GummyCoin by GummyCollective. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
};

// Main handler function
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

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, name = '', source = 'landing-page' } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Check if Resend API key is configured
        if (!process.env.RESEND_API_KEY) {
            console.log('📧 Resend API key not configured, skipping email send');
            return res.status(200).json({
                success: true,
                message: 'Email service not configured',
                email: email,
                sent: false
            });
        }

        // Create and send welcome email
        const emailData = createWelcomeEmail(email, name);
        
        console.log('📧 Sending welcome email to:', email);
        
        const result = await resend.emails.send(emailData);
        
        console.log('✅ Welcome email sent successfully:', result);
        
        // Add to Resend audience (non-blocking)
        let audienceResult = { success: false };
        try {
            audienceResult = await addToResendAudience(email, name);
        } catch (audienceError) {
            console.log('📧 Audience add error (non-critical):', audienceError.message);
        }
        
        res.status(200).json({
            success: true,
            message: 'Welcome email sent successfully',
            email: email,
            sent: true,
            messageId: result.data?.id,
            audienceAdded: audienceResult.success
        });

    } catch (error) {
        console.error('❌ Error sending welcome email:', error);
        
        res.status(500).json({
            error: 'Failed to send welcome email',
            message: error.message,
            email: req.body?.email
        });
    }
}
