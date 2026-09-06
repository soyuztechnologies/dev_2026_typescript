
let obj : any = { some : 'abc'};
//not a clean coding
//console.log(obj.some.other);

//typescript can enforce these kind of calls in early phases
//optional chanining - ?
//console.log(obj?.some?.toUpperCase());

///type cast the data
///optional chaining might fix the designtime checks but still it is
///not a bullet proof solution, we can typecast
console.log((obj?.some as string).toLocaleUpperCase());
