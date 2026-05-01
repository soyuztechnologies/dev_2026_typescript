// Use constructor parameter (Best practice)

class Person {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

const person = new Person("Jane");
console.log(person.name); // ✓ Works fine

//Generics
//Generics allow creating 'type variables' which can be used to 
//create classes, functions & type aliases that don't need to explicitly define the 
//types that they use.
//Generics make it easier to write reusable code.
function createPair<S, T>(v1: S, v2: T): [S, T] {
  return [v1, v2];
}
console.log(createPair<string, number>('hello', 42)); // ['hello', 42]


///Generics can be used to create generalized classes, like Map.


class NamedValue<T> {
  private _value: T | undefined;

  constructor(private name: string) {}

  public setValue(value: T) {
    this._value = value;
  }

  public getValue(): T | undefined {
    return this._value;
  }

  public toString(): string {
    return `${this.name}: ${this._value}`;
  }
}

let value = new NamedValue<number>('myNumber');
value.setValue(10);
console.log(value.toString()); // myNumber: 10