export function applyFunctionCalls(root, errorHandler, path) {
    if (root.length > 1) {
        const preFunctionElements = [
            "function",
            "variable",
            "round bracket",
            "square bracket"
        ]
        for (let i = 1; i < root.length; i++) {
            const element = root[i]
            const lastElement = root[i-1]
            if (element.type == "round bracket" && preFunctionElements.includes(lastElement.type)) {
                root.splice(i-1, 2, {
                    type: "function call",
                    value: [
                        {
                            type: "function reference",
                            value: [lastElement],
                            fromChar: lastElement.fromChar,
                            toChar: lastElement.toChar
                        },{
                            type: "function arguments",
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