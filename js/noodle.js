/**
 * @description logs "Level 1" to the console and calls itself recursively multiple
 * times, with each recursive call logging a different level ("Level 2", "Level 3",
 * etc.) until the final call to `level6`, which logs "Level 6".
 */
function level1() {
    console.log("Level 1");
    
    /**
     * @description consists of a series of nested functions, each logging a different
     * level number to the console.
     */
    function level2() {
        console.log("Level 2");
        
        /**
         * @description consists of nested functions `level4`, `level5`, and `level6`. Each
         * function logs a message to the console representing its respective level number.
         * The `level6` function calls itself, then the `level5` function, followed by the
         * `level4` function before calling the `level3` function.
         */
        function level3() {
            console.log("Level 3");
            
            /**
             * @description logs "Level 4" to the console and then calls itself recursively three
             * times, logging "Level 5", "Level 6", and then "Level 6" again before returning.
             */
            function level4() {
                console.log("Level 4");
                
                /**
                 * @description logs "Level 5" to the console and calls itself recursively, logging
                 * "Level 6" to the console once more.
                 */
                function level5() {
                    console.log("Level 5");
                    
                    /**
                     * @description logs the message "Level 6" to the console.
                     */
                    function level6() {
                        console.log("Level 6");
                    }
                    
                    level6();
                }
                
                level5();
            }
            
            level4();
        }
        
        level3();
    }
    
    level2();
}

level1();
