import bcrypt from "bcrypt";

import User from "../models/User.js";

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
export const signIn = async () => {};
