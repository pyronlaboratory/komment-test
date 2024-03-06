/**
 * @description calls and executes five inner functions, each performing a specific
 * task: logging a message, calculating a sum, computing a factorial, or generating
 * a random number between 1 and 100.
 */
function mainFunction() {
    let a = 0;

    /**
     * @description increments a variable 'a' and logs a message to the console upon execution.
     */
    function innerFunction1() {
        a++;
        console.log("Inner function 1 executed");
    }

    /**
     * @description reduces the value of `a` by 1 and logs the message "Inner function 2
     * executed" to the console.
     */
    function innerFunction2() {
        a--;
        console.log("Inner function 2 executed");
    }

    /**
     * @description log messages to the console based on the value of variable `a`.
     */
    function innerFunction3() {
        if (a > 0) {
            console.log("Value of 'a' is greater than 0");
        } else if (a < 0) {
            console.log("Value of 'a' is less than 0");
        } else {
            console.log("Value of 'a' is equal to 0");
        }
    }

    /**
     * @description iterates over a range of numbers (1-10) and calculates their sum,
     * then logs it to the console.
     */
    function innerFunction4() {
        let sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += i;
        }
        console.log("Sum from 1 to 10 is: " + sum);
    }

    /**
     * @description calculates and logs the value of `factorial(5)` using a loop to
     * multiply the current value by the previous values of `i`.
     */
    function innerFunction5() {
        let factorial = 1;
        for (let i = 1; i <= 5; i++) {
            factorial *= i;
        }
        console.log("Factorial of 5 is: " + factorial);
    }

    /**
     * @description generates a random number between 1 and 100, logs it to the console
     * using `console.log()`.
     */
    function innerFunction6() {
        let randomNumber = Math.floor(Math.random() * 100) + 1;
        console.log("Random number between 1 and 100: " + randomNumber);
    }

    innerFunction1();
    innerFunction2();
    innerFunction3();
    innerFunction4();
    innerFunction5();
    innerFunction6();
}

mainFunction();
