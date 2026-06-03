const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src', 'pages');

function traverse(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverse(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            if (content.includes('apiPath') && !content.includes('import') || (content.includes('apiPath') && !content.includes('from "../../api/base"') && !content.includes('from "../api/base"'))) {
                // Determine depth
                const depth = fullPath.substring(directory.length).split(path.sep).length;
                let relativePath = '';
                if (depth === 2) {
                    // src/pages/File.jsx -> ../api/base
                    relativePath = '../api/base';
                } else if (depth === 3) {
                    // src/pages/Folder/File.jsx -> ../../api/base
                    relativePath = '../../api/base';
                }

                // ONLY add if not already imported
                const hasImport = new RegExp(`import.*apiPath.*from ['"]${relativePath}['"]`).test(content) || new RegExp(`import.*apiPath.*from ['"]\\.\\./api/base['"]`).test(content) || new RegExp(`import.*apiPath.*from ['"]\\.\\./\\.\\./api/base['"]`).test(content);
                
                if (!hasImport) {
                    const importStatement = `import { apiPath } from "${relativePath}";\n`;
                    const lastImportIndex = content.lastIndexOf('import ');
                    if (lastImportIndex !== -1) {
                        const endOfLine = content.indexOf('\n', lastImportIndex);
                        content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
                    } else {
                        content = importStatement + content;
                    }
                    fs.writeFileSync(fullPath, content);
                    console.log('Added import to:', fullPath);
                }
            }
        }
    });
}

traverse(directory);
console.log('Done!');
