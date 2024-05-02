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
firebase_admin_1["default"].initializeApp({
    credential: firebase_admin_1["default"].credential.applicationDefault(),
    databaseURL: 'https://qmi-test.firebaseio.com'
});
// eslint-disable-next-line no-console
console.log('Firebase admin initialized!');
// Initialize Firestore
var db = firebase_admin_1["default"].firestore();
// Firestore Timestamps for the query range
var startDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date('2023-08-20'));
var endDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date('2024-05-19'));
var getWrapped = function () { return __awaiter(void 0, void 0, void 0, function () {
    var questionsRef, sessionsRef, wrappedRef, usersRef, questionsSnapshot, userStats, TAsessions, _i, _a, doc, question, answererId, askerId, sessionId, timeEntered, timeAddressed, minutesSpent, _loop_1, TAid, _b, _c, _d, stats, sessionCount, weeksInRange, averageSessionsPerWeek, batch;
    var _e, _f, _g, _h;
    return __generator(this, function (_j) {
        switch (_j.label) {
            case 0:
                questionsRef = db.collection('questions');
                sessionsRef = db.collection('sessions');
                wrappedRef = db.collection('wrapped');
                usersRef = db.collection('users');
                return [4 /*yield*/, questionsRef
                        .where('timeEntered', '>=', startDate)
                        .where('timeEntered', '<=', endDate)
                        .get()];
            case 1:
                questionsSnapshot = _j.sent();
                userStats = {};
                TAsessions = {};
                for (_i = 0, _a = questionsSnapshot.docs; _i < _a.length; _i++) {
                    doc = _a[_i];
                    question = doc.data();
                    answererId = question.answererId, askerId = question.askerId, sessionId = question.sessionId, timeEntered = question.timeEntered, timeAddressed = question.timeAddressed;
                    if (!userStats[askerId]) {
                        userStats[askerId] = {
                            officeHourVisits: [],
                            totalMinutes: 0,
                            personalityType: ''
                        };
                    }
                    if (!userStats[answererId]) {
                        userStats[answererId] = {
                            officeHourVisits: [],
                            totalMinutes: 0,
                            personalityType: '',
                            timeHelpingStudents: 0
                        };
                    }
                    // Office hour visits
                    if (!((_e = userStats[askerId].officeHourVisits) === null || _e === void 0 ? void 0 : _e.includes(sessionId))) {
                        (_f = userStats[askerId].officeHourVisits) === null || _f === void 0 ? void 0 : _f.push(sessionId);
                    }
                    // Minutes spent at office hours
                    if (timeEntered) {
                        if (timeAddressed) {
                            minutesSpent = (timeAddressed.toDate().getTime() -
                                timeEntered.toDate().getTime()) / 60000;
                            userStats[askerId].totalMinutes += minutesSpent;
                        }
                        else {
                            userStats[askerId].totalMinutes += 60; // assume 60 minutes if not addressed
                        }
                    }
                    if (!((_g = TAsessions[answererId]) === null || _g === void 0 ? void 0 : _g.includes(sessionId))) {
                        (_h = TAsessions[answererId]) === null || _h === void 0 ? void 0 : _h.push(sessionId);
                    }
                }
                _loop_1 = function (TAid) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (TAsessions.hasOwnProperty(TAid)) {
                        var uniqueSessions = TAsessions[TAid];
                        uniqueSessions.forEach(function (session) { return __awaiter(void 0, void 0, void 0, function () {
                            var sessionDoc, sessionData, sessionLength;
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        sessionDoc = sessionsRef.doc(session).get();
                                        return [4 /*yield*/, sessionDoc];
                                    case 1:
                                        sessionData = (_b.sent()).data();
                                        sessionLength = (sessionData.endTime.toDate().getTime() - sessionData.startTime.toDate().getTime()) / 60000;
                                        userStats[TAid].timeHelpingStudents = ((_a = userStats[TAid].timeHelpingStudents) !== null && _a !== void 0 ? _a : 0) + sessionLength;
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    }
                };
                for (TAid in TAsessions) {
                    _loop_1(TAid);
                }
                // Personality type will be calculated after processing all documents
                // Process personality type
                for (_b = 0, _c = Object.entries(userStats); _b < _c.length; _b++) {
                    _d = _c[_b], stats = _d[1];
                    sessionCount = stats.officeHourVisits.length;
                    weeksInRange = (endDate.toDate().getTime() - startDate.toDate().getTime())
                        / (1000 * 60 * 60 * 24 * 7);
                    averageSessionsPerWeek = sessionCount / weeksInRange;
                    if (averageSessionsPerWeek >= 2) {
                        stats.personalityType = 'Consistent';
                    }
                    else if (averageSessionsPerWeek >= 0.5) {
                        stats.personalityType = 'Resourceful';
                    }
                    else {
                        stats.personalityType = 'Independent';
                    }
                }
                batch = db.batch();
                Object.entries(userStats).forEach(function (_a) {
                    var userId = _a[0], stats = _a[1];
                    return __awaiter(void 0, void 0, void 0, function () {
                        var wrappedDocRef, userDoc;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!userId) return [3 /*break*/, 2];
                                    wrappedDocRef = wrappedRef.doc(userId);
                                    batch.set(wrappedDocRef, stats);
                                    return [4 /*yield*/, usersRef.doc(userId).get()];
                                case 1:
                                    userDoc = _b.sent();
                                    if (userDoc.exists) {
                                        usersRef.doc(userId).update({
                                            wrapped: true
                                        });
                                    }
                                    else {
                                        // Handle the case where the document does not exist
                                        // eslint-disable-next-line no-console
                                        console.log("No document found for user ID " + userId + ", skipping update.");
                                    }
                                    return [3 /*break*/, 3];
                                case 2:
                                    // eslint-disable-next-line no-console
                                    console.log("User ID is undefined, skipping update.");
                                    _b.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                });
                return [4 /*yield*/, batch.commit()];
            case 2:
                _j.sent();
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
                return [4 /*yield*/, getWrapped()];
            case 1:
                _a.sent();
                // eslint-disable-next-line no-console
                console.log("Processing complete.");
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                // eslint-disable-next-line no-console
                console.error("Failed to update stats:", error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); })();
