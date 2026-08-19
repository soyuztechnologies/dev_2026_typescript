
//class is the keyword for class, export default class

export default class Person{
    private age: number = 10 ;
    public name: string;

    constructor(name: string, age: number){
        this.name = name;
        this.age  = age;
    }

}

//create object
const person = new Person("Nong Yuy", 35);
console.log(person.name);

///Generic functions
///Generics allow creating 'type variables' which can be used to create classes
///functions, alias they dont define explicitly rather the name and type will come at runtime

function createPair<S, T>(v1: S, v2: T): [S,T] {
    return [v1,v2];
}

console.log(createPair<string,string>('nong yuy', 'anurag'));

///Class with generics
class NameValue<T> {
    private _value : T | undefined;
    //private name: string;

    constructor(private name: string){
        this.name = name;
    }

    public setValue(value: T){
        this._value = value;
    }
    public getValue(): T | undefined{
        return this._value;
    }

    public toString(): string{
        return `${this.name}: ${this._value}`;
    }
}

let value = new NameValue<boolean>('smoker');
value.setValue(false);
console.log(value.toString());

let value2 = new NameValue<number>('factorial');
value2.setValue(512);
console.log(value2.toString());