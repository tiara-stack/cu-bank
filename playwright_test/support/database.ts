import { MongoClient } from 'mongodb';

/** Reset: deletes every account, because the application itself cannot delete one. */
export async function clearAccounts() {
  const uri = process.env.PLAYWRIGHT_MONGO_URI;
  if (!uri) throw new Error('The isolated database was not started by global setup.');
  const client = await MongoClient.connect(uri);
  try {
    await client.db().collection('users').deleteMany({});
  } finally {
    await client.close();
  }
}
