import { applyString } from "./formula/string.js"
import { applyBrackets } from "./formula/brackets.js"

/**
 * Parse a function
 * @param {String} code - string to parse
 * @returns {SheetFuction}
 */
export function functionParse(code) {
    let tree = [{
        type: "raw",
        value: code,
        fromChar: 0,
        toChar: code.length - 1
    }]
    const containers = [
        ["round bracket"],
        ["square bracket"],
        ["curly bracket"]
    ]

    let error = null
    const errorHandler = newError => error ??= newError

    exitParsing: {
        // parse strings
        tree = mapToken(tree, containers, applyString, errorHandler)
        if (error) break exitParsing

        // parse brackets
        tree = mapToken(tree, containers, applyBrackets, errorHandler)
        if (error) break exitParsing

        // TODO: next parsers to add
    }

    return {
        error: !!error,
        def: error ?? tree
    }
}

// Get giver element of array recursivity from list of index
function setActualFromIndexList(root, numList) {
    let actual = root
    for (let index = 0; i < numList.length - 1; i++) {
        const num = numList[index]
        actual = actual[num].value
    }
    return actual
}

// Get last element of array recursivity
function setActualFromDepth(root, depth) {
    let actual = root
    for (let index = 0; i < depth; i++) {
        actual = actual[actual.length - 1].value
    }
    return actual
}

/**
 * Error handler
 * @callback ErrorHandler
 * @param {FunctionParseError} error - give an error or null for read
 * @returns {FunctionParseError} given error or null
 */

/**
 * Syntax part parser
 * @callback SyntaxePartParser
 * @param {FunctionExpression[]} root  - list where to add new parsed elements, also contain old parsed elements
 * @param {FunctionExpression} element - raw expression to parse
 * @param {ErrorHandler} errorHandler  - error handler 
 * @param {Number[]} path - element position
 */

/**
 * Syntax group parser
 * @callback SyntaxePartParserFinal
 * @param {FunctionExpression[]} root  - list of elements to parse or modify
 * @param {ErrorHandler} errorHandler  - error handler 
 * @param {Number[]} path - group position
 */

/**
 * Apply function to recursively parse element
 * @param {FunctionExpression[]} root - expressions tu parse
 * @param {String[]} containers - list of containers type
 * @param {SyntaxePartParser} func - function to use for parsing
 * @param {ErrorHandler} errorHandler - error handler
 * @param {SyntaxePartParserFinal} finaliser - function to use at end of parsing
 * @returns {FunctionExpression[]} - parsed expressions
 */
function mapToken(root, containers, func, errorHandler, finaliser) {
    let actual = root
    let indexList = [0]
    const depth = () => indexList.length-1
    const index = () => indexList.at(-1)

    let newDepth = 0
    let newRoot = []
    let newActual = newRoot

    while (depth() != 0 || index() != root.length) {
        const element = actual[index()]
        if (index() == actual.length) {
            indexList.pop()
            finaliser?.(newActual, errorHandler, Array.from(indexList))
            indexList[depth()]++
            actual = setActualFromIndexList(root, indexList)
            newActual = setActualFromDepth(newRoot, --newDepth)
        } else if (containers.includes(element.type)) {
            newActual.push({
                type: element.type,
                value: [],
                fromChar: element.fromChar,
                toChar: element.toChar
            })
            newActual = setActualFromDepth(newRoot, ++newDepth)
            indexList.push(0)
            actual = setActualFromIndexList(root, indexList)
        } else if (element.type == "raw") {
            func(newActual, element, errorHandler, Array.from(indexList))
            if (errorHandler()) return
            indexList[depth()]++
        } else {
            newActual.push(element)
            indexList[depth()]++
        }
    }

    indexList.pop()
    finaliser?.(newActual, errorHandler, Array.from(indexList))

    return newRoot
}

console.log(
functionParse(
`POW(1+4 & "test" &A1)`
))