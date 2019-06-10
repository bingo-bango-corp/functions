import * as admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()
const messaging = admin.messaging()

export {
  db,
  messaging
}