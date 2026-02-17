import { MongoClient, ObjectId } from 'mongodb';
import 'dotenv/config';

const destHost = "localhost:27017"
const dbAdmin = "mongoAdmin";
const dbAdminPassword = "Salasana1";
const authDb = "admin";

const logonUsers = new Map();

const uri = `mongodb://${dbAdmin}:${dbAdminPassword}@${destHost}?authSource=${authDb}`;

const dbName = process.env.MONGO_DB || process.env.DB_NAME || 'testi';
const DATA_COLL = process.env.DATA_COLLECTION || 'data';
const USERS_COLL = process.env.USERS_COLLECTION || 'users';

let clientPromise = null;
function getClient() {
	if (!clientPromise) clientPromise = new MongoClient(uri).connect();
	return clientPromise;
}

const sanitize = (doc) => {
	if (!doc) return doc;
	const o = { ...doc };
	if (o._id) o._id = o._id.toString();
	return o;
};

async function getCollection(name) {
	const client = await getClient();
	return client.db(dbName).collection(name);
}

const findUser = async (username) => {
	const c = await getCollection(USERS_COLL);
	const rows = await c.find({ username }).toArray();
	return rows.map(sanitize);
};

const getAllData = async () => {
	const c = await getCollection(DATA_COLL);
	const rows = await c.find({}).toArray();
	return rows.map(sanitize);
};

const getDataById = async (id) => {
	const c = await getCollection(DATA_COLL);

	if (ObjectId.isValid(String(id))) {
		try {
			const row = await c.findOne({ _id: new ObjectId(String(id)) });
			return row ? [sanitize(row)] : [];
		} catch (e) {}
	}

	const num = Number(id);
	if (!Number.isNaN(num)) {
		const rows = await c.find({ id: num }).toArray();
		return rows.map(sanitize);
	}

	const rows = await c.find({ id: String(id) }).toArray();
	return rows.map(sanitize);
};

const addData = async ({ id, Firstname, Surname, userid }) => {
	const c = await getCollection(DATA_COLL);
	const doc = { id, Firstname, Surname, userid };
	const r = await c.insertOne(doc);
	return { affectedRows: r.insertedCount || (r.acknowledged ? 1 : 0), insertId: r.insertedId ? r.insertedId.toString() : null };
};

const getUsersRecords = async () => {
	const c = await getCollection(DATA_COLL);
	const rows = await c.aggregate([
		{ $lookup: { from: USERS_COLL, localField: 'userid', foreignField: 'username', as: 'user' } },
		{ $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
		{ $project: { id: 1, Firstname: 1, Surname: 1, userid: 1, username: '$user.username', email: '$user.email' } }
	]).toArray();
	return rows.map(sanitize);
};

const deleteDataById = async (id) => {
	const c = await getCollection(DATA_COLL);
	let r;
	if (ObjectId.isValid(String(id))) {
		r = await c.deleteOne({ _id: new ObjectId(String(id)) });
		return { affectedRows: r.deletedCount };
	}

	const num = Number(id);
	if (!Number.isNaN(num)) {
		r = await c.deleteOne({ id: num });
		return { affectedRows: r.deletedCount };
	}

	r = await c.deleteOne({ id: String(id) });
	return { affectedRows: r.deletedCount };
};

const updateData = async ({ id, Firstname, Surname }) => {
	const c = await getCollection(DATA_COLL);
	let r;
	if (ObjectId.isValid(String(id))) {
 		r = await c.updateOne({ _id: new ObjectId(String(id)) }, { $set: { Firstname, Surname } });
 		return { affectedRows: r.modifiedCount };
 	}

	const num = Number(id);
	if (!Number.isNaN(num)) {
		r = await c.updateOne({ id: num }, { $set: { Firstname, Surname } });
		return { affectedRows: r.modifiedCount };
	}

	r = await c.updateOne({ id: String(id) }, { $set: { Firstname, Surname } });
	return { affectedRows: r.modifiedCount };
};

export {
	addData,
	deleteDataById,
	updateData,
	findUser,
	getAllData,
	getDataById,
	logonUsers,
	getUsersRecords
};

