const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const sqlite3 = require('sqlite3').verbose();

// const db = new sqlite3.Database(':memory:');
const db = new sqlite3.Database('database.db');

const PROTO_PATH = __dirname + '/protos/crud.proto';

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
);
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER, email TEXT)");

  //Create
  const create = (call, callback) => {
    const { name, age, email } = call.request;
    const query = `INSERT INTO users (name,age, email) VALUES ("${name}", ${age}, "${email}")`;
    db.run(query, function(err) {
      if (err) {
        console.error(err);
        callback({ code: grpc.status.INTERNAL, message: err.message });
        return;
      }
      console.log(`User ${name} has been created with ID: ${this.lastID}`);
      callback(null, { success: true, id: this.lastID || this.changes });
    });
  };
  
  // Read
const read = (call, callback) => {
  const id = call.request.id;
  const query = `SELECT * FROM users WHERE id = ${id}`;
  db.get(query, function(err, row) {
    if (err) {
      console.error(err);
      callback({ code: grpc.status.INTERNAL, message: err.message });
      return;
    }
    if (!row) {
      callback({ code: grpc.status.NOT_FOUND, details: `User with ID ${id} not found` });
      return;
    }
    const user = {
      id: row.id,
      name: row.name,
      age: row.age,
      email: row.email
    };
    callback(null, { user });
  });
};

// Update
const update = (call, callback) => {
  const query = `UPDATE users SET name = 'updated ' || name`;
  db.run(query, function(err) {
    if (err) {
      console.error(err);
      callback({ code: grpc.status.INTERNAL, message: err.message });
      return;
    }
    console.log(`All users have been updated`);
    callback(null, { success: true });
  });
};
  
  //Delete
  const remove = (call, callback) => {
    const id = call.request.id;
    const query = `DELETE FROM users WHERE id = ${id}`;
    db.run(query, function(err) {
      if (err) {
        console.error(err);
        callback({ code: grpc.status.INTERNAL, message: err.message });
        return;
      }
      if (this.changes === 0) {
        callback({ code: grpc.status.NOT_FOUND, details: `User with ID ${id} not found` });
        return;
      }
      console.log(`User with ID ${id} has been deleted`);
      callback(null, { success: true });
    });
  };

  //List
  const listUsers = (call, callback) => {
    const query = `SELECT * FROM users`;
    db.all(query, function(err, rows) {
      if (err) {
        console.error(err);
        callback({ code: grpc.status.INTERNAL, message: err.message });
        return;
      }
      const users = rows.map((row) => ({
        id: row.id,
        name: row.name,
        age: row.age,
        email: row.email,
      }));
      callback(null, { users });
    });
  };
  
  server.addService(protoDescriptor.crud.CrudService.service, {
    Create: create,
    Read: read,
    Update: update,
    Delete: remove,
    ListUsers: listUsers,
  });
  
  server.bind('localhost:50051', grpc.ServerCredentials.createInsecure());
  console.log('Server running at http://localhost:50051');
  server.start();
});