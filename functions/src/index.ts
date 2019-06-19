import * as functions from 'firebase-functions'

import createChat from './chat/createChat'
import notifier from './chat/notifier'
import takeJob from './job/takeJob'
import dropJob from './job/dropJob'
import createProfile from './profile/createProfile'

module.exports = {
  authOnCreate: functions.region('europe-west1').auth.user().onCreate(createProfile),
  createChat: functions.region('europe-west1').https.onRequest(createChat),
  notifier: functions.region('europe-west1').firestore.document('jobs/{jobId}/chat/{messageId}').onCreate(notifier),
  takeJob: functions.region('europe-west1').https.onRequest(takeJob),
  dropJob: functions.region('europe-west1').https.onRequest(dropJob),
}