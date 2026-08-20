const [, , operation, num1Str, num2Str] = process.argv;

const num1 = parseFloat(num1Str);
const num2 = parseFloat(num2Str);

if (!operation || isNaN(num1) || isNaN(num2)) {
    console.log("Usage: node calculator.js <add|sub|mul|div> <num1> <num2>");
    process.exit(1);
}

switch (operation.toLowerCase()) {
    case 'add':
        console.log(`Result: ${num1 + num2}`);
        break;
    case 'sub':
        console.log(`Result: ${num1 - num2}`);
        break;
    case 'mul':
        console.log(`Result: ${num1 * num2}`);
        break;
    case 'div':
        if (num2 === 0) {
            console.log("Error: Division by zero is not allowed.");
        } else {
            console.log(`Result: ${num1 / num2}`);
        }
        break;
    default:
        console.log("Invalid operation. Use add, sub, mul, or div.");
}