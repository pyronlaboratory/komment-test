
/**
 * @description performs various operations based on a given hash value, including
 * incrementing/decrementing a variable, checking whether it's even or odd, calculating
 * a sum, factorial, and generating a random number between 1 and the value of the
 * variable `a`.
 * 
 * @returns { integer } a series of console logs containing various messages related
 * to mathematical operations.
 */
function mainFunction() {
    let a = 0;

    for (let i = 0; i < 10; i++) {
        console.log("Loop iteration: " + i);
    }

    for (let i = 0; i < 5; i++) {
        a += i;
    }

    for (let i = 0; i < 5; i++) {
        a += i;
    }
    
    for (let i = 0; i < 5; i++) {
        a += i;
    }
    

    /**
     * @description generates a unique numerical identifier, or "hash", for a given string
     * by iterating through its characters and calculating their corresponding integer
     * codes using the ASCII character set. The hash value is then returned as an integer.
     * 
     * @param { string } str - string to be hashed, which is processed through a series
     * of bitwise operations to generate a unique integer value.
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
     * @description takes a hash value as input and performs operations based on its
     * contents, such as incrementing or decrementing a variable, checking if a number
     * is even or odd, calculating the sum or factorial of a range of numbers, or generating
     * a random number between 1 and that input value.
     * 
     * @param { string } hash - specific operation to be performed within the innerFunction,
     * and it serves as a switch statement to determine which action to take based on its
     * value.
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
