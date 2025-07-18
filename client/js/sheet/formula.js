/**
 * Parse a function
 * @param {String} str - string to parse
 * @returns {SheetFuction}
 */
export function functionParse(str) {
    // https://wiki.openoffice.org/w/images/b/b3/0300CS3-CalcGuide.pdf#page=183
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
        " ",
        "\n",
        "%",
        ">",
        "<",
        ":",
        "^",
        "~",
        "!"
    ]

    const env = {}
    env.root = []
    env.string = {}
    env.string.inString = false
    env.string.escaped = false
    env.string.tmpstr = ""

    env.path = []
    env.actual = env.root
    for (let i = 0; i < str.length; i++) {
        const char = str[i]
        if (env.string.inString) {
            if (env.string.escaped) {
                if (char == "n") {
                    env.string.tmpstr += "\n"
                } else if (char == "t") {
                    env.string.tmpstr += "\t"
                } else if (char == "\\") {
                    env.string.tmpstr += "\\"
                } else if (char == "\"") {
                    env.string.tmpstr += "\""
                } else {
                    return "caracter \"" + char + "\" is not escapable, error found at caracter " + (i+1)
                }
                env.string.escaped = false
            } else {
                if (char == "\\") {
                    env.string.escaped = true
                } else if (char == "\"") {
                    env.string.inString = false
                    env.actual.push({
                        type: "string",
                        value: env.string.tmpstr
                    })
                    env.string.tmpstr = ""
                } else {
                    env.string.tmpstr += char
                }
            }
        }
        else {
            let bracketResult = ""
            if (bracketResult = parseBrackets("(", ")", "round brackers", env, char, i)) {
                if (bracketResult !== true)
                    return bracketResult
            } else if (bracketResult = parseBrackets("[", "]", "square brackers", env, char, i)) {
                if (bracketResult !== true)
                    return bracketResult
            } else if (bracketResult = parseBrackets("{", "}", "curly brackers", env, char, i)) {
                if (bracketResult !== true)
                    return bracketResult
            } else if (char === "\"") {
                if (env.string.tmpstr !== "")
                    env.actual.push(env.string.tmpstr)
                env.string.tmpstr = ""
                env.string.inString = true
            } else if (operators.includes(char)) {
                if (env.string.tmpstr !== "")
                    env.actual.push(env.string.tmpstr)
                env.string.tmpstr = ""
                env.actual.push(char)
            } else {
                env.string.tmpstr += char
            }
        }
    }
    if (env.string.tmpstr !== "")
        env.actual.push(env.string.tmpstr)

    if (env.path.length != 0)
        return "every brackets are not closed, error found at end of text"
    if (env.string.inString)
        return "string not closed, error found at end of text"
    return env.root
}

function parseBrackets(openBracket, closeBracket, bracketName, env, char, i) {
    if (char === openBracket) {
        if (env.string.tmpstr !== "")
            env.actual.push(env.string.tmpstr)
        env.string.tmpstr = ""
        env.actual.push({
            type: bracketName,
            value: []
        })
        env.path.push(env.actual.length - 1, "value")
        env.actual = env.actual[env.actual.length - 1]["value"]
    } else if (char === closeBracket) {
        if (env.string.tmpstr !== "")
            env.actual.push(env.string.tmpstr)
        env.string.tmpstr = ""
        // this object reference
        const lastPop = env.path.pop()
        setActualFromPath(env)
        if (lastPop == undefined) // root don't have reference component
            return "every " + bracketName + " are not opened (\"" + openBracket + "\" missing), error found at caracter " + (i+1)
        if(env.actual.type !== bracketName) // parentheses expected
            return "expression opened by " + env.actual.type + " but closed by " + bracketName + ", error found at caracter " + (i+1)
        env.path.pop() // parent values
        setActualFromPath(env)
    } else {
        return false
    }
    return true
}

function setActualFromPath(env) {
    env.actual = env.root
    for (const obj of env.path)
        env.actual = env.actual[obj]
}