/**
 * @description calls two nested functions, `middle1` and `middle2`, each of which
 * calls another nested function, `inner1`, `inner2`, and `deeper`, respectively.
 * Each nested function logs a message to the console.
 */
function outer() {
    console.log("Outer");

    /**
     * @description calls `inner1`, which then calls `deep1`. The output is "Deep 1".
     */
    function middle1() {
        console.log("Middle 1");

        /**
         * @description logs "Inner 1" to the console and then calls the nested function
         * `deep1`, which logs "Deep 1".
         */
        function inner1() {
            console.log("Inner 1");

            /**
             * @description logs the message "Deep 1" to the console.
             */
            function deep1() {
                console.log("Deep 1");
            }

            deep1();
        }

        inner1();
    }

    /**
     * @description calls `inner2`, which in turn calls `deep2`. `Deep2` then calls
     * `deeper`, and finally `deeper` logs "Deeper".
     */
    function middle2() {
        console.log("Middle 2");

        /**
         * @description calls a nested function `deep2`, which in turn calls another nested
         * function `deeper`. The `deeper` function logs the message "Deeper" to the console
         * before returning.
         */
        function inner2() {
            console.log("Inner 2");

            /**
             * @description logs "Deep 2" and then calls a nested function `deeper`, which logs
             * "Deeper".
             */
            function deep2() {
                console.log("Deep 2");

                /**
                 * @description logs the message "Deeper" to the console.
                 */
                function deeper() {
                    console.log("Deeper");
                }

                deeper();
            }

            deep2();
        }

        inner2();
    }

    middle1();
    middle2();
}

outer();
