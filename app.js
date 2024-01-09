/**
* @description The function `app` takes a single argument `port`, and logs the message
* "App is running live on port: " followed by the value of `port` to the console.
* 
* @param { number } port - The `port` input parameter passed to the function is a
* number that determines which port the application should listen on and serve
* requests from.
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}