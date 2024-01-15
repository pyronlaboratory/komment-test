/**
* @description This function takes an unknown function as an argument and calls it
* with no arguments.
* 
* @param { unknown } fn - The `fn` input parameter is not actually used or referred
* to anywhere inside the function body.
*/
function myFunction(fn: unknown) {
  fn(); // triggers a type error
}

invokeAnything(1);
