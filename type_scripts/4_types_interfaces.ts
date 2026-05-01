///Simple types

type CarYear = number
type CarType = string
type CarModel = string
type Car = {
  year: CarYear,
  type: CarType,
  model: CarModel
}

const carYear: CarYear = 2001
const carType: CarType = "Toyota"
const carModel: CarModel = "Corolla"
const myCar: Car = {
  year: carYear,
  type: carType,
  model: carModel
};

///Union of types

type Animal = { name: string };
//adding more properties to the type
type Bear = Animal & { honey: boolean };
//create variable for type Bear
const bear: Bear = { name: "Winnie", honey: true };

type Status = "success" | "error";
let response: Status = "success";

//interfaces
interface Rectangle {
  height: number,
  width: number
}

const rectangle: Rectangle = {
  height: 20,
  width: 10
};

//Extending an interface means you are creating a new 
// interface with the same properties as the original, plus something new.
interface Rectangle {
  height: number,
  width: number
}

interface ColoredRectangle extends Rectangle {
  color: string
}

const coloredRectangle: ColoredRectangle = {
  height: 20,
  width: 10,
  color: "red"
};





