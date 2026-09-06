//class is the keyword for class, export default class
export default class Person {
    age = 10;
    name;
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
}
//create object
const person = new Person("Nong Yuy", 35);
console.log(person.name);
///Generic functions
///Generics allow creating 'type variables' which can be used to create classes
///functions, alias they dont define explicitly rather the name and type will come at runtime
function createPair(v1, v2) {
    return [v1, v2];
}
console.log(createPair('nong yuy', 'anurag'));
///Class with generics
class NameValue {
    name;
    _value;
    //private name: string;
    constructor(name) {
        this.name = name;
        this.name = name;
    }
    setValue(value) {
        this._value = value;
    }
    getValue() {
        return this._value;
    }
    toString() {
        return `${this.name}: ${this._value}`;
    }
}
let value = new NameValue('smoker');
value.setValue(false);
console.log(value.toString());
let value2 = new NameValue('factorial');
value2.setValue(512);
console.log(value2.toString());
