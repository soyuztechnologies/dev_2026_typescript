//type script functions
// the `?` operator here marks parameter `c` as optional
function add(a: number, b: number, c?: number) {
  return a + b + (c || 0);
}

//default parameters
function pow(value: number, exponent: number = 10) {
  return value ** exponent;
}

//named parameters using object destructuring
function divide({ dividend, divisor }: { dividend: number, divisor: number }) {
  return dividend / divisor;
}

//rest parameters
function addNums(a: number, b: number, ...zkas: number[]) {
  return a + b + zkas.reduce((p, c) => p + c, 0);
}

// Calling all functions with console.log
console.log("add(2, 3):", add(2, 3));
console.log("add(2, 3, 4):", add(2, 3, 4));
console.log("addNums(2, 3, 4, 5):", addNums(2, 3, 4, 5));
console.log("pow(2):", pow(2));
console.log("pow(2, 3):", pow(2, 3));
console.log("divide({dividend: 20, divisor: 2}):", divide({dividend: 20, divisor: 2}));