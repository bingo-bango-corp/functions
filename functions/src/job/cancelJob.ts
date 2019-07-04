const cors = require('cors')({origin: true})
import { db } from '../admin'
import { sendNotificationToUser } from '../utils/notify'
import { Request, Response } from 'firebase-functions'
import writeNoticeToChat from '../utils/writeNoticeToChat';

const sendNotificationToAssignee = async (
  assigneeId: string,
  ownerId: string,
  thing: string,
) => {
  console.log(`sending notification to ${assigneeId}`)
  const ownerUserInfo = (await db
    .collection('users')
    .doc(ownerId)
    .get())
    .data()
  
  await sendNotificationToUser(assigneeId, {
    title: `${ownerUserInfo!.displayName} just cancelled their request`,
    body: `They no longer want "${thing}".`
  })
}

export default (req: Request, res: Response) => {
  return cors(req, res, async () => {
    const { jobID, uid } = req.body.data
    const jobRef = db.collection('jobs').doc(jobID)
    const jobSnapshot = await jobRef.get()

    if (!jobSnapshot.exists) {
      return res.status(400).send({
        code: 'job/unknown',
        message: 'This job does not exist'
      })
    }

    const jobData = jobSnapshot.data()!

    if (jobData.state === 'cancelled') {
      return res.status(400).send({
        code: 'job/already-cancelled',
        message: 'This job is already cancelled'
      })
    }

    if (jobData.owner.uid !== uid) {
      return res.status(400).send({
        code: 'job/illegal-action',
        message: 'This is not your job'
      })
    }

    writeNoticeToChat('cancel', jobID).catch((e: Error) => {
      console.error(e)
    })

    if (jobData.state === 'assigned') {
      sendNotificationToAssignee(
        jobData.assignee.uid,
        jobData.owner.uid,
        jobData.thing
        ).catch((e) => {
          console.error(e)
        })
    }

    await jobRef.update({
      state: 'cancelled',
      terminal: true,
    })

    return res.send({ data: { status: 'OK' }}) 
  })
}