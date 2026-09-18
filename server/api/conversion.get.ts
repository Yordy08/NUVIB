import { getDatabase } from '../utils/mongodb'
import { DEFAULT_CONVERSION_SETTINGS, publicConversionSettings } from '../utils/conversion'

export default defineEventHandler(async () => { const stored = await (await getDatabase()).collection('site_settings').findOne({ _id: 'conversion' }); return publicConversionSettings({ ...DEFAULT_CONVERSION_SETTINGS, ...(stored?.conversion || {}) }) })
