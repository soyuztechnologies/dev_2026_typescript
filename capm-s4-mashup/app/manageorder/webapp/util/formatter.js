sap.ui.define(
    [],
    function(){
        return {
            getStatus: function(code){
                switch (code) {
                    case 'A':
                        return 'Available';
                        break;
                    case 'D':
                        return 'Discontinued';
                        break;
                    case 'O':
                        return 'Out of Stock';
                        break;
                    default:
                        break;
                }
            },
            getStatusColor: function(code){
                switch (code) {
                    case 'A':
                        return 'Success';
                        break;
                    case 'D':
                        return 'Error';
                        break;
                    case 'O':
                        return 'Warning';
                        break;
                    default:
                        break;
                }
            },
            //Show a readable text for the sales order type code e.g. TA => Standard Order
            getOrderTypeDescription: function(code){
                switch (code) {
                    case 'TA':
                    case 'OR':
                        return 'Standard Order';
                        break;
                    case 'RE':
                        return 'Returns Order';
                        break;
                    case 'CR':
                        return 'Credit Memo Request';
                        break;
                    case 'DR':
                        return 'Debit Memo Request';
                        break;
                    case 'KB':
                        return 'Consignment Fill-Up';
                        break;
                    case 'KE':
                        return 'Consignment Issue';
                        break;
                    case 'KA':
                        return 'Consignment Pick-Up';
                        break;
                    case 'KR':
                        return 'Consignment Returns';
                        break;
                    default:
                        //if we do not know the code, just show the code itself
                        return code;
                }
            }
        }
    }

)