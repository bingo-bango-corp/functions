import * as functions from 'firebase-functions'

import createChat from './chat/createChat'
import takeJob from './job/takeJob'
import createProfile from './profile/createProfile'

module.exports = {
  authOnCreate: functions.auth.user().onCreate(createProfile),
  takeJob: functions.https.onRequest(takeJob),
  createChat: functions.https.onRequest(createChat)
};