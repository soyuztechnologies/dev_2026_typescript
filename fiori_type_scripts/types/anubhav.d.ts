export interface ODataV2Payload<T = unknown>{
    d: {
        results: T[]
    }
}

export interface Student{
    name: string,
    marks: number
}

export interface Books{
    name: string,
    author: string,
    rating: number
}
