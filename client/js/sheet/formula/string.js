export function applyString(root, element, errorHandler) {
    const text = element.value
    
    // constants
    const typeName = "string"
    const escapeChar = "\\"
    const bracket = "\""

    let inString = false // is reader inside a string
    let escaped = false  // last caracter is escape caracter
    let tmpValue = ""    // store temporary characters

    let startText = element.fromChar
    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const index = element.fromChar + i

        if (inString) {
            if (escaped) {
                if (char == "n") {
                    tmpValue += "\n"
                } else if (char == "t") {
                    tmpValue += "\t"
                } else if (char == escapeChar) {
                    tmpValue += escapeChar
                } else if (char == bracket) {
                    tmpValue += bracket
                } else {
                    errorHandler({
                        type: "unescapable caracter",
                        startChar: index,
                        endChar: index+1,
                        comment: "Caracter \"" + char + "\" is not escapable"
                    })
                    return
                }
                escaped = false
            } else {
                if (char == escapeChar) {
                    escaped = true
                } else if (char == bracket) {
                    pushWaiting(root, tmpValue, typeName, startText, index)
                    tmpValue = ""
                    startText = index+1
                    inString = false
                } else {
                    tmpValue += char
                }
            }
        }
        else {
            if (char === bracket) {
                pushWaiting(root, tmpValue, "raw", startText, index-1)
                tmpValue = ""
                startText = index
                inString = true
            } else {
                tmpValue += char
            }
        }
    }

    pushWaiting(root, tmpValue, "raw", startText, element.toChar)
    tmpValue = ""

    if (inString)
        errorHandler({
            type: "string not closed",
            startChar: startText,
            endChar: element.toChar,
            comment: "Last string is not closed"
        })
}

function pushWaiting(root, value, typeName, fromChar, toChar) {
    root.push({
        type: typeName,
        value: value,
        fromChar: fromChar,
        toChar: toChar
    })
}