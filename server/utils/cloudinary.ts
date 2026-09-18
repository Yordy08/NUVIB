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

export const uploadImage = async (data: string, folder = 'nuvib/products') => {
  const service = getCloudinary()
  return service.uploader.upload(data, { folder, resource_type: 'image', quality: 'auto', fetch_format: 'auto' })
}
