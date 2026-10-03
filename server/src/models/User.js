import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      index: true,
    },
    // bcrypt hash — the plaintext password is never stored.
    passwordHash: {
      type: String,
      required: true,
    },
    // Small base64 data URL, or null. Kept simple for now; if avatars
    // grow (many users, larger images) this is the first thing to move
    // out to object storage (S3/Cloudinary/etc.) instead of the DB.
    avatar: {
      type: String,
      default: null,
    },
    plan: {
      type: String,
      enum: ["free", "pro"],
      default: "free",
    },
  },
  { timestamps: true }
);

// Only ever return the safe, public-facing shape of a user — never the
// hash — so it's hard to accidentally leak it in an API response.
userSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    plan: this.plan,
  };
};

export default mongoose.models.User || mongoose.model("User", userSchema);