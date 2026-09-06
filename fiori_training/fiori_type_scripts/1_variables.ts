//Creating variables

let greeting: string = "Hello world";

//create other variables/array

let isLoading: boolean = false;

let tech : string[] = ["abap","ui5","node","btp"];

//create function
function printArray(arrName: string[]): void{

    for (let i = 0; i < arrName.length; i++) {
        let element = arrName[i];
        //element = 10;
        console.log(element);
    }

}

//json - infer the shape of json
const user = {
    name: 'anubhav',
    age: 35,
    isAdmin: false
};

// typescript will check if the property exist
//console.log(user.x);
console.log(user.name);
console.log(greeting);
printArray(tech);

//never - represent that a condition will never occur
function throwError(message: string): never{
 //   return 10;
 throw new Error(message);
}