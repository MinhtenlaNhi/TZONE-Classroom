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
            let originalContent = content;

            // Simple replace of `${import.meta.env.VITE_API_URL || ""}${varName}` -> `apiPath(varName)`
            // We use regex to catch variables like `course.thumbnail` or `user.avatar`
            const regex = /\$\{import\.meta\.env\.VITE_API_URL\s*\|\|\s*""\}\$\{([^}]+)\}/g;
            let match;
            let needsImport = false;

            while ((match = regex.exec(originalContent)) !== null) {
                needsImport = true;
            }

            if (needsImport) {
                content = content.replace(regex, (match, p1) => {
                    // if it's used inside a template literal like `${import...}${var}` 
                    // we replace with `${apiPath(var)}`
                    return `\${apiPath(${p1})}`;
                });

                // Also need to check if there are occurrences without template literals but directly in JSX
                // However, the regex covers the `${...}` case, which is how it's used in these files (e.g., src={`${...}${...}`})
                
                // Add import if missing
                if (!content.includes('apiPath')) {
                    // Need to figure out relative path to api/base
                    const depth = fullPath.substring(directory.length).split(path.sep).length;
                    const relativePath = '../'.repeat(depth) + 'api/base';
                    const importStatement = `import { apiPath } from "${relativePath}";\n`;
                    
                    // Add after the last import
                    const lastImportIndex = content.lastIndexOf('import ');
                    if (lastImportIndex !== -1) {
                        const endOfLine = content.indexOf('\n', lastImportIndex);
                        content = content.slice(0, endOfLine + 1) + importStatement + content.slice(endOfLine + 1);
                    } else {
                        content = importStatement + content;
                    }
                }

                fs.writeFileSync(fullPath, content);
                console.log('Fixed:', fullPath);
            }
        }
    });
}

traverse(directory);
console.log('Done!');
