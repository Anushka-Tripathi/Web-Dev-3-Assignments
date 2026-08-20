const isEven = require('./modules/isEven');
const log = require('./modules/logger');

log("Testing Custom Modules:");

const numbersToTest = [4, 7, 10, 15, 22];

numbersToTest.forEach((num) => {
    const result = isEven(num);
    log(`Is ${num} even? -> ${result}`);
});