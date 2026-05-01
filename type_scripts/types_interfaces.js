"use strict";
///Simple types
const carYear = 2001;
const carType = "Toyota";
const carModel = "Corolla";
const myCar = {
    year: carYear,
    type: carType,
    model: carModel
};
//create variable for type Bear
const bear = { name: "Winnie", honey: true };
let response = "success";
const rectangle = {
    height: 20,
    width: 10
};
const coloredRectangle = {
    height: 20,
    width: 10,
    color: "red"
};
//type script functions
// the `?` operator here marks parameter `c` as optional
function add(a, b, c) {
    return a + b + (c || 0);
}
//default parameters
function pow(value, exponent = 10) {
    return value ** exponent;
}
//named parameters using object destructuring
function divide({ dividend, divisor }) {
    return dividend / divisor;
}
//rest parameters
function addNums(a, b, ...zkas) {
    return a + b + zkas.reduce((p, c) => p + c, 0);
}
// Calling all functions with console.log
console.log("add(2, 3):", add(2, 3));
console.log("add(2, 3, 4):", add(2, 3, 4));
console.log("addNums(2, 3, 4, 5):", addNums(2, 3, 4, 5));
console.log("pow(2):", pow(2));
console.log("pow(2, 3):", pow(2, 3));
console.log("divide({dividend: 20, divisor: 2}):", divide({ dividend: 20, divisor: 2 }));
