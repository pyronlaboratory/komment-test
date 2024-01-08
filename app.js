/**
* @description This function takes a single argument `port`, and logs the message
* "App is running live on port: $port" to the console.
* 
* @param { any } port - The `port` input parameter passed to the function `app`
* specifies the port number where the application will listen for incoming connections
* and accept requests.
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}