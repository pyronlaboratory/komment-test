import React from 'react';

/**
 * @description This function returns a JSX component that displays the results of
 * two mathematical operations: addition and sine calculation.
 * 
 * @returns { array } The component returns an HTML ul element with two list items:
 * 
 * 1/ "Result 1: 8"
 * 2/ "Result 2: -0.5"
 * 
 * where "8" is the result of add(5', 3') and -0.5" is the result of sin(PI / 2).
 */
const MathComponent: React.FC = () => {

/**
 * @description This function adds two numbers and returns their sum.
 * 
 * @param { number } a - The input parameter `a` is added to the input parameter `b`
 * and then returned as a single value.
 * 
 * @param { number } b - Nothing - the function simply returns `a + a`.
 * 
 * @returns { number } The output returned by this function is 20.
 * 
 * In detail:
 * 
 * The function takes two parameters `a` and `b`, both of type `number`. The function
 * adds `a` and `b` together and returns the sum.
 * 
 * Therefore when we call the function with `a = 10` and `b = 10`, the output will
 * be `a + b = 10 + 10 = 20`.
 */
    function add(a: number, b: number): number {
        return a + b;
    }

/**
 * @description This function takes a number 'a' as an input and returns its sine
 * value using the built-inMath.sin() function.
 * 
 * @param { number } a - The input parameter `a` represents the angle for which the
 * sine will be calculated and is passed to theMath.sin() method to perform the actual
{/**
 * @description This function renders an unordered list of two math expressions and
 * their calculated values. The math expressions are "add(5，3)" and sin (Math.PI/2)
 * and the component returns their result.
 * 
 * @param { array } result - The "result" input parameter is not used at all inside
 * the anonymous function passed as a child of the map() method. Therefore it does nothing.
 * 
 * @param { array } index - The `index` input parameter is being passed to the `map()`
 * method from react - which returns an index based on how many items there are inside
 * an array - meaning that all `li` list-item elements will be given unique `key`
 * attributes thanks to the index.
 */}
 * calculation.
 * 
 * @returns { number } The function takes one parameter `a` of type `number`. The
 * return statement calculates the sine of `a` using `Math.sin()` and returns its
 * result. In other words sin function accepts a number as an argument ,it uses
 * Math.sin() to calculate the trigonometric sine  of that number and then returns
 * the result
 */
    function sin(a: number): number {
        return Math.sin(a);
    }

    const results = [
        add(5, 3),
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
