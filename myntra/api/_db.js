const mongoose = require("mongoose");

try {
  const dns = require("dns");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Failed to set DNS servers:", e.message);
}

let cached = global.__mongoCache;
if (!cached) {
  cached = global.__mongoCache = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose query buffering
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((m) => {
      return m.connection;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Discard failed promise
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
