import React from 'react';

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
