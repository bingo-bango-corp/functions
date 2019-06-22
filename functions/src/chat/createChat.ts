const cors = require('cors')({origin: true})
import { db } from '../admin'
import { Request, Response } from 'firebase-functions'

export default (req: Request, res: Response) => {
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
  const promises: Promise<object>[] = []

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