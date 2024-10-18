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
// EDIT: possibly make these dates as new constants in constants.ts, 
// would make it easier to edit for other years
var startDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date('2023-08-20'));
var endDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date('2024-05-19'));
var getWrapped = function () { return __awaiter(void 0, void 0, void 0, function () {
    var questionsRef, sessionsRef, wrappedRef, usersRef, questionsSnapshot, userStats, officeHourCounts, taCounts, TAsessions, _i, _a, doc, question, answererId, askerId, sessionId, timeEntered, timeAddressed, person, ohAmt, taAmt, minutesSpent, sessionDoc, timeHelping, _b, _c, _d, userId, stats, sessionCount, weeksInRange, averageSessionsPerWeek, batch;
    var _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    return __generator(this, function (_t) {
        switch (_t.label) {
            case 0:
                questionsRef = db.collection('questions');
                sessionsRef = db.collection('sessions');
                wrappedRef = db.collection('wrapped-fa24');
                usersRef = db.collection('users');
                return [4 /*yield*/, questionsRef
                        .where('timeEntered', '>=', startDate)
                        .where('timeEntered', '<=', endDate)
                        .get()];
            case 1:
                questionsSnapshot = _t.sent();
                userStats = {};
                officeHourCounts = {};
                taCounts = {};
                TAsessions = {};
                _i = 0, _a = questionsSnapshot.docs;
                _t.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                doc = _a[_i];
                question = doc.data();
                answererId = question.answererId, askerId = question.askerId, sessionId = question.sessionId, timeEntered = question.timeEntered, timeAddressed = question.timeAddressed;
                return [4 /*yield*/, usersRef.doc(askerId).get()];
            case 3:
                person = _t.sent();
                // eslint-disable-next-line no-console
                console.log("asker (" + askerId + ") is " + person.get("firstName"));
                // if an instance doesn't exist yet for the user, creating one
                if (!userStats[askerId]) {
                    userStats[askerId] = {
                        // officeHourVisits: [],
                        // officeHourCounts: new Map<string, number>(),
                        // taCounts: new Map<string, number>(),
                        favOfficeHourId: '',
                        favTaId: '',
                        totalMinutes: 0,
                        personalityType: ''
                    };
                    officeHourCounts[askerId] = new Map();
                    taCounts[askerId] = new Map();
                }
                if (!userStats[answererId]) {
                    userStats[answererId] = {
                        // officeHourVisits: [],
                        // officeHourCounts: new Map<string, number>(),
                        // taCounts: new Map<string, number>(), 
                        favOfficeHourId: '',
                        favTaId: '',
                        totalMinutes: 0,
                        personalityType: '',
                        timeHelpingStudents: 0
                    };
                    officeHourCounts[answererId] = new Map();
                    taCounts[answererId] = new Map();
                    // Checking if ta already showed up as student and now as an answerer
                }
                else if (userStats[answererId] && ((_e = userStats[answererId]) === null || _e === void 0 ? void 0 : _e.timeHelpingStudents) === undefined) {
                    userStats[answererId] = {
                        // officeHourVisits: [],
                        // officeHourCounts: userStats[answererId].officeHourCounts,
                        // taCounts: userStats[answererId].taCounts, 
                        favOfficeHourId: userStats[answererId].favOfficeHourId,
                        favTaId: userStats[answererId].favTaId,
                        totalMinutes: userStats[answererId].totalMinutes,
                        personalityType: userStats[answererId].personalityType,
                        timeHelpingStudents: 0
                    };
                    // eslint-disable-next-line no-console
                    console.log("updating map for ta");
                }
                // Office hour visits
                if (!((_f = officeHourCounts[askerId]) === null || _f === void 0 ? void 0 : _f.has(sessionId))) {
                    // userStats[askerId].officeHourVisits?.push(sessionId);
                    (_g = officeHourCounts[askerId]) === null || _g === void 0 ? void 0 : _g.set(sessionId, 1);
                }
                else if ((_h = officeHourCounts[askerId]) === null || _h === void 0 ? void 0 : _h.has(sessionId)) {
                    ohAmt = (_j = officeHourCounts[askerId]) === null || _j === void 0 ? void 0 : _j.get(sessionId);
                    ohAmt && ((_k = officeHourCounts[askerId]) === null || _k === void 0 ? void 0 : _k.set(sessionId, ohAmt + 1));
                }
                if (taCounts[askerId] && answererId !== undefined && answererId !== "") {
                    if (!((_l = taCounts[askerId]) === null || _l === void 0 ? void 0 : _l.has(answererId))) {
                        (_m = taCounts[askerId]) === null || _m === void 0 ? void 0 : _m.set(answererId, 1);
                    }
                    else if ((_o = taCounts[askerId]) === null || _o === void 0 ? void 0 : _o.has(answererId)) {
                        taAmt = (_p = taCounts[askerId]) === null || _p === void 0 ? void 0 : _p.get(answererId);
                        taAmt && ((_q = taCounts[askerId]) === null || _q === void 0 ? void 0 : _q.set(answererId, taAmt + 1));
                    }
                }
                // Minutes spent at office hours
                if (timeEntered) {
                    if (timeAddressed) {
                        minutesSpent = Math.ceil((timeAddressed.toDate().getTime() -
                            timeEntered.toDate().getTime()) / 60000);
                        userStats[askerId].totalMinutes += minutesSpent;
                        if (minutesSpent <= 0) {
                            // eslint-disable-next-line no-console
                            console.log("ISSUE: Minutes spent is a 0 or less");
                        }
                    }
                    else {
                        userStats[askerId].totalMinutes += 60; // assume 60 minutes if not addressed
                    }
                }
                if (!!((_r = TAsessions[answererId]) === null || _r === void 0 ? void 0 : _r.includes(sessionId))) return [3 /*break*/, 5];
                (_s = TAsessions[answererId]) === null || _s === void 0 ? void 0 : _s.push(sessionId);
                return [4 /*yield*/, sessionsRef.doc(sessionId).get()];
            case 4:
                sessionDoc = _t.sent();
                if (sessionDoc.exists && userStats[answererId].timeHelpingStudents !== undefined) {
                    timeHelping = Math.ceil((sessionDoc.get('endTime').toDate().getTime()
                        - sessionDoc.get('startTime').toDate().getTime()) / 60000);
                    // this should never be less than 0 (or 0, really)
                    if (timeHelping >= 0) {
                        userStats[answererId].timeHelpingStudents += timeHelping;
                    }
                }
                _t.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6:
                // Personality type will be calculated after processing all documents
                // Process personality type
                for (_b = 0, _c = Object.entries(userStats); _b < _c.length; _b++) {
                    _d = _c[_b], userId = _d[0], stats = _d[1];
                    sessionCount = officeHourCounts[userId].size;
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
                    // Get the ids in the map that have the highest counts
                    if (officeHourCounts[userId].size !== 0) {
                        stats.favOfficeHourId =
                            Array.from(officeHourCounts[userId].entries()).reduce(function (a, b) { return a[1] < b[1] ? b : a; })[0];
                    }
                    if (taCounts[userId].size !== 0) {
                        stats.favTaId = Array.from(taCounts[userId].entries()).reduce(function (a, b) { return a[1] < b[1] ? b : a; })[0];
                    }
                    // eslint-disable-next-line no-console
                    console.log("for user " + userId + " fav oh is " + stats.favOfficeHourId + " and fav ta is " + stats.favTaId);
                    // eslint-disable-next-line no-console
                    console.log("oh size" + officeHourCounts[userId].size + " and ta size " + taCounts[userId].size);
                }
                batch = db.batch();
                Object.entries(userStats).forEach(function (_a) {
                    var userId = _a[0], stats = _a[1];
                    return __awaiter(void 0, void 0, void 0, function () {
                        var wrappedDocRef, userDoc;
                        var _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!userId) return [3 /*break*/, 4];
                                    if (!((officeHourCounts[userId].size > 0)
                                        || (stats.timeHelpingStudents !== undefined && ((_b = TAsessions[userId]) === null || _b === void 0 ? void 0 : _b.length) > 0))) return [3 /*break*/, 2];
                                    // eslint-disable-next-line no-console
                                    console.log("User " + userId + " is an active student/TA.");
                                    wrappedDocRef = wrappedRef.doc(userId);
                                    batch.set(wrappedDocRef, stats);
                                    return [4 /*yield*/, usersRef.doc(userId).get()];
                                case 1:
                                    userDoc = _c.sent();
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
                                    console.log("User is NOT an active student/TA.");
                                    _c.label = 3;
                                case 3: return [3 /*break*/, 5];
                                case 4:
                                    // eslint-disable-next-line no-console
                                    console.log("User ID is undefined, skipping update.");
                                    _c.label = 5;
                                case 5: return [2 /*return*/];
                            }
                        });
                    });
                });
                return [4 /*yield*/, batch.commit()];
            case 7:
                _t.sent();
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
