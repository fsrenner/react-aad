const faker = require('faker');
const db = require('./sequelize');
const { User } = require('./models');

async function seedDb() {
    await db.init(true);

    // force: true (will drop the tables if they already exist)

    // create users
    await User.sync({ force: true });
    const users = [];
    for (let i = 0; i < 1000; i += 1) {
    users.push({
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      emailAddress: faker.internet.email()
    });
    
  }
  await User.bulkCreate(users);
}

seedDb()
  .then(() => {
    console.log('Seed data complete!')
    process.exit(0);
  })
  .catch((error) => {
    console.log('Failed to seed data!', error);
    process.exit(1);
  });