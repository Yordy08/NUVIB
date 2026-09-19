import { v2 as cloudinary } from 'cloudinary'

let configured = false

const getCloudinary = () => {
  if (!configured) {
    const config = useRuntimeConfig()
    if (!config.cloudinaryUrl) throw createError({ statusCode: 500, statusMessage: 'Cloudinary no está configurado' })
    cloudinary.config({ secure: true, cloudinary_url: config.cloudinaryUrl })
    configured = true
  }
  return cloudinary
}

const getPublicId = (value: unknown) => {
  if (typeof value !== 'string' || !value.includes('res.cloudinary.com')) return null
  try {
    const url = new URL(value)
    const marker = '/upload/'
    const start = url.pathname.indexOf(marker)
    if (start < 0) return null
    const parts = url.pathname.slice(start + marker.length).split('/').filter(Boolean)
    const versionIndex = parts.findIndex(part => /^v\d+$/.test(part))
    const asset = (versionIndex >= 0 ? parts.slice(versionIndex + 1) : parts).join('/')
    return asset.replace(/\.[a-z0-9]+$/i, '') || null
  } catch {
    return null
  }
}

export const destroyCloudinaryImages = async (values: unknown[]) => {
  const publicIds = [...new Set(values.map(getPublicId).filter((value): value is string => Boolean(value)))]
  if (!publicIds.length) return
  const service = getCloudinary()
  await Promise.all(publicIds.map(publicId => service.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' })))
}

export const uploadImage = async (data: string, folder = 'nuvib/products') => {
  const service = getCloudinary()
  return service.uploader.upload(data, { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' })
}
