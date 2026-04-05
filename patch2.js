const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'frontend/src');

const replaceInDir = dir => {
    try {
        fs.readdirSync(dir).forEach(file => {
            const filePath = path.join(dir, file);
            if (fs.statSync(filePath).isDirectory()) {
                replaceInDir(filePath);
            } else if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
                let content = fs.readFileSync(filePath, 'utf8');
                const regex = /import\.meta\.env\.VITE_API_URL \|\| \(import\.meta\.env\.PROD \? 'https:\/\/gym-routine-backend\.onrender\.com' : 'http:\/\/localhost:8080'\)/g;
                const replacement = "import.meta.env.VITE_API_URL || 'http://localhost:8080'";
                const newContent = content.replace(regex, replacement);
                if (content !== newContent) {
                    fs.writeFileSync(filePath, newContent);
                    console.log('Updated ' + filePath);
                }
            }
        });
    } catch (e) {
        console.error(e);
    }
};

replaceInDir(targetDir);
