/**
* @description This function takes a single argument `port`, and logs a message to
* the console indicating that the app is running live on that port.
* 
* @param { number } port - The `port` input parameter passed to the `app` function
* takes a value that determines which port number the app should listen on for
* incoming requests.
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}