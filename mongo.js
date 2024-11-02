import mongoose, { Schema, model } from "mongoose";

const argc = process.argv.length;
if (argc < 3) {
  console.log(
    "Provide DB user password as the first argument: node mongo.js <password>"
  );
  process.exit(1);
}

if (argc === 4 || argc > 5) {
  console.log(
    "Provide both name and number arguments after password. If name includes a space, enclose it in quotation marks."
  );
  process.exit(1);
}

const password = process.argv[2];
const mongo_uri = `mongodb+srv://winningMove:${password}@cluster0.w4hhb.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`;

const personSchema = new Schema({
  name: String,
  number: String,
});
const Person = model("Person", personSchema);

try {
  await mongoose.connect(mongo_uri);

  switch (argc) {
    case 3:
      const persons = await Person.find({});
      console.log("Phonebook:");
      persons.forEach(({ name, number }) => {
        console.log(`${name} ${number}`);
      });
      break;
    case 5:
      const newPerson = new Person({
        name: process.argv[3],
        number: process.argv[4],
      });
      const { name, number } = await newPerson.save();
      console.log(`Added ${name} number ${number} to phonebook`);
      break;
  }
} catch (error) {
  console.error("Error connecting or during operations:", error);
} finally {
  await mongoose.connection.close();
}
