import bcrypt from "bcryptjs";
import { findUserByEmail, createUser, toPublicUser } from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are all required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (await findUserByEmail(email)) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, hashedPassword });
    const token = generateToken(user.id);

    return res.status(201).json({
      user: toPublicUser(user),
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong while registering" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id);
    return res.json({ user: toPublicUser(user), token });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong while logging in" });
  }
}

export async function me(req, res) {
  return res.json({ user: req.user });
}

export default { register, login, me };
