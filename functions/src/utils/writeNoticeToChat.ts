import { db } from '../admin'

type notice =
  'assign' |
  'drop' |
  'cancel' |
  'deliver' |
  'confirm_delivery'

export default async (
  type: notice,
  jobId: string,
) => {
  const docToAddRef = db
    .collection('jobs')
    .doc(jobId)
    .collection('chat')
    .doc()

  const id = docToAddRef.id

  const data = {
    id: id,
    type: 'notice',
    event: type,
    seconds: new Date()
  }

  await docToAddRef.set(data)
}