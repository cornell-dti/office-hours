import { AnyAction } from 'redux'

import { UPDATE_NOTIF_LIST, SEND_NOTIF } from "../actions/Types"

const initialState = {
  notifications: [],
}

type NotifState = {
  notifications: FireNotification[];
}

export default function (state: NotifState = initialState, action: AnyAction) {
  const { type, payload } = action;
  switch (type) {
    case UPDATE_NOTIF_LIST: {
      return {
        ...state,
        notifications: payload.notifs
      }
    }
    case SEND_NOTIF: {
      // update DB notif using payload.notifId
      for (let i = 0; i < payload.notifs.length; i++) {
        if (payload.notifs[i].id === payload.notifId) {
          payload.notifs[i].wasSent = true;
        }
      }
      return {
        ...state,
        notifications: payload.notifs
      }
    }
    default:
      return state;
  }
}