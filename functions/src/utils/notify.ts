import { messaging, db } from '../admin'

export interface BingoMessagePayload {
  title: string,
  body: string,
  url?: string,
  type?:
    'new-chat-message',
}

const getTokenForUid = async (uid: string) => {
  const userRef = db
    .collection('users')
    .doc(uid)
    .collection('private')
    .doc('privateProfile')

  const userSnapshot = await userRef.get()
  const userData = userSnapshot.data()

  if (!userData) {
    return Promise.reject('Message token was not found for user')
  }

  return userData.messageToken
}

const sendNotificationToUser = async (uid: string, message: BingoMessagePayload) => {
  const messageToken = await getTokenForUid(uid)
  const url = message.url ? message.url : 'https://app.bingobango.app/'
  console.info(`dispatching notification to ${uid}`)
  return messaging.send({
    token: messageToken,
    data: {
      title: message.title,
      body: message.body,
      link: url
    }
  })
}

export {
  sendNotificationToUser
}