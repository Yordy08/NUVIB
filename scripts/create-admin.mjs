import { MongoClient } from 'mongodb'
import { createHash, randomBytes, scryptSync } from 'node:crypto'

const { MONGODB_URI: uri, MONGODB_DB: databaseName = 'nuvib', ADMIN_EMAIL: configuredEmail, ADMIN_USERNAME: configuredUsername, ADMIN_PASSWORD: password } = process.env
const username = (configuredUsername || configuredEmail || '').trim().toLowerCase()
const email = (configuredEmail || `${username}@nuvib.local`).trim().toLowerCase()
if (!uri || !username || !password) throw new Error('Configura MONGODB_URI, ADMIN_USERNAME y ADMIN_PASSWORD antes de crear el administrador')
const salt = randomBytes(16).toString('hex')
const passwordHash = `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
const client = new MongoClient(uri)
try {
  await client.connect()
  await client.db(databaseName).collection('admin_users').updateOne({ $or: [{ username }, { email }] }, { $set: { username, email, passwordHash, role: 'admin', active: true, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true })
  console.log(`Administrador configurado: ${username}`)
} finally { await client.close() }
