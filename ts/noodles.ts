/**
 * @description calls `middleFunction`, which then calls `innerFunction`. The
 * `innerFunction` function takes a boolean parameter and logs its value, then calls
 * `deepestFunction` with an array of numbers.
 * 
 * @param { number } outerParam - 1st parameter passed to the outer function, which
 * is being logged with its value using console.log() statement inside the outer function.
 */
function outerFunction(outerParam: number): void {
    console.log("Outer function started with parameter:", outerParam);

    /**
     * @description calls an inner function, which in turn calls a deepest function,
     * passing various parameters. The inner and deepest functions log their starts and
     * ends to the console.
     * 
     * @param { string } middleParam - 3rd parameter passed to the `innerFunction` function,
     * which is then logged with its value using `console.log()`.
     */
    function middleFunction(middleParam: string): void {
        console.log("Middle function started with parameter:", middleParam);

        /**
         * @description calls the `deepestFunction` function with a parameter of type `number[]`.
         * The `deepestFunction` function logs messages to the console before ending.
         * 
         * @param { boolean } innerParam - boolean value passed to the inner function, which
         * is then logged to the console upon entry into the inner function.
         */
        function innerFunction(innerParam: boolean): void {
            console.log("Inner function started with parameter:", innerParam);

            /**
             * @description logs "Deepest function started with parameter" followed by a list of
             * numbers, and then logs "Deepest function ended".
             * 
             * @param { number[] } deepestParam - deepest level of a recursive function call, as
             * it is passed as an array of numbers to the `deepestFunction` function.
             */
            function deepestFunction(deepestParam: number[]): void {
                console.log("Deepest function started with parameter:", deepestParam);
                console.log("Deepest function ended");
            }

            deepestFunction([1, 2, 3]);
        }

        innerFunction(true);
        innerFunction(false);

        console.log("Middle function ended");
    }

    middleFunction("Middle parameter value");

    console.log("Outer function ended");
}

outerFunction(5);
