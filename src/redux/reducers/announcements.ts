import {AnyAction} from 'redux'
import {
    ADD_BANNER, 
    REMOVE_BANNER,
    ADD_SNACKBAR, 
    REMOVE_SNACKBAR, 
    ADD_SESSION_BANNER, 
    REMOVE_SESSION_BANNER
} from "../actions/Types"

const initialState = {
    banners: [],
    sessionBanners: [],
    snackbars: []
}

type AuthState = {
    banners: Announcement[];
    sessionBanners: Announcement[];
    snackbars: Announcement[];
}

export default function(state: AuthState = initialState, action: AnyAction) {
    const {type, payload} = action;
    switch(type) {
        case ADD_BANNER:
            return {
                ...state,
                banners: [...state.banners, payload.banner]
            }
        case REMOVE_BANNER: 
            return {
                ...state,
                banners: state.banners.filter(banner => banner.text !== payload.banner)
            }
        case ADD_SESSION_BANNER:
            return {
                ...state,
                sessionBanners: [...state.sessionBanners, payload.banner]
            }
        case REMOVE_SESSION_BANNER: 
            return {
                ...state,
                sessionBanners: state.sessionBanners.filter(banner => banner.text !== payload.banner)
            }
        case ADD_SNACKBAR:
            return {
                ...state,
                snackbars: [...state.snackbars, payload.snackbar]
            }
        case REMOVE_SNACKBAR: 
            return {
                ...state,
                snackbars: state.snackbars.filter(snackbar => snackbar.text !== payload.snackbar)
            }
        default:
            return state;

    }
}