import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()
const db = admin.firestore()

const createProfile = (userRecord: any) => {
  const { email, phoneNumber, uid, photoURL } = userRecord

  return db
    .collection('Users')
    .doc(uid)
    .set({ email, phoneNumber, photoURL })
    .catch(console.error)
}

module.exports = {
  authOnCreate: functions.auth.user().onCreate(createProfile),
};