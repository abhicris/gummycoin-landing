// Local test to verify Airtable connection works
const AIRTABLE_API_KEY = "patFuqGcmuHFdEUYc.57d00e4b3d858236bdde3f9889056c210738b0487077f05689563deab2b316e6";
const AIRTABLE_BASE_ID = "appHlxUP5tZkZIGLq";
const AIRTABLE_TABLE_NAME = "Emails";

async function testAirtableConnection() {
    console.log('🧪 Testing Airtable connection locally...');
    
    const testEmail = `test-local-${Date.now()}@gummy-test.com`;
    
    try {
        // Test 1: Read existing records
        console.log('📖 Reading existing records...');
        const readResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (readResponse.ok) {
            const data = await readResponse.json();
            console.log(`✅ Successfully read ${data.records.length} existing records`);
        } else {
            console.log('❌ Failed to read records:', readResponse.status);
        }
        
        // Test 2: Add a new test record
        console.log('📝 Adding test record...');
        const testData = {
            fields: {
                'Email': testEmail,
                'Source': 'local-test',
                'Name': 'Local Test User',
                'Interest': 'testing',
                'Subscribed At': new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
                'IP Address': '127.0.0.1'
            }
        };
        
        const writeResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        if (writeResponse.ok) {
            const result = await writeResponse.json();
            console.log('✅ Successfully added test record!');
            console.log('🆔 Record ID:', result.id);
            console.log('📧 Email:', testEmail);
            
            // Test 3: Verify the record was added
            console.log('🔍 Verifying record was added...');
            const verifyResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?filterByFormula={Email}="${testEmail}"`, {
                headers: {
                    'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json();
                console.log(`✅ Found ${verifyData.records.length} matching records`);
            }
            
        } else {
            const error = await writeResponse.text();
            console.log('❌ Failed to add record:', writeResponse.status, error);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// Run the test
testAirtableConnection();
