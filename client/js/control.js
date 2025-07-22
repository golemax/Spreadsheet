const util = await import("./util.js")
const manageSheet = await import("./sheet/sheet.js")

/**
 * Init DOM listeners
 * @param {ClientSheet} clientSheet 
 */
export function initControl(clientSheet) {
    function selectA1(event) {
        event.target.value = "A1"
            clientSheet.state.selection = [{
                startColumn: 1,
                startRow: 1,
                endColumn: 1,
                endRow: 1
            }]
            clientSheet.state.actualSelection = 0
            clientSheet.state.selectionOffsetX = 0
            clientSheet.state.selectionOffsetY= 0
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
            clientSheet.state.actualSelection = 0
            clientSheet.state.selectionOffsetX = 0
            clientSheet.state.selectionOffsetY= 0
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
        const state = clientSheet.state
        if (document.activeElement != cellSelector) {
            if (event.code != event.key && event.location == 0 && document.activeElement != inputArea) { // accept basic keys
                inputArea.value += event.key
            } else if ("0123456789/*-+.".includes(event.key) && document.activeElement != inputArea) { // accept numpad or others nums
                inputArea.value += event.key
            } else if (event.code == "Backspace" && document.activeElement != inputArea) { // acceptbackspace
                inputArea.value = inputArea.value.substring(0, inputArea.value.length - 1)
            } else if (event.code == "ArrowLeft" && document.activeElement != inputArea) {
                const thisSelection = state.selection[state.actualSelection]
                const actualCellPos = [
                        thisSelection.startColumn + state.selectionOffsetX,
                        thisSelection.startRow + state.selectionOffsetY
                    ]
                if (event.shiftKey) {
                    if ((thisSelection.endColumn != 0) && (thisSelection.endColumn > actualCellPos[0])) {
                        thisSelection.endColumn--
                    } else if (thisSelection.startColumn > 1) {
                        thisSelection.startColumn--
                        state.selectionOffsetX++
                    }
                } else {
                    state.selection = [{
                        startColumn: actualCellPos[0],
                        startRow: actualCellPos[1],
                        endColumn: actualCellPos[0],
                        endRow: actualCellPos[1]
                    }]
                    state.actualSelection = 0
                    state.selectionOffsetX = 0
                    state.selectionOffsetY= 0
                    if (actualCellPos[0] > 1) {
                        state.selection[0].startColumn--
                        state.selection[0].endColumn--
                        if ((state.selection[0].startColumn <= clientSheet.sheet.columns) && (state.selection[0].startRow <= clientSheet.sheet.rows))
                            inputArea.value = clientSheet.sheet.values[state.selection[0].startColumn - 1][state.selection[0].startRow - 1].value
                        else
                            inputArea.value = ""
                    }
                }
                cellSelector.value = util.prettifySelection(clientSheet.state.selection)
            } else if (event.code == "ArrowUp" && document.activeElement != inputArea) {
                const thisSelection = state.selection[state.actualSelection]
                const actualCellPos = [
                        thisSelection.startColumn + state.selectionOffsetX,
                        thisSelection.startRow + state.selectionOffsetY
                    ]
                if (event.shiftKey) {
                    if ((thisSelection.endRow != 0) && (thisSelection.endRow > actualCellPos[1])) {
                        thisSelection.endRow--
                    } else if (thisSelection.startRow > 1) {
                        thisSelection.startRow--
                        state.selectionOffsetY++
                    }
                } else {
                    state.selection = [{
                        startColumn: actualCellPos[0],
                        startRow: actualCellPos[1],
                        endColumn: actualCellPos[0],
                        endRow: actualCellPos[1]
                    }]
                    state.actualSelection = 0
                    state.selectionOffsetX = 0
                    state.selectionOffsetY= 0
                    if (actualCellPos[1] > 1) {
                        state.selection[0].startRow--
                        state.selection[0].endRow--
                        if ((state.selection[0].startColumn <= clientSheet.sheet.columns) && (state.selection[0].startRow <= clientSheet.sheet.rows))
                            inputArea.value = clientSheet.sheet.values[state.selection[0].startColumn - 1][state.selection[0].startRow - 1].value
                        else
                            inputArea.value = ""
                    }
                }
                cellSelector.value = util.prettifySelection(clientSheet.state.selection)
            } else if (event.code == "ArrowDown" && document.activeElement != inputArea) {
                const thisSelection = state.selection[state.actualSelection]
                const actualCellPos = [
                        thisSelection.startColumn + state.selectionOffsetX,
                        thisSelection.startRow + state.selectionOffsetY
                    ]
                if (event.shiftKey) {
                    if (thisSelection.startRow < actualCellPos[1]) {
                        thisSelection.startRow++
                        state.selectionOffsetY--
                    } else if (thisSelection.endRow != 0 && (clientSheet.sheet.infinite || (thisSelection.endRow < clientSheet.sheet.rows))) {
                        thisSelection.endRow++
                    }
                } else {
                    state.selection = [{
                        startColumn: actualCellPos[0],
                        startRow: actualCellPos[1],
                        endColumn: actualCellPos[0],
                        endRow: actualCellPos[1]
                    }]
                    state.actualSelection = 0
                    state.selectionOffsetX = 0
                    state.selectionOffsetY= 0
                    if (clientSheet.sheet.infinite || (actualCellPos[1] < clientSheet.sheet.rows)) {
                        state.selection[0].startRow++
                        state.selection[0].endRow++
                        if ((state.selection[0].startColumn <= clientSheet.sheet.columns) && (state.selection[0].startRow <= clientSheet.sheet.rows))
                            inputArea.value = clientSheet.sheet.values[state.selection[0].startColumn - 1][state.selection[0].startRow - 1].value
                        else
                            inputArea.value = ""
                    }
                }
                cellSelector.value = util.prettifySelection(clientSheet.state.selection)
            } else if (event.code == "ArrowRight" && document.activeElement != inputArea) {
                const thisSelection = state.selection[state.actualSelection]
                const actualCellPos = [
                        thisSelection.startColumn + state.selectionOffsetX,
                        thisSelection.startRow + state.selectionOffsetY
                    ]
                if (event.shiftKey) {
                    if (thisSelection.startColumn < actualCellPos[0]) {
                        thisSelection.startColumn++
                        state.selectionOffsetX--
                    } else if (thisSelection.endColumn != 0 && (clientSheet.sheet.infinite || (thisSelection.endColumn < clientSheet.sheet.columns))) {
                        thisSelection.endColumn++
                    }
                } else {
                    state.selection = [{
                        startColumn: actualCellPos[0],
                        startRow: actualCellPos[1],
                        endColumn: actualCellPos[0],
                        endRow: actualCellPos[1]
                    }]
                    state.actualSelection = 0
                    state.selectionOffsetX = 0
                    state.selectionOffsetY= 0
                    if (clientSheet.sheet.infinite || (actualCellPos[0] < clientSheet.sheet.columns)) {
                        state.selection[0].startColumn++
                        state.selection[0].endColumn++
                        if ((state.selection[0].startColumn <= clientSheet.sheet.columns) && (state.selection[0].startRow <= clientSheet.sheet.rows))
                            inputArea.value = clientSheet.sheet.values[state.selection[0].startColumn - 1][state.selection[0].startRow - 1].value
                        else
                            inputArea.value = ""
                    }
                }
                cellSelector.value = util.prettifySelection(clientSheet.state.selection)
            } else if (event.code == "Enter") {
                if (event.ctrlKey) {
                    inputArea.focus()
                } else if (event.altKey) {
                    cellSelector.focus()
                } else if (event.target != cellSelector) {
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
                    
                    state.selection = [{
                        startColumn: actualCellPos[0],
                        startRow: actualCellPos[1],
                        endColumn: actualCellPos[0],
                        endRow: actualCellPos[1]
                    }]
                    state.actualSelection = 0
                    state.selectionOffsetX = 0
                    state.selectionOffsetY= 0
                    if (clientSheet.sheet.infinite || (actualCellPos[1] < clientSheet.sheet.rows)) {
                        state.selection[0].startRow++
                        state.selection[0].endRow++
                        if ((state.selection[0].startColumn <= clientSheet.sheet.columns) && (state.selection[0].startRow <= clientSheet.sheet.rows))
                            inputArea.value = clientSheet.sheet.values[state.selection[0].startColumn - 1][state.selection[0].startRow - 1].value
                        else
                            inputArea.value = ""
                    }
                    cellSelector.value = util.prettifySelection(clientSheet.state.selection)
                    document.activeElement.blur()
                }
            } else if (event.code == "Tab") {
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
                
                state.selection = [{
                    startColumn: actualCellPos[0],
                    startRow: actualCellPos[1],
                    endColumn: actualCellPos[0],
                    endRow: actualCellPos[1]
                }]
                state.actualSelection = 0
                state.selectionOffsetX = 0
                state.selectionOffsetY= 0
                if (clientSheet.sheet.infinite || (actualCellPos[0] < clientSheet.sheet.columns)) {
                    state.selection[0].startColumn++
                    state.selection[0].endColumn++
                    if ((state.selection[0].startColumn <= clientSheet.sheet.columns) && (state.selection[0].startRow <= clientSheet.sheet.rows))
                        inputArea.value = clientSheet.sheet.values[state.selection[0].startColumn - 1][state.selection[0].startRow - 1].value
                    else
                        inputArea.value = ""
                }
                cellSelector.value = util.prettifySelection(clientSheet.state.selection)
                event.preventDefault()
                document.activeElement.blur()
            } else if (event.code == "Delete" && document.activeElement != inputArea) {
                for (const selection of state.selection)
                    for (let col = selection.startColumn; col <= (selection.endColumn == 0 ? clientSheet.sheet.columns : selection.endColumn); col++)
                        for (let row = selection.startRow; row <= (selection.endRow == 0 ? clientSheet.sheet.rows : selection.endRow); row++)
                            if ((col <= clientSheet.sheet.columns) && (row <= clientSheet.sheet.rows)) {
                                clientSheet.sheet.values[col-1][row-1].value = ""
                                clientSheet.sheet.values[col-1][row-1].function = null
                                inputArea.value = ""
                            }
            }
        }
    }

    document.addEventListener("keydown", writeInput)

    function scrollEvent(event) {
        if (event.deltaMode == 0 && document.activeElement == document.body) {
            if (event.shiftKey) {
                clientSheet.state.xOffset += event.deltaY
                if (clientSheet.state.xOffset < 0)
                    clientSheet.state.xOffset = 0
            } else {
                clientSheet.state.yOffset += event.deltaY
                if (clientSheet.state.yOffset < 0)
                    clientSheet.state.yOffset = 0
            }
        }
    }

    document.addEventListener("wheel", scrollEvent)

    function completeSelection(xCell, yCell) {
        const state = clientSheet.state
        const actualSelection = state.selection[state.actualSelection]
        
        let startColumn
        let endColumn
        let startRow
        let endRow

        if (state.xStartDraggingCell == 0 && xCell == 0) {
            startColumn = 1
            endColumn = 0
        } else if (state.xStartDraggingCell == 0) {
            startColumn = xCell
            endColumn = 0
        } else if (xCell == 0) {
            startColumn = state.xStartDraggingCell
            endColumn = 0
        } else {
            startColumn = Math.min(xCell, state.xStartDraggingCell)
            endColumn = Math.max(xCell, state.xStartDraggingCell)
        }

        if (state.yStartDraggingCell == 0 && yCell == 0) {
            startRow = 1
            endRow = 0
        } else if (state.yStartDraggingCell == 0) {
            startRow = yCell
            endRow = 0
        } else if (yCell == 0) {
            startRow = state.yStartDraggingCell
            endRow = 0
        } else {
            startRow = Math.min(yCell, state.yStartDraggingCell)
            endRow = Math.max(yCell, state.yStartDraggingCell)
        }

        state.selection[state.actualSelection] = {
            startColumn: startColumn,
            endColumn: endColumn,
            startRow: startRow,
            endRow: endRow
        }
        state.selectionOffsetX = 0
        state.selectionOffsetY = 0
        cellSelector.value = util.prettifySelection(clientSheet.state.selection)
    }

    function mouseClickEvent(event) {
        if (event.button == 0 || event.button == 2) {
            const cellPos = util.getCellAtPos(clientSheet, event.x, event.y)
            if (cellPos != null) {
                if (event.shiftKey) {
                    completeSelection(cellPos[0], cellPos[1])
                } else {
                    clientSheet.state.xStartDraggingCell = cellPos[0]
                    clientSheet.state.yStartDraggingCell = cellPos[1]
                    if (event.ctrlKey) {
                        clientSheet.state.selection.push({
                            startColumn: (cellPos[0] == 0 ? 1 : cellPos[0]),
                            startRow: (cellPos[1] == 0 ? 1 : cellPos[1]),
                            endColumn: cellPos[0],
                            endRow: cellPos[1]
                        })
                        clientSheet.state.actualSelection =
                            clientSheet.state.selection.length - 1
                        clientSheet.state.selectionOffsetX = 0
                        clientSheet.state.selectionOffsetY= 0
                    } else {
                        clientSheet.state.selection = [{
                            startColumn: (cellPos[0] == 0 ? 1 : cellPos[0]),
                            startRow: (cellPos[1] == 0 ? 1 : cellPos[1]),
                            endColumn: cellPos[0],
                            endRow: cellPos[1]
                        }]
                        clientSheet.state.actualSelection = 0
                        clientSheet.state.selectionOffsetX = 0
                        clientSheet.state.selectionOffsetY= 0
                    }
                    cellSelector.value = util.prettifySelection(clientSheet.state.selection)
                }
            }
        }
    }

    function updateSelectionFromMouseEvent() {
        const cellPos = util.getCellAtPos(clientSheet, event.x, event.y)
        if (cellPos != null)
            completeSelection(cellPos[0], cellPos[1])
    }

    function mouseReleaseEvent(event) {
        if (event.button == 0 || event.button == 2)
            updateSelectionFromMouseEvent()
        if (event.button == 2) {
            event.preventDefault()
        }
    }

    function mouseMoveEvent(event) {
        if (event.buttons & 1 || event.buttons & 2)
            updateSelectionFromMouseEvent(event)
    }

    document.addEventListener("mousedown", mouseClickEvent)
    document.addEventListener("mouseup", mouseReleaseEvent)
    document.addEventListener("mousemove", mouseMoveEvent)
    document.addEventListener("contextmenu", event => {event.preventDefault()});
}