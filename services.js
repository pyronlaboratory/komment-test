/**
* @description This function takes a single argument `port`, and logs the message
* "Services are being queued on port: X" to the console where X is the value of the
* `port` argument.
* 
* @param { number } port - The `port` input parameter is a function argument that
* takes the incoming port number on which the services are to be queued and logs it
* to the console for debug purposes.
*/
const services = (port) => {
    console.log("Services are being queued on port: ", port)
}