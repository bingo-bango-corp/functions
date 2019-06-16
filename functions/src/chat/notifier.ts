import { db } from '../admin'
import { sendNotificationToUser } from '../utils/notify'

const sendNotification = async (
  from: string,
  to: string,
  message: string,
  url: string,
) => {
  const profileSnapshot = await db
    .collection('users')
    .doc(from)
    .get()

  const profileData = profileSnapshot.data()

  await sendNotificationToUser(to, {
    title: `${profileData!.displayName} sent a message`,
    body: message,
    url: url
  })
}

export default async (snap: FirebaseFirestore.DocumentSnapshot, context: any) => {
  if (snap.id === 'typing') return

  const jobId = context.params.jobId

  const messageData = snap.data()
  const { message, created_by } = (messageData as any)

  const jobSnapshot = await db
    .collection('jobs')
    .doc(jobId)
    .get()
  const jobData = jobSnapshot.data()
  const { assignee, owner } = (jobData as any)

  console.info('message payload', {
    message,
    created_by,
    assignee,
    owner
  })

  if (assignee.uid === created_by) {
    await sendNotification(created_by, owner.uid, message, `https://app.bingobango.app/get-things/${jobId}`)
  } else {
    await sendNotification(created_by, assignee.uid, message, `https://app.bingobango.app/make-money/current-job`)
  }
}