import poolObj from './dbPool.js';
const {pool} = poolObj;

const logonUsers = new Map()

const query = async (sql, params = []) => 
  pool.query(sql, params)

const execute = async (sql, params = []) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const res = await conn.query(sql, params);
    await conn.commit();
    return res;
  } catch (e) {
    if (conn) await conn.rollback();
    throw e;
  } finally {
    if (conn) conn.release();
  }   
}

const findUser = async ( username ) => 
  query('SELECT * FROM users WHERE username = ?', [username])

const getAllData = async () => 
  query('SELECT * FROM data')

const getDataById = async ( id ) => 
  query('SELECT * FROM data WHERE id = ?', [id])

const addData = async ( {id, Firstname, Surname, userid} ) =>
  execute(
    'INSERT INTO data (id, Firstname, Surname, userid) VALUES (?, ?, ?, ?)', 
    [id, Firstname, Surname, userid]
  )

export {
  addData,
  findUser,
  getAllData,
  getDataById,
  logonUsers
}

/*
const data = [
    {
      "id": 1,
      "Firstname": "Jyri",
      "Surname": "Kemppainen"
    },
    {
      "id": 2,
      "Firtsname": "Petri",
      "Surname": "Laitinen"
    }
  ]

export function getAllData () {
    // replace with actual database query
    return data
}

export function getDataById ( id ) {
  // replace with actual database query
  return data.find(item => item.id === Number(id))
}

export function addData( newData ) {
    // "insert" to simulated database
    data.push( newData )
  
    // return the new user (like an INSERT returning its row)
    return newData
  }

export function updateData(id, data) {
  const existing = getUserById(id);

  if (existing  === undefined) {
    Object.assign(existing, data); // simpler way to copy fields
    return true;
  } else {
    const newData = { id, ...data };
    data.push(newData);
    return false;
  }
}

export function deleteDataById(id) {
  const initialLength = users.length;
  users = users.filter(user => user.id !== id);
  return  users.length < initialLength; // true if a user was removed
}
*/