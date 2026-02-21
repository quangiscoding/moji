import bcrypt from "bcrypt";
import dotenv from "dotenv";

import User from "../models/User.js";

dotenv.config();

ACCESS_TOKEN_TTL = "30m";
REFRESH_TOKEN_TTL = 14 * 24 * 3600 * 1000; // 14 days

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    // 1. Check missing attributes
    if (!username || !password || !email || !firstName || !lastName) {
      return res.status(400).json({
        message:
          "username, password, email, firstName, lastName  cannot be missing",
      });
    }
    // 2. Check duplicate username
    const duplicate = await User.findOne({ username });
    if (duplicate) {
      res.status(409).json({ message: `Username already exists` });
    }
    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 4. Create a new user
    const user = await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });
    // 5. return
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error in controller signUp", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signIn = async (req, res) => {
  try {
    // 1. Take inputs
    const { username, password } = req.body;
    if ((!username, !password)) {
      return res
        .status(400)
        .json({ message: "Username or Password is missing!" });
    }
    // 2. Take hashedPassword in DB, compare with password
    const user = await User.findOne({ username });
    const errorMessage = "Incorrect username or password";

    if (!user) {
      return res.status(401).json({ message: errorMessage });
    }

    const correct = await bcrypt.compare(password, user.hashedPassword);

    if (!correct) {
      return res.status(401).json({ message: errorMessage });
    }

    // 3. If matches, create access token with JWT

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    // 4. Create refresh token

    const refreshToken = crypto.randomBytes(64).toString("hex");
  } catch (error) {
    console.error("Error in controller signUp", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
