/**
* @description This function takes a single argument `port` and logs a message to
* the console indicating that authentication is being redirected to the specified port.
* 
* @param { number } port - The `port` input parameter inside the `(port)` arrow
* function serves as an argument that receives the value of the `port` option passed
* when calling `authenticate()`. In the function logic itself there's no explicit
* usage or dependence on the value passed as an argument - nevertheless its presence
* as an arg means its visibility/availability exists only within this context which
* might serve purposes if called multiple times.
*/
const auth = (port) => {
  console.log("Authentication is redirecting on port: ", port)
}