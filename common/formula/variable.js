const regexVerifier = /^[A-Za-z_]+$/

export function applyVariables(root, element, errorHandler, path) {
    const text = element.value
    if (regexVerifier.test(text)) {
        pushWaiting(root, text, "variable", element.fromChar, element.toChar)
    } else {
        pushWaiting(root, text, "raw", element.fromChar, element.toChar)
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