import User from "../models/user.model.js";
import ApiError from "../utils/ApiErrors.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import uploadToCloudinary from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};
// user Registration Method
const registerUser = asyncHandler(async (req, res) => {
  // Todos
  // get user data from frontend
  // check andy fields are not empty
  // check if user already exists
  // check image, check avatar
  // update image on cloudinary
  // create user object, create entry in DB
  // remove password and refreshToken fields from response
  // check for user creation
  // return response
  const { userName, fullName, email, password } = req.body;
  if (
    [fullName, userName, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  //   Check user is not existing
  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }
  //   file Upload
  const avatarLocalPath = await req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Please provide an avatar image");
  }
  let coverImageLocalPath;
  if (
    req.files?.coverImage &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = await req.files?.coverImage[0]?.path;
  }
  const avatar = await uploadToCloudinary(avatarLocalPath);
  const coverImage = await uploadToCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(500, "Failed to upload avatar image to cloudinary");
  }

  const user = await User.create({
    userName,
    fullName,
    email,
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || "",
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});
// User Login Method
const loginUser = asyncHandler(async (req, res) => {
  // todo
  // userName or email
  // find user by username or email
  // check password
  // generate generate Access and RefreshToken
  //   send token to cookie
  const { userName, email, password } = req.body;
  if (!(email || userName) || !password) {
    throw new ApiError(400, "Username or email and password are required");
  }
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid password");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  console.log({ accessToken: accessToken });
  console.log({ refreshToken: refreshToken });
  res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});
// user LogOut Method
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { refreshToken: undefined },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

export { registerUser, loginUser, logoutUser };
