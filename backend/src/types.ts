export type QMISessionModality = 'in-person' | 'hybrid' | 'virtual';

export interface Document {
    _id: string;
}

export interface QMIBaseSession {
    modality: QMISessionModality;
    courseId: string;
    endTime: Date;
    sessionSeriesId?: string;
    startTime: Date;
    tas: string[];
    title?: string;
    _id: string;
}

export interface QMISessionLocation {
    room: string;
    building: string;
}

export interface QMIVirtualSession extends QMIBaseSession {
    modality: 'virtual';
}

export interface QMIInPersonSession extends QMIBaseSession, QMISessionLocation {
    modality: 'in-person';
    building: string;
    room: string;
}

export interface QMIHybridSession extends QMIBaseSession, QMISessionLocation {
    modality: 'hybrid';
    building: string;
    room: string;
}

export interface QMIVirtualSessionProfile {
    virtualLocation?: string;
}

export type QMISession = QMIHybridSession | QMIInPersonSession | QMIVirtualSession;

/** This data is never stored in the database. */
export interface QMIBaseSessionSeries extends Document {
    modality: QMISessionModality;
    courseId: string;
    endTime: Date;
    startTime: Date;
    tas: string[];
    title?: string;
    sessionSeriesId: string;
}

export interface QMIVirtualSessionSeries extends QMIBaseSessionSeries {
    modality: 'virtual';
}

export interface QMIHybridSessionSeries extends QMIBaseSessionSeries, QMISessionLocation {
    modality: 'hybrid';
    building: string;
    room: string;
}

export interface QMIInPersonSessionSeries extends QMIBaseSessionSeries, QMISessionLocation {
    modality: 'in-person';
    building: string;
    room: string;
}

export type QMISessionSeries = QMIVirtualSessionSeries | QMIHybridSessionSeries | QMIInPersonSessionSeries;
export type QMISessionSeriesDefinition =
    Omit<QMIVirtualSessionSeries, 'sessionSeriesId'>
    | Omit<QMIHybridSessionSeries, 'sessionSeriesId'>
    | Omit<QMIInPersonSessionSeries, 'sessionSeriesId'>;

/** @see QMIUser for the enrollment invariant. */
export interface QMICourse {
    code: string;
    endDate: Date;
    name: string;
    queueOpenInterval: number;
    semester: string;
    startDate: Date;
    professors: readonly string[];
    tas: readonly string[];
    _id: string;
    charLimit: number;
    term: string;
    year: string;
}

export type PrivilegedQMICourseRole = 'professor' | 'ta';
export type QMICourseRole = 'professor' | 'ta' | 'student';

/**
 * Invariant for fire user and course enrollment:
 *
 * 1. Ids of all related courses of a user appear in the field `courses`.
 * 2. For each course id above
 *    - If the user's role is TA or professor, it will appear in the roles map.
 *    - Otherwise, it will not appear in the roles map. (i.e. `role == 'student'` will never appear!)
 * 3. The `roles` field are in sync with `QMICourse`'s `professors` and `tas` field
 *
 * @see QMICourse
 */
export interface QMIUser {
    _id: string;
    firstName: string;
    lastName: string;
    photoUrl: string;
    email: string;
    courses: readonly string[];
    roles: { readonly [courseId: string]: PrivilegedQMICourseRole | undefined };
}

export interface QMIQuestion {
    _id: string;
    askerId: string;
    answererId: string;
    content: string;
    taComment?: string;
    location?: string;
    answererLocation?: string;
    sessionId: string;
    status: 'assigned' | 'resolved' | 'retracted' | 'unresolved' | 'no-show';
    timeAddressed?: Date;
    timeEntered: Date;
    primaryTag: string;
    secondaryTag: string;
}

export type QMIQuestionSlot = Pick<QMIQuestion, 'askerId' | 'sessionId' | 'status' | 'timeEntered' | '_id'>;

export interface QMITag {
    active: boolean;
    courseId: string;
    level: number;
    _id: string;
    name: string;
    parentTag?: string;
}
