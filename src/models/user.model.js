import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: (value) => {
          return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(value);
        },
        message: "Please enter a valid email address",
      },
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    watchTime: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    avatar: {
      type: String,
      default: "default.jpg",
    },
    coverImage: {
      type: String,
      default: "default_cover.jpg",
    },
    refreshToken: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  if (!password) return null;
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = async function () {
  const token = jwt.sign(
    { _id: this._id, userName: this.userName, email: this.email },
    process.env.ACCESS_TOKEN_SECRET_KEY.trim(),
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY.trim(),
    }
  );
  // console.log({
  //   SecretKey: process.env.ACCESS_TOKEN_SECRET_KEY,
  //   Token: token,
  //   expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  // });
  return token;
};
userSchema.methods.generateRefreshToken = function () {
  const token = jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
  return token;
};
const User = mongoose.model("User", userSchema);
export default User;
