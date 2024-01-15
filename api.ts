/**
* @description This function calls the function passed as an argument without checking
* its type or functionality beforehand and triggers a type error.
* 
* @param { unknown } fn - In the given function `myFunction`, the `fn` input parameter
* is of type `unknown`. It does not have any specific type annotation or initialization
* value.
*/
function myFunction(fn: unknown) {
  fn(); // triggers a type error
}

invokeAnything(1);
