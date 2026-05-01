"use strict";
const names = [];
names.push("Dylan"); // no error
// names.push(3); // Error: Argument of type 'number' is not assignable to parameter of type 'string'.
const namesNew = ["Dylan"];
//namesNew.push("Jack"); // Error: Property 'push' does not exist on type 'readonly string[]'.
// Typed Arrays
// A tuple is a typed array with a pre-defined length and types for each index.
// Tuples are great because they allow each element in the array to be a known type of value.
// To define a tuple, specify the type of each element in the array:
// define our tuple
let ourTuple;
// initialize correctly
ourTuple = [5, false, 'Coding God was here'];
///**Read only tuples
// define our readonly tuple
const ourReadonlyTuple = [5, true, 'The Real Coding God'];
// throws error as it is readonly.
//ourReadonlyTuple.push('Coding God took a day off');
const car = {
    type: "Toyota",
    model: "Corolla",
    year: 2009
};
console.log(car.type); // OK
//console.log(car.color); // Error: Property 'color' does not exist on type '{ type: string; model: string; year: number; }'.
