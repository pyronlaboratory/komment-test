import React from 'react';

/**
* @description This function creates a React component that displays a list of
* mathematical operations and their results. It takes an array of math expressions
* as props and maps over them to display the results using React's `li` element. The
* mathematical operations include addition (add), subtraction (subtract), multiplication
* (multiply), division (divide), modulus (modulus), power (power), square root
* (squareRoot), absolute value (absolute), rounding (round), flooring (floor), ceiling
* (ceiling), and trigonometric sin (sin).
* 
* @returns { array } The output returned by the `MathComponent` function is a React
* component that renders an unordered list of math operations and their results. The
* list includes 9 elements:
* 
* 1/ `add(5., 3.) = 8`
* 2/ `subtract(5., 3.) = 2`
* 3/ `multiply(5., 3.) = 15`
* 4/ `divide(5., 3.) = 1.67`
* 5/ `modulus(5., 3.) = 1`
* 6/ `power(5., 3.) = 125`
* 7/ `squareRoot(25.) = 5`
* 8/ `absolute(-5.) = 5`
* 9/ `round(5.4) = 5`
* 10/ `floor(5.8) = 5`
* 11/ `ceiling(5.2) = 6`
* 12/ `log(10)` (base 10 log of 10)
* 13/ `sin(Math.PI / 2)` (the sine of half a circle)
* 
* Each result is displayed as a separate list item with the operation and result.
*/
const MathComponent: React.FC = () => {

/**
* @description The function `add` takes two numbers `a` and `b`, adds them together
* and returns the sum.
* 
* @param { number } a - The `a` input parameter is the first operand to be added.
* 
* @param { number } b - The `b` input parameter adds the given number to the `a`
* input parameter within the function and returns their sum.
* 
* @returns { number } The output of this function is `NaN` (Not a Number) because
* both `a` and `b` are `undefined`.
*/
    function add(a: number, b: number): number {
        return a + b;
    }

/**
* @description The given function is named `sin` and takes a single parameter `a`,
* which is a number. The function returns the sine of `a`, calculated using the
* built-in `Math.sin()` method.
{/**
* @description This function calculates various mathematical operations (such as
* additionition through exponentiation) on a number `5` and displays the results
* inside an unordered list.
* 
* @param { number } result - The `result` input parameter is an argument for each
* function being called within the `results` array. It serves as the value that is
* being operated upon and returned by the corresponding mathematical function (e.g.,
* `add(5)`, `sin(5)`, etc.).
* 
* @param { number } index - In this React functional component `map()` method used
* to loop through the array of objects `results` and it's giving key to each list
* item based on `index` which is an input parameter. The key is generated as
* `key={index}` and this helps React to identify and track the items inside the list.
*/}
* 
* @param { number } a - In the provided JavaScript function `sin`, the `a` input
* parameter is passed as an argument to the `Math.sin()` method and serves as the
* angle to be sine-ified.
* 
* @returns { number } The output returned by this function is the sine of the given
* number `a`.
*/
    function sin(a: number): number {
        return Math.sin(a);
    }

    const results = [
        add(5, 3),
        subtract(5, 3),
        multiply(5, 3),
        divide(5, 3),
        modulus(5, 3),
        power(5, 3),
        squareRoot(25),
        absolute(-5),
        round(5.4),
        floor(5.8),
        ceiling(5.2),
        log(10),
        sin(Math.PI / 2)
    ];

    return (
        <div>
            <h1>Math Results</h1>
            <ul>
                {results.map((result, index) => (
                    <li key={index}>Result {index + 1}: {result}</li>
                ))}
            </ul>
        </div>
    );
}

export default MathComponent;
