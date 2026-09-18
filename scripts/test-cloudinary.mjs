import { v2 as cloudinary } from 'cloudinary'
import { MongoClient } from 'mongodb'

if (!process.env.CLOUDINARY_URL) throw new Error('CLOUDINARY_URL no está configurada en .env')
if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI no está configurada en .env')

cloudinary.config({ secure: true, cloudinary_url: process.env.CLOUDINARY_URL })
const databaseName = process.env.MONGODB_DB || 'nuvib'
const client = new MongoClient(process.env.MONGODB_URI)

// SVG DEMO mínimo para probar el flujo sin usar una imagen real de terceros.
const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#102a43"/><text x="80" y="420" fill="white" font-size="96" font-family="Arial">NUVIB DEMO</text></svg>'
const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

try {
  const result = await cloudinary.uploader.upload(dataUri, { folder: 'nuvib/products/demo', resource_type: 'image', public_id: 'nuvib-cloudinary-connection-test', overwrite: true })
  await client.connect()
  const database = client.db(databaseName)
  const product = await database.collection('products').findOne({}, { sort: { createdAt: 1 } })
  if (!product) throw new Error('No existe un producto DEMO en MongoDB')
  await database.collection('products').updateOne({ _id: product._id }, { $set: { images: [result.secure_url], updatedAt: new Date() } })
  console.log(JSON.stringify({ ok: true, publicId: result.public_id, secureUrl: result.secure_url, productSlug: product.slug }, null, 2))
} finally {
  await client.close()
}
