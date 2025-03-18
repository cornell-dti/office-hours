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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var firebase_admin_1 = require("firebase-admin");
var fs_1 = require("fs");
var constants_1 = require("../constants");
firebase_admin_1["default"].initializeApp({
    credential: firebase_admin_1["default"].credential.applicationDefault(),
    databaseURL: 'https://queue-me-in-prod.firebaseio.com'
    //'https://qmi-test.firebaseio.com'
    // 'https://queue-me-in-prod.firebaseio.com'
});
// eslint-disable-next-line no-console
console.log('Firebase admin initialized!');
// eslint-disable-next-line no-console
console.log('fs initialized');
// Initialize Firestore
var db = firebase_admin_1["default"].firestore();
// Firestore Timestamps for the query range. Will have to change to represent semester dates
var startDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date(constants_1.START_DATE));
var endDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date(constants_1.END_DATE));
fs_1.writeFileSync("./src/scripts/tas.csv", "Name, Email, Courses\n", {
    flag: "w"
});
var getTAs = function () { return __awaiter(void 0, void 0, void 0, function () {
    var coursesRef, usersRef, coursesSnapshot, _loop_1, _i, _a, doc;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                coursesRef = db.collection('courses');
                usersRef = db.collection('users');
                return [4 /*yield*/, coursesRef
                        .where('startDate', '>=', startDate)
                        .where('endDate', '<=', endDate)
                        .get()];
            case 1:
                coursesSnapshot = _b.sent();
                _loop_1 = function (doc) {
                    var courses = doc.data();
                    courses.tas.forEach(function (taId) { return __awaiter(void 0, void 0, void 0, function () {
                        var rowData, taDoc;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    rowData = "";
                                    return [4 /*yield*/, usersRef.doc(taId).get()];
                                case 1:
                                    taDoc = (_a.sent()).data();
                                    if (taDoc) {
                                        // eslint-disable-next-line no-console
                                        //console.log(taDoc.roles); 
                                        /*Assuming you can't be a TA for two classes in the same semester,
                                        so there should be no repeats.*/
                                        rowData += taDoc.firstName + " " + taDoc.lastName + ",";
                                        rowData += taDoc.email + "," + courses.code + "\n";
                                        fs_1.writeFileSync("./src/scripts/tas.csv", rowData, {
                                            flag: "a"
                                        });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                };
                for (_i = 0, _a = coursesSnapshot.docs; _i < _a.length; _i++) {
                    doc = _a[_i];
                    _loop_1(doc);
                }
                return [2 /*return*/];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, getTAs()];
            case 1:
                _a.sent();
                // eslint-disable-next-line no-console
                console.log("Processing complete.");
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                // eslint-disable-next-line no-console
                console.error("Failed to get TA emails:", error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
