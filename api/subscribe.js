// Vercel Serverless Function for Email Subscription
// Using Airtable as a simple, free database

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'your_airtable_api_key';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'your_base_id';
const AIRTABLE_TABLE_NAME = 'Emails';

// Function to add email to Airtable
async function addToAirtable(data) {
    try {
        console.log('📧 Preparing Airtable request with data:', {
            email: data.email,
            source: data.source,
            name: data.name,
            interest: data.interest,
            baseId: AIRTABLE_BASE_ID ? AIRTABLE_BASE_ID.substring(0, 8) + '...' : 'none',
            tableName: AIRTABLE_TABLE_NAME
        });

        const requestBody = {
            fields: {
                'Email': data.email,
                'Source': data.source,
                'Name': data.name || '', // Include empty string if no name
                'Interest': data.interest,
                'Subscribed At': data.subscribedAt,
                'IP Address': data.ip
            }
        };

        console.log('📧 Request body:', JSON.stringify(requestBody, null, 2));

        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('📧 Airtable response status:', response.status);
        console.log('📧 Airtable response headers:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Airtable save successful:', result);
            return { success: true, method: 'airtable', recordId: result.id };
        } else {
            const error = await response.text();
            console.error('❌ Airtable API error:', response.status, error);
            return { success: false, error: `Airtable API error: ${response.status} - ${error}` };
        }
    } catch (error) {
        console.error('Airtable request error:', error);
        return { success: false, error: error.message };
    }
}

// Fallback function for when Airtable is not configured
async function storeInMemory(data) {
    console.log('📧 Email to be stored (no database configured):', data);
    return { success: true, method: 'memory-log' };
}

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

    // Only allow POST requests for subscription
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, source = 'landing-page', name = '', interest = 'early-access' } = req.body;

        // Validate email
        if (!email || !email.includes('@')) {
            return res.status(400).json({ error: 'Valid email is required' });
        }

        // Prepare email data with defaults for missing fields
        const emailData = {
            email: email.toLowerCase().trim(),
            source: source || 'landing-page',
            name: name || '', // Leave blank if not provided
            interest: interest || 'early-access',
            subscribedAt: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD for Airtable
            ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown'
        };

        // Try to store the email (Airtable if configured, otherwise memory)
        let storageResult;
        
        // Debug: Log the environment variables (without exposing full values)
        console.log('🔍 Environment check:', {
            hasApiKey: !!AIRTABLE_API_KEY,
            hasBaseId: !!AIRTABLE_BASE_ID,
            apiKeyLength: AIRTABLE_API_KEY ? AIRTABLE_API_KEY.length : 0,
            baseIdLength: AIRTABLE_BASE_ID ? AIRTABLE_BASE_ID.length : 0,
            apiKeyStartsWith: AIRTABLE_API_KEY ? AIRTABLE_API_KEY.substring(0, 4) : 'none',
            baseIdStartsWith: AIRTABLE_BASE_ID ? AIRTABLE_BASE_ID.substring(0, 4) : 'none'
        });
        
        if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID && 
            AIRTABLE_API_KEY !== 'your_airtable_api_key' && 
            AIRTABLE_BASE_ID !== 'your_base_id') {
            console.log('📧 Attempting to save to Airtable...');
            storageResult = await addToAirtable(emailData);
        } else {
            console.log('📧 Airtable not configured, using memory storage...');
            storageResult = await storeInMemory(emailData);
        }

        if (storageResult.success) {
            console.log(`✅ New email subscription: ${email} from ${source} (${storageResult.method})`);
            
            // Send welcome email and add to audience (non-blocking)
            try {
                const welcomeEmailResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/send-welcome-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: emailData.email,
                        name: emailData.name,
                        source: emailData.source
                    })
                });
                
                if (welcomeEmailResponse.ok) {
                    const emailResult = await welcomeEmailResponse.json();
                    console.log('📧 Welcome email result:', emailResult);
                    console.log('📧 Audience added:', emailResult.audienceAdded);
                } else {
                    console.log('📧 Welcome email not sent (service not configured)');
                }
            } catch (emailError) {
                console.log('📧 Welcome email error (non-critical):', emailError.message);
            }
            
            // Return success response
            res.status(200).json({
                success: true,
                message: 'Successfully subscribed to newsletter',
                subscriberCount: 'stored',
                email: emailData.email,
                method: storageResult.method,
                debug: {
                    hasAirtableConfig: AIRTABLE_API_KEY !== 'your_airtable_api_key' && AIRTABLE_BASE_ID !== 'your_base_id',
                    timestamp: new Date().toISOString()
                }
            });
        } else {
            console.error('❌ Failed to store email:', storageResult.error);
            res.status(500).json({ 
                error: 'Failed to save email',
                debug: {
                    storageError: storageResult.error,
                    hasAirtableConfig: AIRTABLE_API_KEY !== 'your_airtable_api_key' && AIRTABLE_BASE_ID !== 'your_base_id',
                    timestamp: new Date().toISOString()
                }
            });
        }

    } catch (error) {
        console.error('Error in subscribe handler:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
