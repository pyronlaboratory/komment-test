import React from 'react';

/**
 * @description This is a functional component for a web application written with
 * React (the library) which has two functions as local imports named `add` and `sin`,
 * these add two parameters and calculate the sin of one number respectively. The two
 * function calls are then added to an array alongside their results to create a map
 * within a list within an unordered list to render on screen and be viewable to users.
 * 
 * @returns { array } This function takes no arguments and returns a JSX component
 * that displays the results of two mathematical operations: adding 5 and 3 and
 * computing the sine of Pi/2. The output will be a list of two elements: "Result 1:
{/**
 * @description This React Function Component generates an HTML list with the values
 * of two mathematical functions applied to a set of numbers. It imports React from
 * 'react'; defines the function components add and sin which apply their respective
 * mathematical operations to parameters and returns the results inside a data array
 * of JavaScript objects .
 * 
 * @param { number } result - The input parameter result within the map function seems
 * to be the output of previous calculated value before moving on to the next step.
 * 
 * @param { object } index - The `index` input parameter is used to uniquely identify
 * each list element to be rendered and assigned a key so that React knows how to
 * reorder or remove items within that list efficiently when rendering components;
 * it can also help debugging by displaying an order-dependent ID with items instead
 * of only their value.
 */}
 * 8" and "Result 2: -1."
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
