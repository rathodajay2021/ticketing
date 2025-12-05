"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    // when the order has been created,  but the ticket it is trying to order has not been reserved
    OrderStatus["Created"] = "created";
    // The ticket the order is tying to reserve has already been reserved, or when the user has cancelled the order
    // The order has been expired before payment
    OrderStatus["Cancelled"] = "cancelled";
    // The order has successfully reserved the ticket
    OrderStatus["AwaitingPayment"] = "awaiting:payment";
    // The order has reserved the ticket and the user has provided payment successfully
    OrderStatus["Complete"] = "complete";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
