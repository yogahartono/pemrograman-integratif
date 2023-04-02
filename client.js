const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = __dirname + '/protos/crud.proto';

const packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true }
  );
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
  const client = new protoDescriptor.crud.CrudService(
    'localhost:50051',
    grpc.credentials.createInsecure()
    );

    // read
    const read = (id, callback) => {
      const request = { id };
      client.Read(request, (error, response) => {
        if (error) {
          console.error(error.details);
          return;
        }
        console.log(`User found: ${JSON.stringify(response)}`);
        if (callback) callback();
      });
    };

    // create
    const create = () => {
  console.clear();
  const request1 = { name: 'Alice Smith', age: 25, email: 'alice.smith@example.com' };
  const request2 = { name: 'Bob Brown', age: 30, email: 'bob.brown@example.com' };
  const request3 = { name: 'Charlie Green', age: 35, email: 'charlie.green@example.com' };
  client.Create(request1, (error, response1) => {
    if (error) {
      console.error(error.details);
      return;
    }
    console.log(`User created successfully with ID ${response1.id}`);
    read(response1.id, () => {
      client.Create(request2, (error, response2) => {
        if (error) {
          console.error(error.details);
          return;
        }
        console.log(`User created successfully with ID ${response2.id}`);
        read(response2.id, () => {
          client.Create(request3, (error, response3) => {
            if (error) {
              console.error(error.details);
              return;
            }
            console.log(`User created successfully with ID ${response3.id}`);
            read(response3.id, () => {
              list(() => {
                update(response2.id, () => {
                  remove(response2.id, () => {
                    list();
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// delete
const remove = (id, callback) => {
  const request = { id };
  client.Delete(request, (error, response) => {
    if (error) {
      console.error(error.details);
      return;
    }
    console.log(`User deleted successfully: ${response.success}`);
    if (callback) callback();
  });
};

//list
const list = (callback) => {
  const request = {};
  client.ListUsers(request, (error, response) => {
    if (error) {
      console.error(error.details);
      return;
    }
    console.log(`Users found: ${JSON.stringify(response.users)}`);
    if (callback) callback();
  });
};

// update
const update = (id, callback) => {
  const request = { id };
  client.Read(request, (error, response) => {
    if (error) {
      console.error(error.details);
      return;
    }
    console.log(`User found: ${JSON.stringify(response)}`);
    const updatedName = `updated ${response.name}`;
    const updatedRequest = { id, name: updatedName, age: response.age, email: response.email };
    client.Update(updatedRequest,(error, response) => {
      if (error) {
        console.error(error.details);
        return;
      }
      console.log(`User updated successfully: ${response.success}`);
      if (callback) callback();
    });
  });
};


  
// const deleteAll = () => {
//   const request = {};
//   client.DeleteAll(request, (error, response) => {
//     if (error) {
//       console.error(error.details);
//       return;
//     }
//     console.log(`All users deleted successfully: ${response.success}`);
//   });
// };

// test
// deleteAll();
create();

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

setTimeout(() => {
  // wait for create() to finish
  list(() => {
    read(2, () => {
      update(2, () => {
        read(2, () => {
          remove(2, () => {
            list();
          });
        });
      });
    });
  });
}, 500); // wait for half a second before starting the test
