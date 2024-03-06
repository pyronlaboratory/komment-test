function mainFunction() {
    let a = 0;

    function innerFunction1() {
        a++;
        console.log("Inner function 1 executed");
    }

    function innerFunction2() {
        a--;
        console.log("Inner function 2 executed");
    }

    function innerFunction3() {
        if (a > 0) {
            console.log("Value of 'a' is greater than 0");
        } else if (a < 0) {
            console.log("Value of 'a' is less than 0");
        } else {
            console.log("Value of 'a' is equal to 0");
        }
    }

    function innerFunction4() {
        let sum = 0;
        for (let i = 1; i <= 10; i++) {
            sum += i;
        }
        console.log("Sum from 1 to 10 is: " + sum);
    }

    function innerFunction5() {
        let factorial = 1;
        for (let i = 1; i <= 5; i++) {
            factorial *= i;
        }
        console.log("Factorial of 5 is: " + factorial);
    }

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
