import { getDatabase } from '../utils/mongodb'

export default defineEventHandler(async () => (await getDatabase()).collection('publications').find({ status: 'PUBLICADA' }).sort({ publishedAt: -1 }).toArray())
