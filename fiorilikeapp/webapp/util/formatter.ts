export default {
    getStatus(code: string): string | undefined {
        switch (code) {
            case 'A':
                return 'Available';
            case 'D':
                return 'Discontinued';
            case 'O':
                return 'Out of Stock';
            default:
                // TypeScript: Explicit 'return undefined' makes the undefined
                // return case self-documenting. Without it, JavaScript implicitly
                // returns undefined, but TypeScript may warn in strict mode.
                return undefined;
        }
    },

    getStatusColor(code: string): string | undefined {
        switch (code) {
            case 'A':
                return 'Success';   // Green  - fruit is available
            case 'D':
                return 'Error';     // Red    - fruit is discontinued
            case 'O':
                return 'Warning';   // Orange - fruit is out of stock
            default:
                return undefined;
        }
    }
};
