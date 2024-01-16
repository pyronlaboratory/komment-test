/**
* @description The function `app` takes a single argument `port` and logs a message
* to the console indicating that the app is running live on the specified port.
* 
* @param { number } port - The `port` input parameter passed to the `app` function
* sets the port number on which the app will listen for incoming requests and receive
* data.
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}