import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const database = await getDatabase()
  const now = new Date()
  const startToday = new Date(now); startToday.setHours(0, 0, 0, 0)
  const startYesterday = new Date(startToday); startYesterday.setDate(startYesterday.getDate() - 1)
  const start7 = new Date(startToday); start7.setDate(start7.getDate() - 6)
  const start30 = new Date(startToday); start30.setDate(start30.getDate() - 29)
  const active = await database.collection('visitor_sessions').countDocuments({ lastActivityAt: { $gte: new Date(now.getTime() - 5 * 60 * 1000) } })
  const [today, yesterday, last7, last30, historical, daily] = await Promise.all([
    database.collection('visits').countDocuments({ visitedAt: { $gte: startToday } }),
    database.collection('visits').countDocuments({ visitedAt: { $gte: startYesterday, $lt: startToday } }),
    database.collection('visits').countDocuments({ visitedAt: { $gte: start7 } }),
    database.collection('visits').countDocuments({ visitedAt: { $gte: start30 } }),
    database.collection('visits').countDocuments(),
    database.collection('visits').aggregate([{ $match: { visitedAt: { $gte: start30 } } }, { $group: { _id: '$day', visits: { $sum: 1 } } }, { $sort: { _id: 1 } }]).toArray()
  ])
  const latest = await database.collection('visitor_sessions').findOne({}, { sort: { lastActivityAt: -1 }, projection: { lastActivityAt: 1 } })
  return { active, today, yesterday, last7, last30, historical, lastActivityAt: latest?.lastActivityAt || null, daily }
})
