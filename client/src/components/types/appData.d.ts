interface AppCourse {
    code: string;
    name: string;
}

interface AppInterval {
    seconds: number;
    minutes: number;
    hours: number;
    days: number;
    months: number;
    years: number;
}

interface AppCourseInterval extends AppCourse {
    queueOpenInterval: AppInterval;
}

interface AppSession {
    sessionId: number;
    startTime: Date;
    endTime: Date;
    building: string;
    room: string;
    sessionSeriesId: number;
    title: string;
    questionsBySessionId: {
        nodes: [AppQuestion]
    }
    sessionTasBySessionId: {
        nodes: [AppTa]
    }
}

interface AppTa {
    userByUserId: {
        userId: number;
        computedName: string;
        computedAvatar: string;
    }
}

interface AppQuestion {
    questionId: number;
    content: string;
    status: string;
    timeEntered: Date;
    userByAskerId: AppUser;
    userByAnswererId: AppUser;
    questionTagsByQuestionId: {
        nodes: [{
            tagByTagId: AppTag
        }]
    }
}

interface AppTag {
    name: string;
    level: number;
    tagId: number;
    activated: boolean;
    tagRelationsByParentId?: {
        nodes: [{
            tagByChildId: AppTag
        }]
    };
}

interface AppTagRelations extends AppTag {
    tagRelationsByChildId: {
        nodes: [{
            parentId: number
        }]
    }
}

interface AppUser {
    computedName: string;
    computedAvatar: string;
    userId: number;
}

interface AppUserRole extends AppUser {
    courseUsersByUserId: {
        nodes: [{
            role: string;
            userId: number;
            computedAvatar: string;
        }]
    }
}

interface AppUserRoleQuestions extends AppUserRole {
    questionsByAskerId: {
        nodes: [{
            sessionBySessionId: AppSession
        }]
    }
}
