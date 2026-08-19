//domains in abap - technical attribute of fields

type carType  = string;
type carYear = number;
type carModel = string;
type carComplex = {
    type: carType,
    year: carYear,
    model: carModel
}

let car1 : carComplex = {type: 'hatchback', model: 'toyata', year: 2020};
let car2 : carComplex = {type: 'sadan', model: 'hyndai', year: 2026};

//Union of types - objects
type Animal = {name: string};
//adding more property on top of animal
type Bull = Animal & { legs: number };
//create a variable of type bull
const bhalla : Bull = {name: 'Bhallal', legs: 4};


//interface - reuse str in se11
interface Ractangle {
    height : number,
    width : number
};

const ract1 : Ractangle = {
    height: 20,
    width : 30
};

interface ColoredRactangle extends Ractangle{
    color: string
};

const ract2 : ColoredRactangle ={
    color : 'red',
    height: 10,
    width: 20
}

