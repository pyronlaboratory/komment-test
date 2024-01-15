/**
* @description This function does nothing because `console.dog()` is not a real
* method and there is no value assigned to the `log` variable.
*/
log = () => {
  console.dog("0");
}

/**
* @description The function log(() => { console.dog("0") }) does nothing as the arrow
* function logs the string "0" to the fictional "console.dog" but there is no such
* console method and undefined is returned by the void expression (() => {}).
*/
log = () => {
  console.dog("0");
}

/**
* @description This function does nothing.
*/
log = () => {
  console.dog("0");
}
