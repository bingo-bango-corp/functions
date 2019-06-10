import { db } from '../admin'

export default (userRecord: any) => {
  const { email, displayName, phoneNumber, uid, photoURL } = userRecord

  return db
    .collection('users')
    .doc(uid)
    .set({ displayName, photoURL })
    .then(() => {
      return db
        .collection('users')
        .doc(uid)
        .collection('private')
        .doc('privateProfile')
        .set({
          accountName: displayName,
          email,
          phoneNumber
        })
    })
    .catch(console.error)
}