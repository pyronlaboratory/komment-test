import React from 'react';

/**
 * @description This React function component takes no props but renders an HTML
 * container with a header and a list of two "results" calculated by the add and sin
 * math functions respectively and labeled 1 and 2 respectively.
 * 
 * @returns { object } This component takes a mathematical expression as input and
 * evaluates it to produce a set of results that are displayed on a web page using ReactJS
 * The result set has two elements one being addition of '5' & '3'(i.e., 8) , the
 * other is the sin (pi/2), which approximately equals 1.752568471
{/**
 * @description This React functional component (MathComponent) defines two mathematical
 * functions (add and sin), executes them with specified arguments to generate two
 * output values; stores these output values within an array called results and then
 * uses React’s map method to list each result item inside an unordered list of “li”
 * (list items).
 * 
 * @param { number } result - In the `add` and `sin` functions provided within the
 * return of MathComponent component - each respective parameter(being 'a' within add
 * or not null at index 0 and also null at index 1 within sin respectively), when
 * provided is completely ignored and instead react passes its value through. That's
 * why if you hardcoded numbers like `5`, `3`, or `Math.PI/2` these values aren't
 * manipulated with within that respective functions; no type casting has been applied
 * - those input parameter functions accept only the primitive `number`. It can thus
 * be seen as essentially pointless when given actual math operators are being passed.
 * Essentially what we see is pure React component function  that takes array of some
 * data.
 * 
 * @param { number } index - The input parameter `index` is passed as a key to each
 * item inside the list produced by `results.map()`. This uniquely identifies each
 * li element and aids virtual DOM optimization. It enables React to correctly maintain
 * the state of the items when items are added or deleted from the array.
 */}
 * Therefore concisely: Output returned is [8,"1.752568471"].
 */
const MathComponent: React.FC = () => {
    function add(a: number, b: number): number {
        return a + b;
    }
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
