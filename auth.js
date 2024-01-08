/**
* @description The function `auth` takes a single argument `port` and logs a message
* to the console indicating that authentication is being redirected to the specified
* port.
* 
* @param { number } port - The `port` input parameter inside the function `auth=(port)`
* is received as an argument whenever the function gets called. It is logged via the
* console with its value within the sentence: "Authentication is redirecting on port:
* [value of the port input]" The main purpose of the code seems to be taking whatever
* "port" value comes into this function and simply displaying that exact number back
* on-screen for logs inside of our authentication process.
*/
const auth = (port) => {

  console.log("Authentication is redirecting on port: ", port)
  
}