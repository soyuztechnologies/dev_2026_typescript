"use strict";
///Real life example of generic interface that allows us to design odatav2
const responseStudent = {
    d: {
        results: [
            {
                name: 'anubhav',
                marks: 80
            },
            {
                name: 'ananya',
                marks: 100
            }
        ]
    }
};
const responseBooks = {
    d: {
        results: [
            {
                name: 'anubhav',
                author: 'martin',
                rating: 5
            },
            {
                name: 'ananya',
                author: 'Mr. Agarwal',
                rating: 6
            }
        ]
    }
};
console.log(responseBooks);
console.log(responseStudent);
//Rather creating multiple interfaces with different data types
//We can use generic interface <T> where T represent the datatype @ runtime
// interface Box<T>  {
//     value: T
// }
// const squre : Box<number> = {
//     value: 20
// };
// const coloredBox : Box<string> = {
//     value: 'red'
// }
// interface product {
//     product_id: string,
//     price: number,
//     currency: string,
//     category: string
// }
// const myProduct : Box<product> = {
//     value: {
//         product_id: 'abc',
//         currency: 'eur',
//         category: 'mice',
//         price: 50
//     }
// }
// interface BoxNum{
//     value: number
// }
// interface BoxString{
//     value: string
// }
// const squre : BoxNum = {
//     value: 20
// };
// const coloredBox : BoxString = {
//     value: 'red'
// }
