const axios = require('axios');

async function testFetchImage() {
  const url = 'http://localhost:5000/uploads/posts/1782180213697-665653575.jpg';
  console.log(`Fetching image from ${url}...`);
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    console.log('HTTP Response Status:', response.status);
    console.log('HTTP Response Headers:', response.headers);
    console.log(`Successfully fetched image! Size: ${response.data.byteLength} bytes.`);
  } catch (err) {
    console.error('Fetch image failed!');
    if (err.response) {
      console.error('Status code:', err.response.status);
      console.error('Headers:', err.response.headers);
      console.error('Data:', err.response.data.toString().substring(0, 500));
    } else {
      console.error('Error message:', err.message);
    }
  }
}

testFetchImage();
