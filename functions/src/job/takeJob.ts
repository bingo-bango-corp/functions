const cors = require('cors')({origin: true})
import { db } from '../admin'
import { sendNotificationToUser } from '../utils/notify'

const sendNotificationToOwner = async (
  ownerId: any,
  assigneeId: any
) => {
  console.log(`sending notification to ${ownerId}`)
  const assigneeUserInfo = (await db
    .collection('users')
    .doc(assigneeId)
    .get())
    .data()
  
  await sendNotificationToUser(ownerId, {
    title: `🧙 ${assigneeUserInfo!.displayName} is on it!`,
    body: 'Your request will be fullfilled soon'
  })
}

export default (req: any, res: any) => {
  return cors(req, res, async () => {
    const { jobID, uid } = req.body.data
    const jobRef = db.collection('jobs').doc(jobID)
    const jobSnapshpot = await jobRef.get()

    if (!jobSnapshpot.exists) {
      return res.status(400).send({
        code: 'job/unknown',
        message: 'This job does not exist'
      })
    }

    const jobData = jobSnapshpot.data()

    if (jobData!.assignee) {
      return res.status(400).send({
        code: 'job/taken',
        message: 'This job has already been taken'
      })
    }

    if (jobData!.owner.uid === uid) {
      return res.status(400).send({
        code: 'job/cannotTakeOwnJob',
        message: 'Cannot assign job to its owner'
      })
    }

    await jobRef.update({
      state: 'assigned',
      assignee: {
        uid: uid,
        profile: db.collection('users').doc(uid)
      }
    })

    await sendNotificationToOwner(jobData!.owner.uid, uid)

    return res.send({ data: { status: 'OK' }})
  })
}