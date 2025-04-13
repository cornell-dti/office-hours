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
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var admin = require("firebase-admin");
var fs_1 = require("fs");
var constants_1 = require("../../constants");
var resend_1 = require("resend");
var wrapped_email_1 = require("./wrapped-email");
require("dotenv/config");
// admin.initializeApp({
//     credential: admin.credential.applicationDefault(),
//     databaseURL: 'https://queue-me-in-prod.firebaseio.com'
//     //'https://qmi-test.firebaseio.com'
//     // 'https://queue-me-in-prod.firebaseio.com'
// });
// eslint-disable-next-line no-console
console.log('Firebase admin initialized from wrapped-email!');
var resend = new resend_1.Resend(process.env.REACT_APP_RESEND_API_KEY);
// eslint-disable-next-line no-console
console.log('Resend initialized!');
if (process.argv.length !== 3) {
    throw new Error("Usage: node <script path> <index number> . Use 0 if running script for first time");
}
var indexStopped = process.argv[2];
// Initialize Firestore
var db = admin.firestore();
// Firestore Timestamps for the query range. Will have to change to represent semester dates
var startDate = admin.firestore.Timestamp.fromDate(new Date(constants_1.START_DATE));
var endDate = admin.firestore.Timestamp.fromDate(new Date(constants_1.END_DATE));
(0, fs_1.writeFileSync)("./src/scripts/email/tas.csv", "Name, Email, Courses\n", {
    flag: "w"
});
var taEmails = [];
var taNames = [];
var taClasses = [];
var getTAs = function () { return __awaiter(void 0, void 0, void 0, function () {
    var coursesRef, usersRef, coursesSnapshot, _i, _a, doc, courseCode, taList, _b, taList_1, taId, rowData, taDoc;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                coursesRef = db.collection('courses');
                usersRef = db.collection('users');
                return [4 /*yield*/, coursesRef
                        .where('startDate', '>=', startDate)
                        .where('endDate', '<=', endDate)
                        .get()];
            case 1:
                coursesSnapshot = _c.sent();
                _i = 0, _a = coursesSnapshot.docs;
                _c.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 7];
                doc = _a[_i];
                courseCode = doc.get('code');
                taList = doc.get('tas');
                _b = 0, taList_1 = taList;
                _c.label = 3;
            case 3:
                if (!(_b < taList_1.length)) return [3 /*break*/, 6];
                taId = taList_1[_b];
                rowData = "";
                return [4 /*yield*/, usersRef.doc(taId).get()];
            case 4:
                taDoc = (_c.sent()).data();
                if (taDoc) {
                    /*Assuming you can't be a TA for two classes in the same semester,
                    so there should be no repeats.*/
                    rowData += taDoc.firstName + " " + taDoc.lastName + ",";
                    rowData += taDoc.email + "," + courseCode + "\n";
                    taEmails.push(taDoc.email);
                    taClasses.push(courseCode);
                    taNames.push(taDoc.firstName + " " + taDoc.lastName);
                    (0, fs_1.writeFileSync)("./src/scripts/email/tas.csv", rowData, {
                        flag: "a"
                    });
                }
                _c.label = 5;
            case 5:
                _b++;
                return [3 /*break*/, 3];
            case 6:
                _i++;
                return [3 /*break*/, 2];
            case 7: return [2 /*return*/];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var content, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, getTAs()];
            case 1:
                _a.sent();
                console.log('Writing info to CSV...');
                // eslint-disable-next-line no-console
                console.log("Processing complete. Sending emails..");
                content = "\nHi there,\n<br><br>\nI hope this email finds you well! My name is Maddie and I am Queue Me In\u2019s Product Marketing Manager. I am reaching out to ask if you could provide feedback on your experience using Queue Me In as a TA. Please share with us your thoughts using <a href=\"https://docs.google.com/forms/d/e/1FAIpQLSdDv1hHnVefUVZXqKobxMZZa1JrobwTY6oIMhcszxE3OYVBdg/viewform\">this Google Form</a>. Your feedback is extremely valuable as we will use it to create and optimize features that help streamline your user experience. The form itself isn\u2019t very long and should take approximately 10 minutes to complete.\n<br><br>\n<strong>Filling out this form will enter you in a raffle to win one of 2 $20 Amazon e-gift cards!</strong> To enter, please be sure to submit before April 21st at 11:59PM EST.\n<br><br>\nThank you in advance for your feedback. We really appreciate your time!\n<br><br>\nIf you have any questions, comments, or concerns, please reach out to me at mh2535@cornell.edu.\n<br><br>\nBest,\n<br><br>\nMaddie Hsia\n        ";
                return [4 /*yield*/, resend.batch.send((0, wrapped_email_1.createBatches)(['ns848@cornell.edu', 'nidhisoma@gmail.com'], 1, "[Queue Me In] Provide Your TA Feedback", content, indexStopped))];
            case 2:
                data = _a.sent();
                // eslint-disable-next-line no-console
                console.log("Emails have been sent!");
                // eslint-disable-next-line no-console
                console.log(data);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                // eslint-disable-next-line no-console
                console.error("Failed to process:", error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); })();
