export function applypourcent(root, errorHandler, path) {
    if (root.length > 1) {
        for (let i = 1; i < root.length; i++) {
            const element = root[i]
            const lastElement = root[i-1]
            if (element.type == "round bracket" && lastElement.type == "operator" && lastElement.value == "!") {
                root.splice(i-1, 2, {
                    type: "function call",
                    value: [
                        {
                            type: "function reference",
                            value: [{
                                type: "variable",
                                value: "INTERNAL_POURCENT",
                                fromChar: lastElement.fromChar,
                                toChar: lastElement.toChar
                            }],
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