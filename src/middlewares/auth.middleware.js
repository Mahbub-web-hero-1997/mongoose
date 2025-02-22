import User from "../models/user.model.js";
import ApiError from "../utils/ApiErrors.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyJwt = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    // console.log("Received Token:", token);

    if (!token) {
      throw new ApiError(401, "Unauthorized: No token provided");
    }

    // const decodedWithoutVerify = jwt.decode(token, { complete: true });
    // console.log("Decoded Token (Without Verification):", decodedWithoutVerify);

    // Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);

    const user = await User.findById(decoded?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    throw new ApiError(401, error.message);
  }
});

export default verifyJwt;
