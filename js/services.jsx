/**
 * @description The provided JavaScript function getGreeting accepts a user object
 * and returns an HTML h1 element containing either the greeting "Hello {user's name}"
 * if a name exists or just "Hello Stranger" when no name is given.
 * 
 * @param { string } user - OK. Here is your answer.
 * 
 * The user input 'user' passes a value to this function which enables its conditional
 * statements to operate and generate greetings specific to those values passed.
 * 
 * @returns { string } ✏️ Response:
 * 
 * The output returned by the function is either "Hello ,Stranger" or "Hello ,(formatted
 * user name)!" respectively for NULL or non-NULL input .
 */
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
