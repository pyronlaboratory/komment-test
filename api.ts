enum RoundResult { WIN, LOSS, DRAW }
enum Shape { ROCK, PAPER, SCISSORS }

/**
* @description This function takes a string `str` as input and returns a `Shape`
* object based on the value of `str`. The possible values for `str` are "A", "B",
* or "C", which map to `Shape.ROCK`, `Shape.PAPER`, and `Shape.SCISSORS`, respectively.
* 
* @param { string } str - The `str` input parameter is a string that is passed to
* the function and used to determine which shape should be returned based on its value.
* 
* @returns { Shape } The function takes a string input and returns one of three
* shapes (ROCK`, `PAPER`, or `SCISSORS) based on the input value.
*/
const opponentShapeFrom = (str: string): Shape => {
    switch (str) {
        case "A": return Shape.ROCK
        case "B": return Shape.PAPER
        case "C": return Shape.SCISSORS
        default: throw Error("Cannot map shape from " + str)
    }
}
/**
* @description This function takes a string `str` as input and returns a `Shape`
* object based on the value of `str`. It does this by using a switch statement to
* map the string to one of three possible shapes (`ROCK`, `PAPER`, or `SCISSORS`).
* 
* @param { string } str - The `str` input parameter is a string that is used to
* determine which shape the function should return based on the value of the string.
* 
* @returns { Shape } This function takes a string `str` as input and returns a `Shape`
* object based on the value of `str`. The function uses a switch statement to map
* the string values "X", "Y", and "Z" to the corresponding `Shape` objects `Shape.ROCK`,
* `Shape.PAPER`, and `Shape.SCISSORS`, respectively. If the input string is not one
* of these values (i.e., it is "default"), the function throws an `Error`.
* 
* The output returned by this function is an instance of the `Shape` class that
* corresponds to the input string.
*/
const myShapeFrom = (str: string): Shape => {
    switch (str) {
        case "X": return Shape.ROCK
        case "Y": return Shape.PAPER
        case "Z": return Shape.SCISSORS
        default: throw Error("Cannot map shape from " + str)
    }
}

