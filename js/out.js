/**
 * @description performs various operations based on a given hash code, including
 * incrementing/decrementing a variable `a`, checking whether it's even or odd,
 * calculating its sum, factorial, and generating a random number between 1 and `a`.
 * 
 * @returns { integer } a series of log messages indicating the result of each operation.
 */
function mainFunction() {
    let a = 0;

    /**
     * @description calculates a hash code for a given string by iterating over its
     * characters and calculating their ASCII codes, then shifting, subtracting, and
     * converting them to a 32-bit integer.
     * 
     * @param { string } str - 16-bit Unicode string that is being processed by the
     * `hashCode()` function.
     * 
     * @returns { integer } a 32-bit integer representing a unique hash value for the
     * given string.
     */
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

    /**
     * @description takes a hash object as input and executes different operations based
     * on the value of its keys. It performs actions such as incrementing, decrementing,
     * checking if a number is even or odd, calculating the sum or factorial of a number,
     * or generating a random number between 1 and that number.
     * 
     * @param { string } hash - 4-char code that determines which operation will be
     * executed inside the innerFunction, such as increment, decrement, check even or
     * odd, calculate sum, calculate factorial, or generate random number between 1 and
     * the value of `a`.
     */
    function innerFunction(hash) {
        switch (hash) {
            case hashCode("increment"):
                a++;
                console.log("Value of 'a' incremented");
                break;
            case hashCode("decrement"):
                a--;
                console.log("Value of 'a' decremented");
                break;
            case hashCode("check_even_odd"):
                if (a % 2 === 0) {
                    console.log("Value of 'a' is an even number");
                } else {
                    console.log("Value of 'a' is an odd number");
                }
                break;
            case hashCode("calculate_sum"):
                let sum = 0;
                for (let i = 1; i <= a; i++) {
                    sum += i;
                }
                console.log("Sum from 1 to " + a + " is: " + sum);
                break;
            case hashCode("calculate_factorial"):
                let factorial = 1;
                for (let i = 1; i <= a; i++) {
                    factorial *= i;
                }
                console.log("Factorial of " + a + " is: " + factorial);
                break;
            case hashCode("generate_random"):
                let randomNumber = Math.floor(Math.random() * (a + 1)) + 1;
                console.log("Random number between 1 and " + a + ": " + randomNumber);
                break;
            default:
                console.error("Invalid operation");
        }
    }

    innerFunction(hashCode("increment"));
    innerFunction(hashCode("decrement"));
    innerFunction(hashCode("check_even_odd"));
    innerFunction(hashCode("calculate_sum"));
    innerFunction(hashCode("calculate_factorial"));
    innerFunction(hashCode("generate_random"));
}

mainFunction();
