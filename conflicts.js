const fs = require('fs');
function extractConflicts(file) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');
    let inConflict = false;
    let block = [];
    lines.forEach((line, i) => {
        if (line.startsWith('<<<<<<< HEAD')) {
            inConflict = true;
            block.push(`\n--- CONFLICT START (${file}:${i+1}) ---`);
        }
        if (inConflict) block.push(line);
        if (line.startsWith('>>>>>>> main')) {
            inConflict = false;
            block.push(`--- CONFLICT END ---\n`);
        }
    });
    console.log(block.join('\n'));
}

['client/src/App.jsx', 'client/src/components/Layout/NavBar.jsx', 'client/src/pages/DashBoard/UserDashboard/UserDashboard.jsx', 'client/src/pages/JobDetail/JobDetail.jsx', 'server/src/routes/jobs.js'].forEach(extractConflicts);
