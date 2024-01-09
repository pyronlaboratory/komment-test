/**
* @description This function takes a single argument `port`, and logs a message to
* the console indicating that the app is running live on that port.
* 
* @param { number } port - The `port` input parameter is a required argument that
* determines which port number the function will listen to for incoming connections.
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}