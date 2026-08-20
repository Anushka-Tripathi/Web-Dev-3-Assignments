const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'test.txt');

console.log("Creating File...");
fs.writeFileSync(filePath, "Hello Node.js\n");
console.log("File Created");

console.log("Reading File...");
try {
    const content = fs.readFileSync(filePath, 'utf8');
    console.log(content.trim());
} catch (err) {
    console.error("Error reading file:", err.message);
}

console.log("Updating File...");
fs.appendFileSync(filePath, "Learning FS Module\n");

console.log("Reading Updated File...");
try {
    const updatedContent = fs.readFileSync(filePath, 'utf8');
    console.log(updatedContent.trim());
} catch (err) {
    console.error("Error reading file:", err.message);
}

console.log("Deleting File...");
try {
    fs.unlinkSync(filePath);
    console.log("File Deleted");
} catch (err) {
    console.error("Error deleting file:", err.message);
}