// Test API endpoint to debug Airtable connection
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
        const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
        const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
        const AIRTABLE_TABLE_NAME = 'Emails';

        // Debug information
        const debugInfo = {
            hasApiKey: !!AIRTABLE_API_KEY,
            hasBaseId: !!AIRTABLE_BASE_ID,
            apiKeyLength: AIRTABLE_API_KEY ? AIRTABLE_API_KEY.length : 0,
            baseIdLength: AIRTABLE_BASE_ID ? AIRTABLE_BASE_ID.length : 0,
            apiKeyStartsWith: AIRTABLE_API_KEY ? AIRTABLE_API_KEY.substring(0, 4) : 'none',
            baseIdStartsWith: AIRTABLE_BASE_ID ? AIRTABLE_BASE_ID.substring(0, 4) : 'none',
            tableName: AIRTABLE_TABLE_NAME,
            timestamp: new Date().toISOString()
        };

        console.log('🔍 Airtable Debug Info:', debugInfo);

        // If we have credentials, test the connection
        if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
            try {
                const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    debugInfo.connectionTest = 'success';
                    debugInfo.recordCount = data.records ? data.records.length : 0;
                    debugInfo.tableExists = true;
                } else {
                    const errorText = await response.text();
                    debugInfo.connectionTest = 'failed';
                    debugInfo.errorStatus = response.status;
                    debugInfo.errorText = errorText;
                    debugInfo.tableExists = false;
                }
            } catch (error) {
                debugInfo.connectionTest = 'error';
                debugInfo.errorMessage = error.message;
                debugInfo.tableExists = false;
            }
        } else {
            debugInfo.connectionTest = 'skipped';
            debugInfo.errorMessage = 'Missing credentials';
        }

        res.status(200).json({
            success: true,
            debug: debugInfo,
            message: 'Airtable connection test completed'
        });

    } catch (error) {
        console.error('Error in test handler:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message
        });
    }
}
