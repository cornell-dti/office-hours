import {AnyAction} from 'redux'
import {UPDATE_USER} from "../actions/Types"

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
        default:
            return state;

    }
}