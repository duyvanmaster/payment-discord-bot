"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sort_obj_by_key_1 = __importDefault(require("./sort-obj-by-key"));
var convertObjToQueryStr = function (object) {
    return Object.keys(object)
        .filter(function (key) { return object[key] !== undefined; })
        .map(function (key) {
        var value = object[key];
        // Sort nested object
        if (value && Array.isArray(value)) {
            value = JSON.stringify(value.map(function (val) { return (0, sort_obj_by_key_1.default)(val); }));
        }
        // Set empty string if null
        if ([null, undefined, 'undefined', 'null'].includes(value)) {
            value = '';
        }
        return "".concat(key, "=").concat(value);
    })
        .join('&');
};
exports.default = convertObjToQueryStr;
