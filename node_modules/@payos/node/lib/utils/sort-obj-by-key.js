"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sortObjDataByKey = function (object) {
    var orderedObject = Object.keys(object)
        .sort()
        .reduce(function (obj, key) {
        obj[key] = object[key];
        return obj;
    }, {});
    return orderedObject;
};
exports.default = sortObjDataByKey;
