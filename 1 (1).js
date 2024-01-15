/**
* @description This function takes a single argument `port`, and logs a message to
* the console indicating that the app is running on that port.
* 
* @param { string } port - The `port` input parameter passes a value to the function
* and stores it into a variable of the same name within the scope of the function;
* This allows whatever value was passed to be outputted when calling the function.
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}