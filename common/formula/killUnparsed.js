export function killUnparsed(root, element, errorHandler, path) {
    errorHandler({
        type: "unable to parse",
        startChar: element.fromChar,
        endChar: element.toChar,
        comment: "Unable to parse \"" + element.value + "\""
    })
}