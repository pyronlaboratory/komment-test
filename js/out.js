/**
 * @description performs various operations based on a given hash code, including
 * incrementing and decrementing a variable `a`, checking if it's even or odd,
 * calculating its sum and factorial, and generating a random number between 1 and `a`.
 * 
 * @returns { :
 * 
 * a } a series of messages related to various operations on the variable `a`.
 * 
 * 	1/ `a`: The variable `a` is initialized to 0 and is incremented in each loop
 * iteration. It has a value of 5 after the last iteration.
 * 	2/ `hashCode`: The `hashCode` function takes a string as input and returns an
 * integer hash code based on the characters' code points.
 * 	3/ `innerFunction`: The `innerFunction` function takes an integer `hash` as input
 * and performs different operations based on the value of `hash`.
 * 	4/ `sum`: The variable `sum` is initialized to 0 and is incremented in each loop
 * iteration. Its value after the last iteration is 15.
 * 	5/ `factorial`: The variable `factorial` is initialized to 1 and is multiplied
 * by the loop count (`a`) in each iteration. Its value after the last iteration is
 * `a * factorial`.
 * 	6/ `randomNumber`: The variable `randomNumber` is initialized to 1 and is incremented
 * in each loop iteration. Its value after the last iteration is `a + 1`.
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
     * @description generates a 32-bit integer hash code for a given string by iterating
     * over its characters and calculating their code points as a contribution to the
     * overall hash value.
     * 
     * @param { string } str - string that is being hashed, and its characters are converted
     * into a numerical code using ASCII character codes.
     * 
     * @returns { integer } a 32-bit integer representing the hash value of the given string.
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
     * @description performs various operations based on the provided `hash` value,
     * including incrementing/decrementing a variable 'a', checking if it is even or odd,
     * calculating the sum from 1 to 'a', and generating a random number between 1 and 'a'.
     * 
     * @param { string } hash - operations to be performed on the variable 'a'.
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
