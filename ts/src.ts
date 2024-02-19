import React from 'react';

const MathComponent: React.FC = () => {

/**
* @description This function adds two numbers together and returns their sum.
* 
* @param { number } a - The `a` input parameter is not used in this function.
* 
* The function only uses the `b` parameter, which is passed as an argument when 
* calling the function.
* 
* @param { number } b - In the provided function `add(a: number, b: number): number`, 
* the `b` input parameter is a parameter that is passed as an argument to the function 
* when it is called.
* 
* In other words, the `b` parameter is used in the calculation of the sum of the two 
* numbers, and the return value of the function is the result of adding `a` and `b`.
* 
* @returns { number } - The function `add` takes two number parameters `a` and `b`, 
* and returns their sum as the output.
*/
    function add(a: number, b: number): number {
        return a + b;
    }

    // ... [other functions can be defined here in the same manner as before]

/**
 * @description This function calculates the sine of a given angle (a) using the
 * Math.sin() function and returns the result.
 * 
 * @param { number } a - The input parameter `a` passes its value to `Math.sin()` for
 * calculation purposes.
 * 
 * @returns { number } This function takes a single argument `a` of type `number`,
 * and returns the sine of `a` using the `Math.sin()` method. The output returned by
 * this function is the sine of the given number `a`.
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
