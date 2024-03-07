
/**
 * @description takes a user parameter and returns an HTML greeting based on the
 * user's presence or absence.
 * 
 * @param { string } user - name of the person for whom the greeting is being generated.
 * 
 * @returns { HTML h1 element. } an HTML header with a personalized greeting based
 * on the provided user parameter.
 * 
 * 	1/ `h1`: This is an HTML tag used to create a level 1 heading element.
 * 	2/ `formatName(user)`: This is a function that takes a string argument `user` and
 * returns its formatted name.
 * 	3/ `{formatName(user)}!`: This is the output of the `formatName` function, which
 * is appended to the `h1` tag. The exclamation mark (!) at the end of the tag adds
 * emphasis to the greeting.
 * 	4/ `Stranger`: This is a fixed string that is returned if the `user` parameter
 * is not provided or is null.
 */
function getGreeting(user) {
  if (user) {
    return <h1>Hello, {formatName(user)}!</h1>;
  }
  return <h1>Hello, Stranger.</h1>;
}
