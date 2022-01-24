import {AnyAction} from 'redux'
import {UPDATE_USER, UPDATE_AUTH} from "../actions/Types"

const initialState = {
    user : undefined
}

export default function(state = initialState, action: AnyAction) {
    const {type, payload} = action;
    switch(type) {
        case UPDATE_USER :
            return {
                ...state,
                user : payload.user
            }
        case UPDATE_AUTH: 
            if(payload.authState) {
                return {
                    ...state,
                    isAuthenticated : payload.authState
                }
            } 
            return {
                ...state,
                user : undefined,
                isAuthenticated : payload.authState
            }
            
        default:
            return state;

    }
}