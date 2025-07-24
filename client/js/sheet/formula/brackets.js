/**
 * @type {Array} bracketList
 * @property {String} [0] - opening bracket
 * @property {String} [1] - closing bracket
 * @property {String} [2] - bracket name
 */
const brackets = [
        ["(", ")", "round"],
        ["[", "]", "square"],
        ["{", "}", "curly"]
    ]

// use index of bracket from bracketList
let bracketsRegister = []
let oldPath = []

export function applyBrackets(root, element, errorHandler, path) {
    const text = element.value

    path.pop()
    if (oldPath.toString() != path.toString()) {
        if (bracketsRegister.length == 0) {
            oldPath = path
        } else {
            errorHandler({
                type: "unclosed bracket",
                startChar: 0, //TODO
                endChar: element.fromChar - 1,
                comment: (bracketsRegister.length == 1 ? "A bracket is" : "Multiples brackets are") + " not closed"
            })
            return
        }
    }

    let tmpValue = ""

    let startText = element.fromChar
    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const index = element.fromChar + i
        
        let hadBracket = false
        for (const bracket of brackets) {
            const openBracket = bracket[0]
            const closeBracket = bracket[1]
            const bracketName = bracket[2] + " bracket"
            const openBracketName = "open " + bracketName

            if (char === openBracket) {
                hadBracket = true
                if (tmpValue !== "")
                    pushWaiting(root, tmpValue, "raw", startText, index-1)
                pushWaiting(root, "(", openBracketName, index, index)
                tmpValue = ""
                startText = index+1
                bracketsRegister.push(bracketName)
                break

            } else if (char === closeBracket) {
                hadBracket = true
                if (bracketsRegister.length == 0 || bracketsRegister.at(-1) != bracketName) {
                    errorHandler({
                        type: "not opened bracket",
                        startChar: 0, //TODO
                        endChar: element.fromChar,
                        comment: (bracketsRegister.length == 1 ? "A bracket is" : "Multiples brackets are") + "not closed"
                    })
                    return
                } else {
                    if (tmpValue !== "")
                        pushWaiting(root, tmpValue, "raw", startText, index-1)
                    tmpValue = ""
                    startText = index+1

                    const internalRoot = []
                    let backwardElement = root.pop()
                    while (backwardElement != undefined) {
                        if (backwardElement.type == openBracketName) {
                            pushWaiting(root, internalRoot, bracketName, backwardElement.fromChar, index)
                            break
                        } else {
                            internalRoot.unshift(backwardElement)
                        }
                        backwardElement = root.pop()
                    }
                }
            }
        }
        if (!hadBracket)
            tmpValue += char
    }

    if (tmpValue !== "")
        pushWaiting(root, tmpValue, "raw", startText, element.toChar)
}

function pushWaiting(root, value, typeName, fromChar, toChar) {
    root.push({
        type: typeName,
        value: value,
        fromChar: fromChar,
        toChar: toChar
    })
}