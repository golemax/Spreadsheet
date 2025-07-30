export function applyFunctions(root, errorHandler, path) {
    const separator = ";"

    if (root.length > 1) {
        for (let i = 1; i < root.length; i++) {
            const element = root[i]
            const lastElement = root[i-1]
            if (element.type == "curly bracket" && lastElement.type == "round bracket") {
                const headers = []
                let div = true // alternate between argument name and separator
                for (let headIndex = 0; headIndex < lastElement.value.length; headIndex++) {
                    const head = lastElement.value[headIndex]
                    if (div && head.type == "variable") {
                        headers.push(head.value)
                        div = !div
                    } else if (headIndex == lastElement.value.length-1 && head.type == "operator" && head.value == separator) {
                        errorHandler({
                            type: "function header malformed",
                            startChar: lastElement.value.at(-1).fromChar,
                            endChar: lastElement.value.at(-1).toChar,
                            comment: "end with separator"
                        })
                    } else if (!div && head.type == "operator" && head.value == separator) {
                        // separator
                        div = !div
                    } else if (head.type == "variable") {
                        errorHandler({
                            type: "function header malformed",
                            startChar: lastElement.value[headIndex-1].toChar,
                            endChar: head.fromChar,
                            comment: "missing separator \"" + separator + "\""
                        })
                    } else if (headIndex == 0 && head.type == "operator" && head.value == separator) {
                        errorHandler({
                            type: "function header malformed",
                            startChar: head.fromChar,
                            endChar: head.toChar,
                            comment: "start with a separator"
                        })
                    } else if (headIndex != 0 && head.type == "operator" && head.value == separator) {
                        errorHandler({
                            type: "function header malformed",
                            startChar: lastElement.value[headIndex-1].toChar,
                            endChar: head.fromChar,
                            comment: "two consecutive separators"
                        })
                    } else {
                        errorHandler({
                            type: "function header malformed",
                            startChar: head.fromChar,
                            endChar: head.toChar,
                            comment: "invalid value in header"
                        })
                    }
                }

                root.splice(i-1, 2, {
                    type: "function declaration",
                    value: [
                        {
                            type: "function header",
                            value: headers,
                            fromChar: lastElement.fromChar,
                            toChar: lastElement.toChar
                        },{
                            type: "function body",
                            value: element.value,
                            fromChar: element.fromChar,
                            toChar: element.toChar
                        }
                    ],
                    fromChar: lastElement.fromChar,
                    toChar: element.toChar
                })
            }
        }
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