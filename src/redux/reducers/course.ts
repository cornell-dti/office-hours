import {AnyAction} from 'redux'
import {LOGOUT_CLEAR, UPDATE_COURSE, UPDATE_SESSION} from "../actions/Types"

const initialState = {
    course : undefined,
    session: undefined
}

type AuthState = {
    course: FireCourse | undefined;
    session: FireSession | undefined;
}

export default function(state: AuthState = initialState, action: AnyAction) {
    const {type, payload} = action;
    switch(type) {
        case UPDATE_COURSE :
            return {
                ...state,
                course : payload.course
            }
        case UPDATE_SESSION :
            return {
                ...state,
                session : payload.session
            }
        case LOGOUT_CLEAR:
            return {
                course : undefined,
                session: undefined
            }
        default:
            return state;
    }
}