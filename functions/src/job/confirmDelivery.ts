const cors = require('cors')({origin: true})
import { db } from '../admin'
import { sendNotificationToUser } from '../utils/notify'
import { Request, Response } from 'firebase-functions'
import writeNoticeToChat from '../utils/writeNoticeToChat';

const sendNotificationToAssignee = async (
  assigneeId: string,
  ownerId: string,
) => {
  console.log(`sending notification to ${assigneeId}`)
  const ownerUserInfo = (await db
    .collection('users')
    .doc(ownerId)
    .get())
    .data()
  
  await sendNotificationToUser(assigneeId, {
    title: `${ownerUserInfo!.displayName} confirmed delivery 🌟`,
    body: `Thanks a lot for being a Banger Banger`
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

    if (jobData!.state !== 'delivered') {
      return res.status(400).send({
        code: 'job/not-delivered',
        message: 'This job is not in state delivered'
      })
    }

    if (jobData!.owner.uid !== uid) {
      return res.status(400).send({
        code: 'job/illegal-action',
        message: 'You are not the owner of this job'
      })
    }

    writeNoticeToChat('confirmed_delivery', jobID).catch((e: Error) => {
      console.error(e)
    })

    sendNotificationToAssignee(jobData!.owner.uid, uid).catch((e: Error) => {
      console.error(e)
    })

    await jobRef.update({
      state: 'deliveryConfirmed',
    })

    return res.send({ data: { status: 'OK' }}) 
  })
}