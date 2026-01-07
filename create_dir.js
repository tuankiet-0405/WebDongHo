const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'views', 'admin', 'reports');
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log('Created directory:', dir);
}
