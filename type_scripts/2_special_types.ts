///TypeScript includes several special types that have specific behaviors in the type system.
console.log("Special Types in TypeScript");
//**The 'any' type */
// The 'any' type allows you to opt-out of type checking for a variable. It can hold any value, and you can perform any operation on it without TypeScript raising an error.
let anything: any = "This can be a string";
anything = 42;
anything = { name: "Alice" };
//anything.someNonExistentMethod(); // No error, but will fail at runtime


//**The 'unknown' type */
// The 'unknown' type is similar to 'any' in that it can hold any value, 
// but it is safer because you cannot perform operations 
// on it without first checking its type.
let w: unknown = 1;
w = "string"; // no error
w = {
  runANonExistentMethod: () => {
    console.log("I think therefore I am");
  }
} as { runANonExistentMethod: () => void}
// How can we avoid the error for the code commented out below when we don't know the type?
// w.runANonExistentMethod(); // Error: Object is of type 'unknown'.
if(typeof w === 'object' && w !== null) {
  (w as { runANonExistentMethod: Function }).runANonExistentMethod();
}
// Although we have to cast multiple times we can do a check in the if to
//  secure our type and have a safer casting


//** When to use unknown:

// When working with data from external sources (APIs, user input, etc.)
// When you want to ensure type safety while still allowing flexibility
// When migrating from JavaScript to TypeScript in a type-safe way

function processValue(value: unknown) {
  if (typeof value === 'string') {
    // value is now treated as string
    console.log(value.toUpperCase());
  } else if (Array.isArray(value)) {
    // value is now treated as any[]
    console.log(value.length);
  }
}

processValue("Hello"); // OK
processValue([1, 2, 3]); // OK