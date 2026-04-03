import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import fs from "fs";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation - not empty
  // check if user already exists :by username or email
  // check for images, avatar
  // uploaad them to cloudinary, check for avatar
  // create user object - create entry in db
  // remove password and refresh token feed from response
  // check for user creation
  // if user created return response else error

  // get user details from frontend (here we are using postman for that)
  const { fullName, email, userName, password } = req.body;

  // validation - not empty
  if (
    //if any one of these is empty then throw error
    //trim for removing whitespaces
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists :by username or email
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
    if (req.files?.avatar?.[0]?.path) {
      fs.unlinkSync(req.files.avatar[0].path);
    }
    if (req.files?.coverImage?.[0]?.path) {
      fs.unlinkSync(req.files.coverImage[0].path);
    }
    throw new ApiError(409, "User already exists with this email or username");
  }

  // check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //  uploaad them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // check for avatar
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // create user object - create entry in db
  const user = await User.create({
    fullName: fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email: email,
    password: password,
    userName: userName.toLowerCase(),
  });

  //  remove password and refresh token feed from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  //  if user created return response else error
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while regestering the user");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // bring data from req body
  // check for username or email
  // find the user
  // if user exists then check password
  // if password match access and refresh token
  // send cookie

  const { email, userName, password } = req.body;
  if (!userName && !email) {
    throw new ApiError(400, "Username or Email is required");
  }
  const userExists = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (!userExists) {
    throw new ApiError(404, "User does not exist");
  }
  const isPasswordValid = await userExists.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    userExists._id
  );

  const loggedInUser = await User.findById(userExists._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

export { registerUser, loginUser, logoutUser };
