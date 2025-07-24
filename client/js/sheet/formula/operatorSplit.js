export function applyOperatorSplit(root, element, errorHandler, path) {
    const operators = [
        "+",
        "-",
        "=",
        "*",
        "/",
        "|",
        "&",
        "#",
        "!",
        ";",
        "%",
        ">",
        "<",
        ":",
        "^",
        "~",
        "!"
    ]

    const separator = [
        " ",
        "\n"
    ]

    const text = element.value
    let tmpValue = ""

    let startText = element.fromChar
    for (let i = 0; i < text.length; i++) {
        const char = text[i]
        const index = element.fromChar + i

        if (separator.includes(char) || operators.includes(char)) {
            if (tmpValue !== "")
                pushWaiting(root, tmpValue, "raw", startText, index-1)
            tmpValue = ""
            startText = index+1
            if (operators.includes(char)) {
                pushWaiting(root, char, "operator", index, index)
            }
        } else {
            tmpValue += char
        }
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