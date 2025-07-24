const util = await import("../../util.js")

const regexVerifier = /^[A-Za-z]+[1-9][0-9]*$/

export function applyA1(root, element, errorHandler, path) {
    const text = element.value
    if (regexVerifier.test(text)) {
        const range = util.A1toRangeObject(text)
        pushWaiting(root, [range.startColumn, range.startRow], "cell reference", element.fromChar, element.toChar)
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