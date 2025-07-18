const util = await import("./util.js")
const manageSheet = await import("./sheet/sheet.js")

/**
 * Init DOM listeners
 * @param {ClientSheet} clientSheet 
 */
export function initControl(clientSheet) {
    function validateSelectior(target) {
        
    }

    function selectA1(event) {
        event.target.value = "A1"
            clientSheet.state.selection = [{
                startColumn: 1,
                startRow: 1,
                endColumn: 1,
                endRow: 1
            }]
    }

    function validateCellSelection(event) {
        if (event.target.value == "") {
            selectA1(event)
            return
        }
        const parsedSelection = util.selectionA1toObject(event.target.value)
        if (parsedSelection.length == 0) {
            selectA1(event)
        } else {
            event.target.value = util.prettifySelection(parsedSelection)
            clientSheet.state.selection = parsedSelection
        }
    }

    function selectorEvent(event) {
        if(event.key === "Enter") {
            validateCellSelection(event)
            document.activeElement.blur()
        }
    }

    /** @type {HTMLInputElement} */
    const cellSelector = clientSheet.element.getElementsByClassName("cell-selector")[0]
    /** @type {HTMLInputElement} */
    const inputArea = clientSheet.element.getElementsByClassName("input-area")[0]


    cellSelector.addEventListener("keydown", selectorEvent)
    cellSelector.addEventListener("blur", validateCellSelection)

    function writeInput(event) {
        console.log(event)
        const state = clientSheet.state
        if (document.activeElement != cellSelector) {
            if (event.code != event.key && event.location == 0) { // accept basic keys
                inputArea.value += event.key
            } else if ("0123456789/*-+.".includes(event.key)) { // accept numpad or others nums
                inputArea.value += event.key
            } else if (event.code == "Backspace") { // acceptbackspace
                inputArea.value = inputArea.value.substring(0, inputArea.value.length - 1)
            } else if (event.code == "ArrowLeft") {
                if (event.shiftKey) {
                    const thisSelection = state.selection[state.actualSelection]
                    const endCol = thisSelection.endColumn
                    if ((endCol != 0) && (endCol > (thisSelection.startColumn + state.selectionOffsetX))) {
                        thisSelection.endColumn--
                    } else if ((thisSelection.startColumn > 1) && (endCol = (thisSelection.startColumn + state.selectionOffsetX))) {
                        thisSelection.startColumn--
                    }
                } else {
                    const actualCellPos = [
                        thisSelection.startColumn + state.selectionOffsetX,
                        thisSelection.startRow + state.selectionOffsetY
                    ]
                    state.selection = [{
                        startColumn: actualCellPos[0],
                        startRow: actualCellPos[1],
                        endColumn: actualCellPos[0],
                        endRow: actualCellPos[1]
                    }]
                    if (actualCellPos[0] > 1) {
                        state.selection[0].startColumn--
                    }
                }
                cellSelector.value = util.prettifySelection(clientSheet.state.selection)
            } else if (event.code == "ArrowUp") {
            } else if (event.code == "ArrowDown") {
            } else if (event.code == "ArrowRight") {
            } else if (event.code == "Enter") {
                const thisSelection = state.selection[state.actualSelection]
                const actualCellPos = [
                    thisSelection.startColumn + state.selectionOffsetX,
                    thisSelection.startRow + state.selectionOffsetY
                ]
                if (clientSheet.sheet.columns < actualCellPos[0])
                    manageSheet.addColumns(clientSheet.sheet, actualCellPos[0] - clientSheet.sheet.columns)
                if (clientSheet.sheet.rows < actualCellPos[1])
                    manageSheet.addRows(clientSheet.sheet, actualCellPos[1] - clientSheet.sheet.rows)
                clientSheet.sheet.values[actualCellPos[0]-1][actualCellPos[1]-1].value = inputArea.value
            }
        }
    }

    document.addEventListener("keydown", writeInput)
}