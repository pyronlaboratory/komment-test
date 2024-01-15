/**
* @description The function `myFunction` takes a function as an argument and immediately
* calls it with no return value or parameters. In other words.
* 
* @param { any } fn - The `fn` parameter is a reference to a function that will be
* called when the `myFunction` function is invoked.
*/
function myFunction(fn: any) {
  fn();
}

invokeAnything(1);
