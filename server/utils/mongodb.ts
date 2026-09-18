import { MongoClient, type Db } from 'mongodb'

let clientPromise: Promise<MongoClient> | undefined

export const getDatabase = async (): Promise<Db> => {
  const config = useRuntimeConfig()
  if (!config.mongodbUri) throw createError({ statusCode: 500, statusMessage: 'MongoDB no está configurado' })

  if (!clientPromise) {
    const client = new MongoClient(config.mongodbUri)
    clientPromise = client.connect()
  }

  const client = await clientPromise
  return client.db(config.mongodbDb)
}
