var charles = "44"
console.log(charles);
console.log('eval:');
var string = "a=3;console.log(charles);/*dsadas*/console.log(charles*1+a*1);";
eval(string);