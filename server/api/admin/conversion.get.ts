import { requireAdmin } from '../../utils/auth'
import { getDatabase } from '../../utils/mongodb'
import { DEFAULT_CONVERSION_SETTINGS } from '../../utils/conversion'

export default defineEventHandler(async (event) => { await requireAdmin(event); const stored = await (await getDatabase()).collection('site_settings').findOne({ _id: 'conversion' }); return { ...DEFAULT_CONVERSION_SETTINGS, ...(stored?.conversion || {}) } })
