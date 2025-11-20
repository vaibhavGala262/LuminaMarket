import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
    console.log('🛡️  Starting Security Tests...\n');

    // 1. Test Security Headers
    console.log('1️⃣  Testing Security Headers...');
    try {
        const res = await fetch(`${BASE_URL}/health`);
        const headers = res.headers;

        const requiredHeaders = [
            'x-content-type-options',
            'x-frame-options',
            'content-security-policy',
            'x-dns-prefetch-control'
        ];

        let allHeadersPresent = true;
        requiredHeaders.forEach(header => {
            if (!headers.get(header)) {
                console.log(`   ❌ Missing header: ${header}`);
                allHeadersPresent = false;
            } else {
                console.log(`   ✅ Found header: ${header}`);
            }
        });

        if (allHeadersPresent) console.log('   ✨ Security Headers Test PASSED\n');
    } catch (err) {
        console.log('   ❌ Headers Test FAILED:', err.message, '\n');
    }

    // 2. Test Rate Limiting
    console.log('2️⃣  Testing Rate Limiting (Auth Routes)...');
    console.log('   Sending 7 login requests rapidly (Limit is 5)...');
    try {
        let blocked = false;
        for (let i = 0; i < 7; i++) {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: `test${i}@test.com`, password: 'wrongpassword' })
            });

            if (res.status === 429) {
                console.log(`   ✅ Request ${i + 1} blocked with 429 Too Many Requests`);
                blocked = true;
                break;
            } else {
                console.log(`   Request ${i + 1}: Status ${res.status}`);
            }
        }

        if (blocked) {
            console.log('   ✨ Rate Limiting Test PASSED\n');
        } else {
            console.log('   ❌ Rate Limiting Test FAILED (Did not block requests)\n');
        }
    } catch (err) {
        console.log('   ❌ Rate Limiting Test FAILED:', err.message, '\n');
    }

    // 3. Test NoSQL Injection
    console.log('3️⃣  Testing NoSQL Injection Prevention...');
    try {
        // Attempt to login with a NoSQL injection payload: {"$gt": ""} matches any password
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@test.com',
                password: { "$gt": "" }
            })
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            // If it's not JSON, it might be an HTML error page (which is fine if it's a 400/500 error)
            data = { message: 'Non-JSON response' };
        }

        if (res.status === 400 || res.status === 401 || res.status === 500) {
            console.log(`   ✅ Request rejected/failed safely with status ${res.status}`);
            console.log('   ✨ NoSQL Injection Test PASSED\n');
        } else {
            console.log(`   ⚠️ Unexpected status: ${res.status}`);
            console.log('   Response:', text.substring(0, 100));
        }
    } catch (err) {
        console.log('   ❌ NoSQL Test FAILED:', err.message, '\n');
    }

    // 4. Test XSS Sanitization
    console.log('4️⃣  Testing XSS Sanitization...');
    try {
        // Attempt to register with a script tag in the name
        const xssPayload = '<script>alert("xss")</script>';
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: xssPayload,
                email: 'xsstest@test.com',
                password: 'password123'
            })
        });

        const text = await res.text();
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            data = { message: 'Non-JSON response' };
        }

        // We check if the response reflects the raw script tag
        if (text.includes('<script>')) {
            console.log('   ❌ XSS Payload reflected in response (Potential Vulnerability)');
        } else {
            console.log('   ✅ XSS Payload NOT reflected raw in response');
            console.log('   ✨ XSS Sanitization Test PASSED\n');
        }

    } catch (err) {
        console.log('   ❌ XSS Test FAILED:', err.message, '\n');
    }
}

runTests();
