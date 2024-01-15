enum RoundResult { WIN, LOSS, DRAW }
enum Shape { ROCK, PAPER, SCISSORS }

/**
* @description This function takes a string input and returns a shape object based
* on the value of the string. The shapes are represented by letters: "A" for ROCK ,
* "B" for PAPER and "C" for SCISSORS .
* 
* @param { string } str - The `str` input parameter is a string that is passed to
* the function and used as a key to determine which Shape object to return based on
* a switch statement.
* 
* @returns { Shape } The output of this function is an instance of the `Shape` enum
* based on the input string.
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
* @description This function takes a string `str` and returns a `Shape` value based
* on the lowercased letter of the string.
* 
* @param { string } str - The `str` input parameter is a string that is used to
* determine which shape the function should return based on the value of the string.
* 
* @returns { Shape } The output returned by this function is an instance of the
* `Shape` class depending on the string parameter provided. It either returns
* `Shape.ROCK`, `Shape.PAPER`, or `Shape.SCISSORS`.
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
* @description This function takes a "strategy guide" as a string and calculates the
* total score for that strategy guide.
* 
* @param { string } strategyGuide - The `strategyGuide` input parameter is a string
* that contains a guide for choosing the next move based on the current round's shape
* choices. It consists of multiple rows of the form "opponent's shape: my shape",
* where each row represents one possible combination of shapes.
* 
* @returns { number } The function takes a string representing a list of rounds
* played against an opponent using the following rules:
* 
* 	- ROCK beats SCISSORS
* 	- SCISSORS beats PAPER
* 	- PAPER beats ROCK
* 
* The function returns the total score for the player who provided the strategy guide.
*/
export const totalScoreWith = (strategyGuide: string) => {
/**
* @description This function splits a `strategyGuide` string into an array of rows
* (lines), filters out empty lines (`""`), and returns the resulting array of non-empty
* lines.
* 
* @param { string } roundRow - In this code snippet `$roundRow` is a parameter passed
* to the `.filter()` method. It's used as a filter function that only returns elements
* (rows) if they are not empty strings. In other words roundRow checks if the current
* row is empty or not.
*/
/**
* @description This function splits a string of rows (a strategy guide) into an array
* of arrays containing opponent shapes and player shapes using the split method and
* then maps over each row to return an array of two shapes (opponent shape and player
* shape) from each row.
* 
* @param { string } roundRow - The `roundRow` input parameter is an array of strings
* representing each row of the game board. The function splits each row into two
* parts: one representing the opponent's shape and the other representing the player's
* shape.
* 
* @returns { array } This function takes a `strategyGuide` string as input and splits
* it into an array of rows. It then filters out any empty rows and maps each remaining
* row to an array of two shapes (one for the opponent and one for the player).
*/
/**
* @description This function takes a `strategyGuide` string representing a guide for
* a player to choose their move based on their opponent's move (a sequence of shapes),
* and returns an array of arrays containing the current round's shape and result for
* both players.
* 
* @param { string } opponentShape,myShape - The `opponentShape` and `myShape`
* parameters are used to determine the current round's result based on the shapes
* played by both players.
* 
* @returns { array } This function takes a `strategyGuide` string as input and returns
* an array of `[Shape (rock/paper/scissors), RoundResult (win/loss/draw)]` pairs.
* The `RoundResult` is determined based on the opponent's shape and the user's shape
* using a switch statement.
*/
    return strategyGuide
        .split("\n")
        .filter((roundRow) => roundRow !== "")
/**
* @description This function takes a `strategyGuide` string as input and returns an
* array of objects containing the following information for each round:
* 
* 	- The shape chosen by the player (either 'ROCK', 'PAPER', or 'SCISSORS')
* 	- The round result (either 'WIN', 'DRAW', or 'LOSS')
* 	- The number of points earned for that round.
* 
* @param { array } myShape,roundResult - The `myShape` and `roundResult` parameters
* are the input values for each round of the game.
* 
* `myShape` is a `Shape` value representing the player's chosen shape for that round.
* 
* `roundResult` is an `RoundResult` value indicating whether the player won (1),
* drew (2), or lost (-1) that round based on their `myShape` and the opponent's shape.
* 
* @returns { object } The function takes a `strategyGuide` string as input and returns
* an array of `RoundResult` objects representing the outcome of each round of the
* game. Each `RoundResult` object has two properties: `myShape` representing the
* shape chosen by the player (rock/paper/scissors), and `roundResult` representing
* the result of the round (win/draw/loss).
* 
* The function first splits the input string into rows separated by newlines. It
* then filters out empty rows and maps each row to an array of two shapes (opponent's
* shape and player's shape) and their corresponding round result based on the given
* strategy guide. Finally., it maps each [shape pair and round result] to the sum
* of points for that round based on the shape chosen by the player.
* 
* In conclusion.
*/
        .map((roundRow: string) => {
            const [opponentShape, myShape] = roundRow.split(' ')
            return [opponentShapeFrom(opponentShape), myShapeFrom(myShape)] as [Shape, Shape]
        })
        .map(([opponentShape, myShape]: [Shape, Shape]) => {
/**
* @description This function implements a simple rock-paper-scissors game logic.
*/
/**
* @description This function takes a string representation of a rock-paper-scissors
* game and returns the total points won by the player.
* 
* @param { number } acc - The `acc` input parameter is the accumulator for the
* reducing function. It is used to keep track of the running total of points earned
* so far.
* 
* @param { number } points - The `points` input parameter is the accumulator for the
* current player's score. It is used to keep track of the current player's points
* as the game progresses. At each iteration of the `map` method within the `reduce`
* method invocation cycle:
* 
* - After mapping and filtering the opponent row(array) into individual [shape/rock
* or paper/ scissors], a new list is created with [my shape( rock or paper)/scissors]
* (the next iteration/turn).
*   This is to represent different opponent shapes; my opponent and the current
* player can either play. At this step
*    each [result / outcomes:win , draw ,loss or points obtained]. Here points have
* two uses :
* 1/ It provides a total sum point as a running accumulator of scores as at the round
* (current and previous one(s)), this will enable computing an actual cumulative
* total for all winning/drawn outcome/ games played
* 2/ Point serves as a score holder to return from map inside the final outer loop.
* The returned type should always match type definitions inside the expected array
* signature/parameter of next iteration at current player's next game with their
* corresponding opponent
* This way at the very end point reduces (with no risk) any possible previous
* cumulative point result to actual outcomes  which points are a representation for
* as explained under (1), above; then it adds such point total value.
*/
            const roundResult = (() => {
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
* @description This function takes the `myShape` variable and returns its corresponding
* value from the `Shape` enum (either 1 for ROCK/SCISSORS or 2 for PAPER).
*/
            const myShapePoints = (() => {
                switch (myShape) {
                    case Shape.ROCK: return 1
                    case Shape.PAPER: return 2
                    case Shape.SCISSORS: return 3
                }
            })()
/**
* @description This function takes the `roundResult` parameter and returns a number
* based on the result of the round.
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
