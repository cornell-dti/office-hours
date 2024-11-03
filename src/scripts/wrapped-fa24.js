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
var errorUsers = [];
// Firestore Timestamps for the query range
var startDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date('2024-01-22'));
var endDate = firebase_admin_1["default"].firestore.Timestamp.fromDate(new Date('2024-12-21'));
var getWrapped = function () { return __awaiter(void 0, void 0, void 0, function () {
    var questionsRef, sessionsRef, wrappedRef, usersRef, questionsSnapshot, userStats, taCounts, officeHourSessions, TAsessions, updateWrappedDocs, initializeUser, _loop_1, _i, _a, doc, _loop_2, _b, _c, _d, userId, stats;
    var _e, _f, _g, _h, _j, _k, _l, _m, _o;
    return __generator(this, function (_p) {
        switch (_p.label) {
            case 0:
                questionsRef = db.collection('questions-test');
                sessionsRef = db.collection('sessions-test');
                wrappedRef = db.collection('wrapped-fa24');
                usersRef = db.collection('users-test');
                return [4 /*yield*/, questionsRef
                        .where('timeEntered', '>=', startDate)
                        .where('timeEntered', '<=', endDate)
                        .get()];
            case 1:
                questionsSnapshot = _p.sent();
                userStats = {};
                taCounts = {};
                officeHourSessions = {};
                TAsessions = {};
                updateWrappedDocs = function () { return __awaiter(void 0, void 0, void 0, function () {
                    var batch, _i, _a, _b, userId, stats, hasVisits, isUserActive, hasFavoriteTa, wrappedDocRef, userDoc;
                    var _c;
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                batch = db.batch();
                                _i = 0, _a = Object.entries(userStats);
                                _d.label = 1;
                            case 1:
                                if (!(_i < _a.length)) return [3 /*break*/, 7];
                                _b = _a[_i], userId = _b[0], stats = _b[1];
                                if (!userId) return [3 /*break*/, 5];
                                hasVisits = stats.numVisits > 0;
                                isUserActive = stats.timeHelpingStudents === undefined || (((_c = TAsessions[userId]) === null || _c === void 0 ? void 0 : _c.length) > 0);
                                hasFavoriteTa = stats.favTaId !== "";
                                if (!(hasVisits && isUserActive && hasFavoriteTa)) return [3 /*break*/, 3];
                                wrappedDocRef = wrappedRef.doc(userId);
                                batch.set(wrappedDocRef, stats);
                                return [4 /*yield*/, usersRef.doc(userId).get()];
                            case 2:
                                userDoc = _d.sent();
                                if (userDoc.exists) {
                                    usersRef.doc(userId).update({
                                        wrapped: true
                                    });
                                }
                                else {
                                    // Handle the case where the document does not exist
                                    errorUsers.push({ user: userId, error: "No document found for this user, skipping update." });
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                errorUsers.push({ user: userId, error: "User is not an active student/TA" });
                                _d.label = 4;
                            case 4: return [3 /*break*/, 6];
                            case 5:
                                errorUsers.push({ user: userId, error: "User ID is undefined, skipping update." });
                                _d.label = 6;
                            case 6:
                                _i++;
                                return [3 /*break*/, 1];
                            case 7: return [4 /*yield*/, batch.commit()];
                            case 8:
                                _d.sent();
                                return [2 /*return*/];
                        }
                    });
                }); };
                initializeUser = function (answererId, askerId) {
                    var _a;
                    // if an instance doesn't exist yet for the user, creating one
                    if (!userStats[askerId]) {
                        userStats[askerId] = {
                            numVisits: 0,
                            favClass: '',
                            favTitle: '',
                            favTaId: '',
                            totalMinutes: 0,
                            personalityType: ''
                        };
                        taCounts[askerId] = new Map();
                        officeHourSessions[askerId] = [];
                    }
                    if (!userStats[answererId]) {
                        userStats[answererId] = {
                            numVisits: 0,
                            favClass: '',
                            favTitle: '',
                            favTaId: '',
                            totalMinutes: 0,
                            personalityType: '',
                            timeHelpingStudents: 0
                        };
                        taCounts[answererId] = new Map();
                        officeHourSessions[answererId] = [];
                        TAsessions[answererId] = [];
                        // Checking if ta already showed up as student and now as an answerer
                    }
                    else if (userStats[answererId] && ((_a = userStats[answererId]) === null || _a === void 0 ? void 0 : _a.timeHelpingStudents) === undefined) {
                        userStats[answererId] = {
                            numVisits: userStats[answererId].numVisits,
                            favClass: userStats[answererId].favClass,
                            favTitle: userStats[answererId].favTitle,
                            favTaId: userStats[answererId].favTaId,
                            totalMinutes: userStats[answererId].totalMinutes,
                            personalityType: userStats[answererId].personalityType,
                            timeHelpingStudents: 0
                        };
                        taCounts[answererId] = new Map();
                        officeHourSessions[answererId] = [];
                        TAsessions[answererId] = [];
                    }
                };
                _loop_1 = function (doc) {
                    var question, answererId, askerId, sessionId, timeEntered, timeAddressed, sessionDoc, timeHelping, taAmt, minutesSpent;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                question = doc.data();
                                answererId = question.answererId, askerId = question.askerId, sessionId = question.sessionId, timeEntered = question.timeEntered, timeAddressed = question.timeAddressed;
                                initializeUser(answererId, askerId);
                                if (!(TAsessions[answererId].find(function (elem) { return elem.session === sessionId; }) === undefined)) return [3 /*break*/, 2];
                                return [4 /*yield*/, sessionsRef.doc(sessionId).get()];
                            case 1:
                                sessionDoc = _a.sent();
                                if (sessionDoc.exists && userStats[answererId].timeHelpingStudents !== undefined) {
                                    timeHelping = (sessionDoc.get('endTime').toDate().getTime()
                                        - sessionDoc.get('startTime').toDate().getTime()) / 60000;
                                    // this should never be less than 0 (or 0, really)
                                    if (timeHelping >= 0) {
                                        userStats[answererId].timeHelpingStudents =
                                            ((_e = userStats[answererId].timeHelpingStudents) !== null && _e !== void 0 ? _e : 0) + timeHelping;
                                    }
                                }
                                _a.label = 2;
                            case 2:
                                officeHourSessions[askerId] = officeHourSessions[askerId] || [];
                                if (!officeHourSessions[askerId].includes(sessionId)) {
                                    officeHourSessions[askerId].push(sessionId);
                                }
                                if (answererId !== undefined && answererId !== "") {
                                    (_f = TAsessions[answererId]) === null || _f === void 0 ? void 0 : _f.push({
                                        session: sessionId,
                                        asker: askerId
                                    });
                                    if (!((_g = taCounts[askerId]) === null || _g === void 0 ? void 0 : _g.has(answererId))) {
                                        (_h = taCounts[askerId]) === null || _h === void 0 ? void 0 : _h.set(answererId, 1);
                                    }
                                    else if (answererId !== undefined && ((_j = taCounts[askerId]) === null || _j === void 0 ? void 0 : _j.has(answererId))) {
                                        taAmt = (_k = taCounts[askerId]) === null || _k === void 0 ? void 0 : _k.get(answererId);
                                        taAmt && ((_l = taCounts[askerId]) === null || _l === void 0 ? void 0 : _l.set(answererId, taAmt + 1));
                                    }
                                }
                                // Minutes spent at office hours
                                if (timeEntered) {
                                    if (timeAddressed) {
                                        minutesSpent = (timeAddressed.toDate().getTime() -
                                            timeEntered.toDate().getTime()) / 60000;
                                        if (minutesSpent >= 0) {
                                            userStats[askerId].totalMinutes += minutesSpent;
                                        }
                                    }
                                    else {
                                        userStats[askerId].totalMinutes += 60; // assume 60 minutes if not addressed
                                    }
                                }
                                return [2 /*return*/];
                        }
                    });
                };
                _i = 0, _a = questionsSnapshot.docs;
                _p.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 5];
                doc = _a[_i];
                return [5 /*yield**/, _loop_1(doc)];
            case 3:
                _p.sent();
                _p.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5:
                _loop_2 = function (userId, stats) {
                    var weeksInRange, averageSessionsPerWeek, resSession, sessionsDoc, sessionFrequency_1, modeSessionId, sessionsDoc;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                stats.numVisits = (_m = officeHourSessions[userId]) === null || _m === void 0 ? void 0 : _m.length;
                                stats.totalMinutes = Math.ceil(stats.totalMinutes);
                                if (stats.timeHelpingStudents !== undefined) {
                                    stats.timeHelpingStudents = Math.ceil(stats.timeHelpingStudents);
                                }
                                weeksInRange = (endDate.toDate().getTime() - startDate.toDate().getTime())
                                    / (1000 * 60 * 60 * 24 * 7);
                                averageSessionsPerWeek = stats.numVisits / weeksInRange;
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
                                if (taCounts[userId].size !== 0) {
                                    stats.favTaId = Array.from(taCounts[userId].entries()).reduce(function (a, b) { return a[1] < b[1] ? b : a; })[0];
                                }
                                if (!(stats.favTaId && stats.favTaId !== "")) return [3 /*break*/, 4];
                                resSession = (_o = TAsessions[stats.favTaId]) === null || _o === void 0 ? void 0 : _o.filter(function (elem) {
                                    return officeHourSessions[userId].includes(elem.session);
                                });
                                if (!((resSession === null || resSession === void 0 ? void 0 : resSession.length) === 1)) return [3 /*break*/, 2];
                                return [4 /*yield*/, sessionsRef.doc(resSession[0].session).get()];
                            case 1:
                                sessionsDoc = _a.sent();
                                stats.favClass = sessionsDoc.get("courseId");
                                stats.favTitle = sessionsDoc.get("title");
                                return [3 /*break*/, 4];
                            case 2:
                                if (!((resSession === null || resSession === void 0 ? void 0 : resSession.length) > 1)) return [3 /*break*/, 4];
                                sessionFrequency_1 = {};
                                resSession.filter(function (elem) { return elem.asker === userId; }).forEach(function (elem) {
                                    if (!sessionFrequency_1[elem.session]) {
                                        sessionFrequency_1[elem.session] = 1;
                                    }
                                    else {
                                        sessionFrequency_1[elem.session] += 1;
                                    }
                                });
                                modeSessionId = Object.keys(sessionFrequency_1).reduce(function (a, b) {
                                    return sessionFrequency_1[a] > sessionFrequency_1[b] ? a : b;
                                });
                                return [4 /*yield*/, sessionsRef.doc(modeSessionId).get()];
                            case 3:
                                sessionsDoc = _a.sent();
                                stats.favClass = sessionsDoc.get("courseId");
                                stats.favTitle = sessionsDoc.get("title");
                                _a.label = 4;
                            case 4: return [2 /*return*/];
                        }
                    });
                };
                _b = 0, _c = Object.entries(userStats);
                _p.label = 6;
            case 6:
                if (!(_b < _c.length)) return [3 /*break*/, 9];
                _d = _c[_b], userId = _d[0], stats = _d[1];
                return [5 /*yield**/, _loop_2(userId, stats)];
            case 7:
                _p.sent();
                _p.label = 8;
            case 8:
                _b++;
                return [3 /*break*/, 6];
            case 9: return [4 /*yield*/, updateWrappedDocs()];
            case 10:
                _p.sent();
                // debugging
                // eslint-disable-next-line no-console
                errorUsers.forEach(function (elem) { return console.log(elem.user + ": " + elem.error); });
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
