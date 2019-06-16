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
    title: `${assigneeUserInfo!.displayName} can't handle your request`,
    body: 'If you still want the item, please re-submit your request.'
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

    if (jobData!.state !== 'assigned') {
      return res.status(400).send({
        code: 'job/not-assigned',
        message: 'This job is not in state assigned'
      })
    }

    await jobRef.update({
      state: 'lost',
    })

    sendNotificationToOwner(jobData!.owner.uid, uid).catch((e: Error) => {
      console.error(e)
    })

    return res.send({ data: { status: 'OK' }})
  })
}