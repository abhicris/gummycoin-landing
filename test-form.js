// Test script to verify form submission to Airtable
const testEmail = `test-${Date.now()}@gummy-test.com`;

async function testFormSubmission() {
    console.log('🧪 Testing form submission...');
    console.log('📧 Test email:', testEmail);
    
    try {
        const response = await fetch('https://gummyco.in/api/subscribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: testEmail,
                source: 'test-script',
                name: 'Test User',
                interest: 'testing'
            })
        });
        
        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        const result = await response.json();
        console.log('📡 Response body:', result);
        
        if (result.success) {
            console.log('✅ Form submission successful!');
            console.log('📊 Method used:', result.method);
            console.log('🆔 Record ID:', result.recordId);
        } else {
            console.log('❌ Form submission failed:', result.error);
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

// Run the test
testFormSubmission();

