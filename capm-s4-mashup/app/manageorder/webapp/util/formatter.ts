/**
 * Formatter helpers — pure functions, no UI5 base class needed.
 */
export function getStatus(code: string): string {
    switch (code) {
        case "A": return "Available";
        case "D": return "Discontinued";
        case "O": return "Out of Stock";
        default:  return "";
    }
}

export function getStatusColor(code: string): string {
    switch (code) {
        case "A": return "Success";
        case "D": return "Error";
        case "O": return "Warning";
        default:  return "None";
    }
}

// Show a readable text for the sales order type code e.g. TA => Standard Order
export function getOrderTypeDescription(code: string): string {
    switch (code) {
        case "TA":
        case "OR": return "Standard Order";
        case "RE": return "Returns Order";
        case "CR": return "Credit Memo Request";
        case "DR": return "Debit Memo Request";
        case "KB": return "Consignment Fill-Up";
        case "KE": return "Consignment Issue";
        case "KA": return "Consignment Pick-Up";
        case "KR": return "Consignment Returns";
        // if we do not know the code, just show the code itself
        default:   return code;
    }
}