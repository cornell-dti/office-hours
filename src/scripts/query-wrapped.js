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
// Initialize Firebase Admin with credentials and database URL
firebase_admin_1["default"].initializeApp({
    credential: firebase_admin_1["default"].credential.applicationDefault(),
    databaseURL: 'https://queue-me-in-prod.firebaseio.com'
});
// Initialize Firestore database
var db = firebase_admin_1["default"].firestore();
function validateDocuments() {
    return __awaiter(this, void 0, void 0, function () {
        var wrappedRef, snapshot, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wrappedRef = db.collection('wrapped');
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, wrappedRef.get()];
                case 2:
                    snapshot = _a.sent();
                    // Print the total number of documents
                    // eslint-disable-next-line no-console
                    console.log("Total number of documents in 'wrapped-fa24': " + snapshot.size);
                    // Iterate over each document
                    snapshot.forEach(function (doc) {
                        var data = doc.data();
                        var errors = [];
                        // Check if numVisits is a positive number
                        if (data.numVisits <= 0) {
                            errors.push('numVisits is not positive');
                        }
                        // Check if personalityType is not an empty string
                        if (!data.personalityType || data.personalityType.trim() === '') {
                            errors.push('personalityType is empty');
                        }
                        // Check if totalMinutes is a positive number
                        if (data.totalMinutes <= 0) {
                            errors.push('totalMinutes is not positive');
                        }
                        // Check if favTa exists for students
                        if (!data.timeHelpingStudents && !data.numStudentsHelped && !data.favTaId) {
                            errors.push('favTaId is missing');
                        }
                        // Check if one of the TA stats exists but the other doesn't
                        if ((data.timeHelpingStudents && !data.numStudentsHelped)
                            || (!data.timeHelpingStudents && data.numStudentsHelped)) {
                            errors.push('One of the TA stats is mismatched');
                        }
                        // Check if favClass is not an empty string
                        if (!data.favClass || data.favClass.trim() === '') {
                            errors.push('favClass is empty');
                        }
                        // Check if favDay is not a default value
                        if (data.favDay === -1) {
                            errors.push('favDay is not valid');
                        }
                        // Check if favMonth is not a default value
                        if (data.favMonth === -1) {
                            errors.push('favMonth is not valid');
                        }
                        // If there are errors, log them with the user ID
                        if (errors.length > 0) {
                            // eslint-disable-next-line no-console
                            console.log("Document ID: " + doc.id + " has the following issues: " + errors.join(', '));
                        }
                    });
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    // Log any errors that occur during the fetch
                    // eslint-disable-next-line no-console
                    console.error('Error retrieving documents:', error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Call the function to execute it
validateDocuments();
