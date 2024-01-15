enum RoundResult { WIN, LOSS, DRAW }
enum Shape { ROCK, PAPER, SCISSORS }

const opponentShapeFrom = (str: string): Shape => {
    switch (str) {
        case "A": return Shape.ROCK
        case "B": return Shape.PAPER
        case "C": return Shape.SCISSORS
        default: throw Error("Cannot map shape from " + str)
    }
}
const myShapeFrom = (str: string): Shape => {
    switch (str) {
        case "X": return Shape.ROCK
        case "Y": return Shape.PAPER
        case "Z": return Shape.SCISSORS
        default: throw Error("Cannot map shape from " + str)
    }
}

export const totalScoreWith = (strategyGuide: string) => {
    return strategyGuide
        .split("\n")
        .filter((roundRow) => roundRow !== "")
        .map((roundRow: string) => {
            const [opponentShape, myShape] = roundRow.split(' ')
            return [opponentShapeFrom(opponentShape), myShapeFrom(myShape)] as [Shape, Shape]
        })
        .map(([opponentShape, myShape]: [Shape, Shape]) => {
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
            const myShapePoints = (() => {
                switch (myShape) {
                    case Shape.ROCK: return 1
                    case Shape.PAPER: return 2
                    case Shape.SCISSORS: return 3
                }
            })()
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
