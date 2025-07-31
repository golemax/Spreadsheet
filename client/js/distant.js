const sheetUtil = await import("./common/sheetUtil.js")

/**
 * 
 * @param {ClientSheet} clientSheet 
 */
export function catcher(clientSheet) {
    const ws = clientSheet.server
    ws.onmessage = event => {
        const message = JSON.parse(event.data)
        const sheet = clientSheet.sheet

        switch (message.action) {
            case "updateCellValue":
                sheet.values[message.column-1][message.row-1].value = message.value
                console.log("cell updated")
                break
            case "addColumns":
                sheetUtil.addColumns(sheet, message.number)
                break
            case "addRows":
                sheetUtil.addRows(sheet, message.number)
                break
            case "updateExternalSelections":
                clientSheet.otherSelections = message.selections
                break
        }
    }
}