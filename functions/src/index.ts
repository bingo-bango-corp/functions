import * as functions from 'firebase-functions'

import createChat from './chat/createChat'
import takeJob from './job/takeJob'
import dropJob from './job/dropJob'
import createProfile from './profile/createProfile'

module.exports = {
  authOnCreate: functions.auth.user().onCreate(createProfile),
  takeJob: functions.https.onRequest(takeJob),
  dropJob: functions.https.onRequest(dropJob),
  createChat: functions.https.onRequest(createChat)
};