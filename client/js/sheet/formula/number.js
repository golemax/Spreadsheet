const regexVerifier = /^[A-Za-z]+[1-9][0-9]*$/

export function applyNumber(root, element, errorHandler, path) {
    const text = element.value
    const num = Number(text)
    if (isNaN(num)) {
        pushWaiting(root, text, "raw", element.fromChar, element.toChar)
    } else {
        pushWaiting(root, num, "number", element.fromChar, element.toChar)
    }
}

function pushWaiting(root, value, typeName, fromChar, toChar) {
    root.push({
        type: typeName,
        value: value,
        fromChar: fromChar,
        toChar: toChar
    })
}