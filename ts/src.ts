import React from 'react';

/**
 * @description This function defines several mathematical functions as constants and
 * then calculates their results for various input values using those functions
 * (represented as numbers). Then it displays a list of the result calculated values
 * .
 * 
 * @returns { object } Based on the given code snippet. The function component takes
 * no argument and returns a list of Math results as an array of JavaScript objects
 * with properties such as result number key and value .
 * 
 * Therefore he output return by the function is an unordered list of the Math results
 * obtained using different Math operation functions applied to a set of input values
 */
const MathComponent: React.FC = () => {

/**
* @description This function adds two numbers together and returns their sum.
* 
* @param { number } a - The `a` input parameter is not used in this function.
* 
* The function only uses the `b` parameter, which is passed as an argument when 
* calling the function.
* 
{/**
 * @description This React Functional Component named "MathComponent" returns an HTML
 * ul list of math operations performed on various input values: addition(5+3),
 * subtraction (5-3), multiplication (5x3), division (5/3), remainder (5%3),
 * exponentiation (5^3), square root of 25 squared , absolute value (-5), rounded 5.4
 * roundedTo closest integer (5.4 -> 5), ceiling of 5.2 raised to nearest integer
 * (5.2 -> 6), log base 10 of 10 squared and sin of PI/2 .
 * 
 * @param { number } result - In this React Functional Component template literal
 * definition below  the 'result' input parameters takes the results from the
 * calculations and stores them into memory to be passed on later into another part
 * of code where they will be rendered  :
 * ```
 * const results = [
 *     add(5,' add', 3),  // note: 3 passed as an object to store as well
 *     subtract(5 , ' minus', 3 ),
 *     multiply(5  ,  'times', 3  ),
 *     divide(5  ,  ' divide by', 3   ),
 *     modulus(5   ,  ' modulo of', 3  )
 *   ].map((result => ( { ... result })) <li key={ index}>Result
 *      { index+1}: {{...result }}< /li> <<consolelog result>>  );
 * ```
 * 
 * @param { array } index - The `index` input parameter is used as a key to uniquely
 * identify each item being rendered by the map() method. This allows React to keep
 * track of the items being rendered and efficiently update or remove them as necessary.
 * Essentially ,the `index` parameter helps React manage the state of the list and
 * prevent unnecessary re-renders.
 */}
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
/**
 * @description This function calculates the sine of a given angle (a) using Math.sin()
 * and returns the result.
 * 
 * @param { number } a - The `a` input parameter is a numerical value that passes
 * through to the internal `Math.sin()` method and utilized for its intended mathematical
 * purposes.
 * 
 * @returns { number } This function uses the built-in `Math.sin()` method to calculate
 * and return the sine of a given angle `a`.  The output returned by this function
 * is simply the sine of `a`, which is calculated using `Math.sin()`.
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
