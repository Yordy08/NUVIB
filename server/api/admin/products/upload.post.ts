import { requireAdmin } from '../../../utils/auth'
import { uploadImage } from '../../../utils/cloudinary'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'image' && part.data)
  if (!file?.data || !file.type?.startsWith('image/')) throw createError({ statusCode: 400, statusMessage: 'Selecciona una imagen válida' })
  if (file.data.length > 8 * 1024 * 1024) throw createError({ statusCode: 413, statusMessage: 'La imagen no puede superar 8 MB' })
  const result = await uploadImage(`data:${file.type};base64,${file.data.toString('base64')}`)
  return { url: result.secure_url, publicId: result.public_id }
})
