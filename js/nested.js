function outer() {
    console.log("Outer");

    function middle1() {
        console.log("Middle 1");

        function inner1() {
            console.log("Inner 1");

            function deep1() {
                console.log("Deep 1");
            }

            deep1();
        }

        inner1();
    }

    function middle2() {
        console.log("Middle 2");

        function inner2() {
            console.log("Inner 2");

            function deep2() {
                console.log("Deep 2");

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
