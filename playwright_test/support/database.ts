import { MongoClient } from 'mongodb';

/** Empties the `users` collection of the temporary database started by global setup. */
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
