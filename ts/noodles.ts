function outerFunction(outerParam: number): void {
    console.log("Outer function started with parameter:", outerParam);

    function middleFunction(middleParam: string): void {
        console.log("Middle function started with parameter:", middleParam);

        function innerFunction(innerParam: boolean): void {
            console.log("Inner function started with parameter:", innerParam);

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
