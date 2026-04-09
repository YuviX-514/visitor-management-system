import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import visitorReducer from './features/visitors/visitorSlice'
import requestReducer from './features/requests/requestSlice'
import notificationReducer from './features/notifications/notificationSlice'

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      visitors: visitorReducer,
      requests: requestReducer,
      notifications: notificationReducer,
    },
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
