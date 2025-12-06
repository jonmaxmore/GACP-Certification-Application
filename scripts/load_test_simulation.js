// Native Fetch Implementation (Node > 18)
const BASE_URL = 'http://localhost:3000/api/v2';
const CONCURRENT_REQUESTS = 50;

async function runLoadTest() {
    console.log(`🔥 Starting Load Test: ${CONCURRENT_REQUESTS} concurrent requests...`);

    const requests = [];
    const startTime = Date.now();

    for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
        requests.push(
            fetch(`${BASE_URL}/applications/notifications`)
                .then(res => ({ status: res.status, time: Date.now() - startTime }))
                .catch(err => ({ status: 500, error: err.message }))
        );
    }

    try {
        const results = await Promise.all(requests);
        const endTime = Date.now();

        const success = results.filter(r => r.status === 200 || r.status === 401).length;
        const failed = results.filter(r => r.status === 500).length;

        console.log('\n📊 Load Test Results:');
        console.log(`✅ Total Requests: ${CONCURRENT_REQUESTS}`);
        console.log(`⏱️  Duration: ${endTime - startTime}ms`);
        console.log(`🟢 Success (Responsive): ${success}`);
        console.log(`🔴 Failed (Crashed/Network Error): ${failed}`);

        if (failed === 0) {
            console.log('\n✨ System passed the stress test!');
        } else {
            console.log('\n⚠️ System showed instability.');
        }

    } catch (error) {
        console.error('Test Failed:', error.message);
    }
}

runLoadTest();
