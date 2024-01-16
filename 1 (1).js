/**
* @description This function takes a single argument `port`, and logs the message
* "App is running live on port: " followed by the value of `port` to the console.
* 
* @param { number } port - The `port` input parameter passed to the `app` function
* defines the HTTP port where the application will listen for incoming requests.
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}
