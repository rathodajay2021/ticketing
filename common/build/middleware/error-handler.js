"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const custom_error_1 = require("../errors/custom-error");
const errorHandler = (err, req, res, next) => {
    var _a;
    if (err instanceof custom_error_1.CustomError) {
        return res.status(err.statusCode).json(err.serializeErrors());
    }
    console.error("error: ", err);
    res.status(500).send({
        message: (_a = err.message) !== null && _a !== void 0 ? _a : "Something went wrong",
    });
};
exports.errorHandler = errorHandler;
