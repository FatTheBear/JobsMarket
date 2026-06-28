const axios = require('axios');

async function test() {
    try {
        console.log('Fetching company public profile...');
        const res = await axios.get('http://localhost:5000/api/company-public/public/22');
        console.log('Status:', res.status);
        console.log('Company:', res.data.company);
        console.log('Jobs:', res.data.jobs);
        
        if (res.data.company && res.data.company.hr_id) {
            console.log('Fetching posts for hr_id:', res.data.company.hr_id);
            const postsRes = await axios.get(`http://localhost:5000/api/posts/user/${res.data.company.hr_id}`);
            console.log('Posts count:', postsRes.data.length);
            if (postsRes.data.length > 0) {
                console.log('First Post sample:', postsRes.data[0]);
            }
        }
    } catch (e) {
        console.error('API Error:', e.response ? { status: e.response.status, data: e.response.data } : e.message);
    }
}

test();
