import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshToken: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Create TTL index on expiresAt field so MongoDB auto-deletes expired sessions

const fields = { expiresAt: 1 };
const options = { expireAfterSeconds: 0 };

sessionSchema.index(fields, options);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
