/**
* @description This function takes a single argument `port`, and logs the message
* "App is running live on port: " followed by the value of `port` to the console.
* 
* @param { number } port - The `port` input parameter specifies the TCP port where
* the app should listen for incoming connections.
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}