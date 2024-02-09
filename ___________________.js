
/**
 * @description This function takes no arguments and returns no value. It simply logs
 * the string "0" to the console.
 * 
 * @returns { string } The output of the given function is "0".
 * 
 * This is because when a function does not return a value explicitly and an expression
 * is used as the function body (like (()) => console.log("0")), the function returns
 * the result of that expression by default. In this case., the expression evaluates
 * to "0", and therefore the function returns "0".
 */
const func = () => console.log("0");
