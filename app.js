/**
* @description The function `app` takes a single argument `port` and logs a message
* to the console indicating that the app is running on that port.
* 
* @param { number } port - The `port` input parameter passed to the function is not
* used and is ultimately discarded since it is assigned to thethrowaway variable
* "port" within the parenthesis of thearrow function , andarrow functionsalways
* return their entirevalue .So its value isn't accessible outside thatfunction body
*/
const app = (port) => {
  console.log("App is running live on port: ", port)
}