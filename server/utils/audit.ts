import type { Db } from 'mongodb'

export const recordAdminAction = async (database: Db, session: any, action: string, module: string, recordId: unknown, details?: Record<string, unknown>) => {
  await database.collection('admin_audit').insertOne({ action, module, recordId, actor: session?.email || 'admin', details: details || {}, createdAt: new Date() })
}
