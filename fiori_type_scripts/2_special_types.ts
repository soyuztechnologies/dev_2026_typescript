

///Concept of unknwon which is better than any, because before performing operation
///as a developer we MUST prove to engine that its correct

let something2 : unknown = {name: "abc", demo: function(){
    console.log("here is some function");
}};

if (typeof something2 === "object" && something2 !== null
    //&& something2.hasFunction('demo')
) {
    //just above this line we need to add a TYPE GUARD which confirms the 
    //authenticity of this operation to TS engine
    
    const zkas = something2 as {demo : Function};
    zkas.demo();

    //something2.demo();
}


///Any Data type
let something: any = "this is a string";
something = 30;
something = {name: "abc", demo: function(){
    console.log("here is some function");
}};

////will throw error since we put any, ts engine never checks, it allows whatever comes
//something.demo2();


//an example of type guard which prove that the data of the function must be string only
function processValue(value : unknown){
    //guard because the data type is unknown
    if(typeof value === "string"){
        //operation
        console.log(value.toUpperCase());
    }
    else if (typeof value === "number"){
        console.log(value + 10);
    }
    else if(Array.isArray(value)){
        console.log(value.length);
    }
}

processValue(20);
processValue("hey amigo");
processValue([30,44,66,99]);