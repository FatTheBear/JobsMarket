const axios = require('axios');

async function testPost() {
  console.log('Sending mock POST request to http://localhost:5000/api/posts...');
  try {
    const response = await axios.post('http://localhost:5000/api/posts', 
      { content: 'Test post from script' }, 
      {
        headers: {
          'Authorization': 'Bearer INVALID_TOKEN_FOR_TESTING'
        }
      }
    );
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (err) {
    console.log('Request failed!');
    if (err.response) {
      console.log('Status code:', err.response.status);
      console.log('Error data:', err.response.data);
    } else {
      console.log('Error message:', err.message);
    }
  }
}

testPost();
