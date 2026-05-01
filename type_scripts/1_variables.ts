//Explicit types basics
//Explicit typing means you tell TypeScript exactly what type a variable should be:
// String
let greeting: string = "Hello, TypeScript!";

// Number
let userCount: number = 42;

// Boolean
let isLoading: boolean = true;

// Array of numbers
let scores: number[] = [100, 95, 98];

// Function with explicit parameter and return types
function greet(name: string): string {
        return `Hello, ${name}!`;
    }

// TypeScript will ensure you pass the correct argument type
greet("Alice"); // OK

//greet(42);     // Error: Argument of type '42' is not assignable to parameter of type 'string'

///**TypeScript can automatically determine (infer) the type of a variable based on its initial value:

// TypeScript infers 'string'
let username = "alice";

// TypeScript infers 'number'
let score = 100;

// TypeScript infers 'boolean[]'
let flags = [true, false, true];

// TypeScript infers return type as 'number'
function sums(a: number, b: number) {
    return a + b;
}

// TypeScript infers the shape of the object
const user = {
    name: "Alice",
    age: 30,
    isAdmin: true
};

// TypeScript knows these properties exist
console.log(user.name);  // OK
//console.log(user.email); // Error: Property 'email' does not exist

//**Type mismatch errors */
// let username: string = "alice";
// username = 42; // Error: Type 'number' is not assignable to type 'string'


//The never type represents the type of values that never occur.
//It's used to indicate that something never happens or should never happen.
function throwError(message: string): never {
  throw new Error(message);
}