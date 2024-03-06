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
    
    function hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            let char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }

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