/**
* @description This function calculates the total score for a game of rock-paper-scissors
* based on a strategy guide provided as a string. It parses the strategy guide into
* an array of round results and computes the score for each round based on the shapes
* chosen by the player and the computer.
* 
* @param { string } strategyGuide - The `strategyGuide` input parameter is a string
* that contains the rules for determining the computer's moves. It is split into
* rows and each row is split into two shapes.
* 
* @returns { number } The output returned by the function `totalScoreWith` is a
* single number representing the total score of the game after each round. The score
* is calculated by adding the points earned for each round based on the shapes chosen
* by both players.
* 
* The function first splits the strategy guide into an array of rows. Each row is
* then split into two shape names (opponent's and player's) and the resulting arrays
* are mapped to the appropriate round results and scores.
*/
export const totalScoreWith = (strategyGuide: string) => {
/**
* @description This function splits the `strategyGuide` string into an array of rows
* (separated by newline characters), filters out any empty rows (using the `===`
* operator to check for emptiness), and returns the filtered array.
* 
* @param { string } roundRow - In this context `roundRow` is a reference to each
* line of the `strategyGuide` string broken into individual lines via the split
* method. The filter method calls for all elements (lines) that are not empty and
* hence only including non-empty lines of `strategyGuide`.
*/
/**
* @description This function splits a string of rounds into an array of shapes
* (represented as strings) for both the player and opponent and converts those shapes
* into objects using respective `opponentShapeFrom` and `myShapeFrom` functions to
* get their corresponding types (`Shape`); it then returns the two converted shapes
* (one representing the player's shape and one representing the opponent's shape)
* as a tuples of Shape type.
* 
* @param { string } roundRow - In this function `roundRow` is an array of strings
* that represent a single round of the game.
* 
* @returns { array } The output of this function is an array of arrays containing
* two elements: [opponentShapeFrom(opponentShape), myShapeFrom(myShape)] for each
* round row.
* 
* Here's a breakdown of the output:
* 
* 	- Each element of the output array is an array of two Shape objects:
* [opponentShapeFrom(opponentShape), myShapeFrom(myShape)].
* 	- Each opponentShape object represents the shape of the opponent's army at a
* particular round.
* 	- Each myShape object represents the shape of your army at a particular round.
*/
/**
* @description This function takes a string representation of a strategy guide for
* the game Rock-Paper-Scissors and converts it into an array of
* [Shape](https://developer.mozilla.org/en-US/docs/Gaming/Rock-Paper-Scissors_algorithm)
* and [RoundResult](https://developer.mozilla.org/en-US/docs/Gaming/Rock-Paper-Scissors_algorithm)
* tuples.
* 
* @param { string } opponentShape,myShape - The `opponentShape`, `myShape` parameters
* are the two shapes played by the player and their opponent respectively.
* 
* @returns { array } The output of this function is an array of arrays with two
* elements each: the first element is a `Shape`, and the second element is a
* `RoundResult`. Each sub-array represents one round of the game.
*/
    return strategyGuide
        .split("\n")
        .filter((roundRow) => roundRow !== "")
        .map((roundRow: string) => {
/**
* @description This function takes a string representing a series of rounds of the
* rock-paper-scissors game (with each round represented as "opponent shape score",
* where "shape" is either "rock", "paper", or "scissors" and "score" is either 1 for
* a win or 0 for a loss), splits it into individual rounds using regular expressions
* and switch statements to determine the outcome of each round based on the two
* shapes played (winning combinations are rock-paper and paper-scissors), returns a
* two-dimensional array with shape and result for each round where myShape is one
* of rock/paper/scissors and roundResult is either WIN/LOSS/DRAW). Finally.
* 
* @param {  } myShape,roundResult - The `myShape` and `roundResult` parameters are
* the output values of the function that is being map-ified.
* 
* @returns { array } The function takes a string representing a list of rows of the
* form "opponent shape space my shape", where each row corresponds to a round of the
* game. It splits the input into individual rounds and applies a set of switch
* statements to determine the winner of each round based on the shapes chosen by
* both players. The output is an array of arrays of shape points and round points
* for each round.
*/
            const [opponentShape, myShape] = roundRow.split(' ')
            return [opponentShapeFrom(opponentShape), myShapeFrom(myShape)] as [Shape, Shape]
        })
        .map(([opponentShape, myShape]: [Shape, Shape]) => {
/**
* @description This function determines the outcome of a rock-paper-scissors game
* based on the opponent's shape and the user's shape.
*/
            const roundResult = (() => {
/**
* @description This function takes a string representing a round of a rock-paper-scissors
* game (where each row is one player's choice and the first letter of each space
* separates the two choices), and returns the number of points earned by that player
* based on their choice and the opponent's choice.
* 
* @param { number } acc - In the provided function `strategyGuide`, `acc` is an
* accumulator parameter used to keep track of the running total points. It's initialized
* to 0 and then incremented (added to) during each iteration of the map operation
* within the function.
* 
* @param { number } points - The `points` input parameter is the accumulator for the
* points collected so far. It starts at 0 and gets updated within each iteration of
* the map() function by adding the point value corresponding to the current round
* result (either 6 for a win or 3 for a draw).
*/
                switch ([opponentShape, myShape]) {
                    case [Shape.ROCK, Shape.PAPER]: return RoundResult.WIN
                    case [Shape.ROCK, Shape.SCISSORS]: return RoundResult.LOSS

                    case [Shape.PAPER, Shape.SCISSORS]: return RoundResult.WIN
                    case [Shape.PAPER, Shape.ROCK]: return RoundResult.LOSS

                    case [Shape.SCISSORS, Shape.ROCK]: return RoundResult.WIN
                    case [Shape.SCISSORS, Shape.PAPER]: return RoundResult.LOSS

                    default: return RoundResult.DRAW
                }
            })()
            return [myShape, roundResult] as [Shape, RoundResult]
        })
        .map(([myShape, roundResult]: [Shape, RoundResult]) => {
/**
* @description This function takes no arguments and returns a value based on the
* current value of the "myShape" variable.
*/
            const myShapePoints = (() => {
                switch (myShape) {
                    case Shape.ROCK: return 1
                    case Shape.PAPER: return 2
                    case Shape.SCISSORS: return 3
                }
            })()
/**
* @description The function takes the `roundResult` parameter and returns a value
* based on the result of the round. It uses a switch statement to map different
* values of `roundResult` to specific returns.
*/
            const roundPoints = (() => {
                switch (roundResult) {
                    case RoundResult.WIN: return 6
                    case RoundResult.DRAW: return 3
                    case RoundResult.LOSS: return 0
                }
            })()
            return myShapePoints + roundPoints
        })
        .reduce((acc, points) => acc += points, 0)
}
