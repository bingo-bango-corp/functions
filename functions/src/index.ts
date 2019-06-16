import * as functions from 'firebase-functions'

import createChat from './chat/createChat'
import notifier from './chat/notifier'
import takeJob from './job/takeJob'
import dropJob from './job/dropJob'
import createProfile from './profile/createProfile'

module.exports = {
  authOnCreate: functions.auth.user().onCreate(createProfile),
  createChat: functions.https.onRequest(createChat),
  notifier: functions.firestore.document('jobs/{jobId}/chat/{messageId}').onCreate(notifier),
  takeJob: functions.https.onRequest(takeJob),
  dropJob: functions.https.onRequest(dropJob),
}