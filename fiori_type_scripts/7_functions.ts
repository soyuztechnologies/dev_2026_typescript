import { ODataV2Payload, Student } from "./types/anubhav"

//type script function with optional parameters

function add(a:number, b:number, c?: number): number{
    return a + b + (c || 0);
}

//create function with default value
function pow(value: number, exponent: number = 10): number{
    return value ** exponent;
}

//named parameters as json input
function devide({dividend, divisor}: {dividend : number, divisor: number}): number{
    return dividend / divisor;
}

//using our generic type interfaces from .d.ts file as a function parameter
//code completion inside the function works that never work in js
function printStudentDataFromSAP( data: ODataV2Payload<Student>): void{
    //...provde the type here using type guard only then i can access
    console.log(data.d.results[0].name + " --score--> " + data.d.results[0].marks);
}

//REST PARAMETER, suppose i want to create a function where first 2 parameters are fixed
//i never know as developer that after first2 how many more params will come next
//rest paramter is done by triple dot ...
function addNums(a:number, b:number, ...zkas: number[]){
    return a + b + zkas.reduce((p,c) => p + c, 0);
}

function addNumsWO(a:number, b:number, zkas: number[]){
    return a + b + zkas.reduce((p,c) => p + c, 0);
}

console.log(add(2,3,10));
console.log(pow(2));
console.log(pow(2,2));
console.log(devide({dividend: 20, divisor: 2}));
console.log(printStudentDataFromSAP({
    d:{
        results: [
            {
                name: "optimus prime",
                marks: 100
            },
            {
                name: "Bumbble bee",
                marks: 90
            }
        ]
    }
}))
console.log(addNumsWO(10,5,[1,3,6]));
console.log(addNums(10,5,1,3,6));