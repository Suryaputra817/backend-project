import { asyncHandler } from "../utils/asyncHandeler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  console.log("email: ", email);

  // validation - not empty
  if (
    //if any one of these is empty then throw error
    //trim for removing whitespaces
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check if user already exists :by username or email
  const existedUser = User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser) {
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
    fullName:fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email:email,
    password:password,
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

export default registerUser;
