const mongoose = require("mongoose");
const User = require("./models/User");

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "ojhaaditya913@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Kaditya@67";
    const adminName = process.env.ADMIN_NAME || "Aditya Ojha";

    let admin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (!admin) {
      await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: adminPassword,
        role: "admin",
      });
      console.log(`✅ Default user created: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Default user verified: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Seed user error:", error.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    await seedAdmin();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

