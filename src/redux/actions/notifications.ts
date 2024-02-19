import type { AppDispatch } from "../store"

import {
    UPDATE_NOTIF_LIST,
    SEND_NOTIF,
} from "./Types"

export const updateNotifList = (notifs: FireNotification[], user: FireUser | undefined) => async (dispatch: AppDispatch) => {
    const payload = {
        notifs,
        user
    };
    if (user !== undefined) {
        dispatch({
            type: UPDATE_NOTIF_LIST,
            payload
        });
    }
}

export const sendNotif = (notifId: string, notifs: FireNotification[],
    user: FireUser | undefined) => async (dispatch: AppDispatch) => {
        const payload = {
            notifs,
            notifId,
            user
        };
        if (user !== undefined) {
            dispatch({
                type: SEND_NOTIF,
                payload
            });
        }
    }