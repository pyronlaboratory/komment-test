
/**
 * @description The function takes no arguments () and returns nothing (void) log the
 * string "0" to the console.
 * 
 * @returns { number } The output of the function is "0".
 * 
 * This is because the arrow function () => console.log("0") calls the console.log()
 * method with the string "0" as an argument and does not return anything explicitly;
 * therefore the return value is "undefined". However since a value is passed to
 * console.log() , it is loged on the console .
 */
const func = () => console.log("0");
