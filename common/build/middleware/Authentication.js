"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Authentication = void 0;
const express_validator_1 = require("express-validator");
const types_1 = require("../types");
const request_validation_error_1 = require("../errors/request-validation-error");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bad_request_error_1 = require("../errors/bad-request-error");
//This is my middleware
class Authentication {
    static handle(req, res, next, loginType) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return next(new request_validation_error_1.RequestValidationError(errors.array()));
                // return next(new Error("Invalid input fields"))
                //   throw new RequestValidationError(errors.array());
            }
            if (loginType === types_1.UserLogin.LOGGED_IN) {
                if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.jwt)) {
                    return next(new bad_request_error_1.BadRequestError("Token is required", 401));
                }
                try {
                    const payload = jsonwebtoken_1.default.verify(req.session.jwt, process.env.JWT_KEY);
                    req.currentUser = payload;
                }
                catch (error) {
                    return next(new bad_request_error_1.BadRequestError("In-valid token", 401));
                }
            }
            next();
        });
    }
    static blank(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            Authentication.handle(req, res, next, types_1.UserLogin.OPEN_TO_ALL);
        });
    }
    static auth(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            Authentication.handle(req, res, next, types_1.UserLogin.LOGGED_IN);
        });
    }
}
exports.Authentication = Authentication;
