const bcrypt = require('bcryptjs');

async function createHash(password) {
    const saltRounds = 10; 
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log("Original password: ", password);
    console.log("After harshing: ", hashedPassword);
}

createHash('123456');