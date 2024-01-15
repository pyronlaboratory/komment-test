function myFunction(fn: unknown) {
  fn(); // triggers a type error
}

invokeAnything(1);
