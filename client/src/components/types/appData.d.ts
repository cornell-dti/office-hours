interface AppCourse {
    code: string;
    name: string;
}

interface AppSession {
    sessionId: number;
    startTime: Date;
    endTime: Date;
    building: string;
    room: string;
    questionsBySessionId: {
        nodes: [AppQuestion]
    }
    sessionTasBySessionId: {
        nodes: [AppTa]
    }
}

interface AppTa {
    userByUserId: {
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
    questionTagsByQuestionId: {
        nodes: [AppTag]
    }
}

interface AppTag {
    tagByTagId: {
        name: string;
        level: number;
        tagId: number;
        activated: boolean;
    }
}

interface AppTagRelations extends AppTag {
    name: string;
    level: number;
    tagId: number;
    activated: boolean;
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
