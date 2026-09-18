import { ObjectId } from 'mongodb'

export const serializeMongo = (value: any): any => {
  if (value instanceof ObjectId) return value.toHexString()
  if (Array.isArray(value)) return value.map(serializeMongo)
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, serializeMongo(entry)]))
  }
  return value
}
