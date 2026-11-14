import { type Collection, MongoClient } from 'mongodb';

/** Runs one operation on the `users` collection of the temporary database started by global setup. */
async function withAccounts<T>(operation: (accounts: Collection) => Promise<T>) {
  const uri = process.env.PLAYWRIGHT_MONGO_URI;
  if (!uri) throw new Error('The isolated database was not started by global setup.');
  const client = await MongoClient.connect(uri);
  try {
    return await operation(client.db().collection('users'));
  } finally {
    await client.close();
  }
}

/** Reset: deletes every account, because the application itself cannot delete one. */
export function clearAccounts() {
  return withAccounts((accounts) => accounts.deleteMany({}));
}

/** How many accounts exist. The web pages cannot show that a rejected registration created nothing. */
export function countAccounts() {
  return withAccounts((accounts) => accounts.countDocuments());
}
