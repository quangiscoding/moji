import bcrypt from "bcrypt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

import User from "../models/User.js";
import Session from "../models/Session.js";

dotenv.config();

const ACCESS_TOKEN_TTL = "30m";
const REFRESH_TOKEN_TTL = 14 * 24 * 3600 * 1000; // 14 days
const serverErrorMessage = "Internal server error";

export const signUp = async (req, res) => {
  try {
    // 1. Take user info (check missing fields, duplicates)
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      return res.status(409).json({ message: "Username already exists!" });
    }
    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 3. Create new user
    const user = await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });
    // 4. Return
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in signUp controller", error);
    return res.status(500).json({ message: serverErrorMessage });
  }
};

export const signIn = async (req, res) => {
  try {
    // 1. Take user inputs (check missing fields)
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }
    // 2. Compare password to hashed password in database
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password!" });
    }
    const correct = await bcrypt.compare(password, user.hashedPassword);
    if (!correct) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password!" });
    }
    // 3. If correct, create access token with JWT
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );
    // 4. Create refresh token
    const refreshToken = randomBytes(64).toString("hex");
    // 5. Create a new session to save the refresh token'
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
    // 6. Return refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: REFRESH_TOKEN_TTL,
    });
    // 7. Return access token in res
    res.status(200).json({
      message: `User ${user.displayName} has logged in!`,
      accessToken,
    });
  } catch (error) {
    console.error("Error in signIn controller", error);
    return res.status(500).json({ message: serverErrorMessage });
  }
};
