function calculate(type, firstNumber, secondNumber) {
    const throwError = message => throw new Error(message)
    const createResult = (type, result) => {type, result}
    let result;
    switch(type) {
        case "sub" : 
            result = 
                firstNumber - secondNumber
            break
        case "add" : 
            result = 
                firstNumber + secondNumber
            break
        case "div" : 
            result = 
                firstNumber / secondNumber
            break
        case "mult" : 
            result = 
                firstNumber * secondNumber
            break
        default :
            return 
                createResult( "error", "There was an error, you did not input an appropriate type, please input 'sub' for substraction, 'add' for an addition, 'div' for a division and 'mult' for a multiplication")
    }
    if (typeof result !== "number")
        throwError("not a number")
    else
        return createResult(type, result)
}
