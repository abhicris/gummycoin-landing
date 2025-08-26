// Vercel Serverless Function for Admin Statistics
// Using Airtable as a simple, free database

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || 'your_airtable_api_key';
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'your_base_id';
const AIRTABLE_TABLE_NAME = 'Emails';

// Function to get emails from Airtable
async function getEmailsFromAirtable() {
    try {
        const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.records.map(record => ({
                email: record.fields.Email,
                source: record.fields.Source || 'unknown',
                name: record.fields.Name || '',
                interest: record.fields.Interest || 'early-access',
                subscribedAt: record.fields['Subscribed At'],
                ip: record.fields['IP Address'] || 'unknown'
            }));
        } else {
            console.error('Airtable API error:', response.status);
            return [];
        }
    } catch (error) {
        console.error('Error fetching from Airtable:', error);
        return [];
    }
}

// Fallback function for when Airtable is not configured
async function getEmailsFromMemory() {
    console.log('📊 No database configured, returning empty stats');
    return [];
}

// Main handler function
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
        // Get emails (Airtable if configured, otherwise memory)
        let emails;
        if (AIRTABLE_API_KEY !== 'your_airtable_api_key' && AIRTABLE_BASE_ID !== 'your_base_id') {
            emails = await getEmailsFromAirtable();
        } else {
            emails = await getEmailsFromMemory();
        }

        // Calculate statistics
        const stats = {
            totalSubscribers: emails.length,
            recentSubscribers: emails.slice(-10), // Last 10 signups
            signupsBySource: {},
            signupsByDay: {},
            totalApplications: 0, // Placeholder for future
            totalWhitelisted: 0   // Placeholder for future
        };

        // Calculate signups by source
        emails.forEach(email => {
            const source = email.source || 'unknown';
            stats.signupsBySource[source] = (stats.signupsBySource[source] || 0) + 1;
        });

        // Calculate signups by day
        emails.forEach(email => {
            const date = email.subscribedAt.split('T')[0];
            stats.signupsByDay[date] = (stats.signupsByDay[date] || 0) + 1;
        });

        console.log(`📊 Admin stats requested. Total subscribers: ${stats.totalSubscribers}`);

        // Return statistics
        res.status(200).json(stats);

    } catch (error) {
        console.error('Error in admin stats handler:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
