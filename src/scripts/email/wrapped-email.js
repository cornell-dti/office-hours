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
var resend_1 = require("resend");
var firebase_admin_1 = require("firebase-admin");
var dotenv = require("dotenv");
var wrapped_html_1 = require("./wrapped-html");
firebase_admin_1["default"].initializeApp({
    credential: firebase_admin_1["default"].credential.applicationDefault(),
    databaseURL: 'https://queue-me-in-prod.firebaseio.com'
});
dotenv.config();
var resend = new resend_1.Resend(process.env.RESEND_API_KEY);
if (process.argv.length !== 3) {
    throw new Error("Usage: node <script path> <index number> . Use 0 if running script for first time");
}
var indexStopped = process.argv[2];
var MAX_EMAIL_LIMIT = 100;
var MAX_BATCH_LIMIT = 49;
/** Returns an array of email objects to send - should be at most 100 per day.
- totalEmails is a list of all the user emails to send to.
- batchSize should be 49 or less to maintain free emailing.
- Throws an error if this pre-condition is violated. */
var createBatches = function (totalEmails, batchSize) {
    var i = parseInt(indexStopped, 10);
    // eslint-disable-next-line no-console
    console.log("starting from user " + i + ": " + totalEmails[i]);
    var emailObjs = [];
    if (batchSize > MAX_BATCH_LIMIT) {
        throw new Error("Batch size is too large. Must be no more than 49");
    }
    if (totalEmails.length > MAX_BATCH_LIMIT * MAX_EMAIL_LIMIT) {
        // eslint-disable-next-line no-console
        console.log(
        // eslint-disable-next-line max-len
        "Total email length > " + MAX_BATCH_LIMIT * MAX_EMAIL_LIMIT + ". Up to " + MAX_BATCH_LIMIT * MAX_EMAIL_LIMIT + " emails will be sent, but you must run this script again the next day.");
    }
    while (i < totalEmails.length && emailObjs.length < MAX_EMAIL_LIMIT) {
        emailObjs.push({
            from: 'queuemein@cornelldti.org',
            // This is the dti address because recievers can see, but dti will not see recievers.
            to: ['hello@cornelldti.org'],
            bcc: totalEmails.slice(i, Math.min(i + batchSize, totalEmails.length)),
            subject: 'Check Out Your QMI Wrapped!',
            html: wrapped_html_1.HTML
        });
        // eslint-disable-next-line no-console
        // console.log("bcc list: " + totalEmails.slice(i, Math.min(i+batchSize, totalEmails.length)));
        i += batchSize;
    }
    if (emailObjs.length === MAX_EMAIL_LIMIT) {
        // eslint-disable-next-line no-console
        console.log("Reached email limit of " + MAX_EMAIL_LIMIT + " emails per day, stopped at:\n             i=" + i + ",  user " + totalEmails[i] + "\nContinue from this user the next day by typing \"node " + process.argv[1] + " " + i + "\"");
    }
    return emailObjs;
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var usersRef, usersSnapshot, userEmails, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                usersRef = firebase_admin_1["default"].firestore().collection('users');
                // eslint-disable-next-line no-console
                console.log('firebase worked');
                return [4 /*yield*/, usersRef
                        .where('wrapped', '==', true)
                        .where('email', '!=', null)
                        .orderBy('email')
                        .get()];
            case 1:
                usersSnapshot = _a.sent();
                return [4 /*yield*/, Promise.all(usersSnapshot.docs.map(function (doc) { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, doc.get('email')];
                        });
                    }); }))];
            case 2:
                userEmails = _a.sent();
                // eslint-disable-next-line no-console
                console.log(userEmails);
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, resend.batch.send(createBatches(userEmails, 49))];
            case 4:
                data = _a.sent();
                // eslint-disable-next-line no-console
                console.log("Emails have been sent!");
                // eslint-disable-next-line no-console
                console.log(data);
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                // eslint-disable-next-line no-console
                console.log("Emails have not been sent.");
                // eslint-disable-next-line no-console
                console.error(error_1);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); })();
