import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
const cors = require('cors')({origin: true})

admin.initializeApp()
const db = admin.firestore()

const createProfile = (userRecord: any) => {
  const { email, displayName, phoneNumber, uid, photoURL } = userRecord

  return db
    .collection('users')
    .doc(uid)
    .set({ email, displayName, phoneNumber, photoURL })
    .catch(console.error)
}

const createChat = (req: any, res: any) => {
  return cors(req, res, async () => {
    const { userIDs } = req.body.data
    const users: object[] = await getUsers(userIDs)

    const write: any = await db
    .collection('chats')
    .add({
      users: users,
      messages: []
    })
    .catch(console.error)

    res.send({ data: {chatId: write.id }} )
  })
}

async function getUsers(userIDs: string[]) {
  let promises: Promise<object>[] = []

  userIDs.forEach((userID) => {
    promises.push(getUser(userID))
  })

  return Promise.all(promises)
}

async function getUser(userID: string) {
  const userRef = await db.collection('users').doc(userID).get()
  const userData = {
    id: userID,
    typing: false,
    ...userRef.data()!
  }
  return Promise.resolve(userData)
}

module.exports = {
  authOnCreate: functions.auth.user().onCreate(createProfile),
  createChat: functions.https.onRequest(createChat)
};