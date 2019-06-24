const cors = require('cors')({origin: true})
import { db } from '../admin'
import { sendNotificationToUser } from '../utils/notify'
import { Request, Response } from 'firebase-functions'

const sendNotificationToOwner = async (
  assigneeId: string,
  ownerId: string,
) => {
  console.log(`sending notification to ${ownerId}`)
  const assigneeUserInfo = (await db
    .collection('users')
    .doc(assigneeId)
    .get())
    .data()
  
  await sendNotificationToUser(ownerId, {
    title: `${assigneeUserInfo!.displayName} marked your request as delivered 🧙‍`,
    body: 'Tap here to confirm delivery'
  })
}

export default (req: Request, res: Response) => {
  return cors(req, res, async() => {
    const { jobID, uid } = req.body.data
    const jobRef = db.collection('jobs').doc(jobID)
    const jobSnapshot = await jobRef.get() 

    if (!jobSnapshot.exists) {
      return res.status(400).send({
        code: 'job/unknown',
        message: 'This job does not exist'
      })
    }

    const jobData = jobSnapshot.data()

    if (jobData!.state !== 'assigned') {
      return res.status(400).send({
        code: 'job/not-assigned',
        message: 'This job is not in state assigned'
      })
    }

    if (jobData!.assignee.uid !== uid) {
      return res.status(400).send({
        code: 'job/illegal-action',
        message: 'This job is not assigned to you'
      })
    }

    await jobRef.update({
      state: 'delivered',
    })

    sendNotificationToOwner(jobData!.owner.uid, uid).catch((e: Error) => {
      console.error(e)
    })

    return res.send({ data: { status: 'OK' }}) 
  })
}