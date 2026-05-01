import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

const toUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Name, email, and password are required" });
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    return res.status(409).json({ msg: "Email already in use" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashed,
    role: role === "admin" ? "admin" : "member"
  });

  res.status(201).json({ token: createToken(user), user: toUserPayload(user) });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: "Email and password are required" });
  }

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ msg: "Invalid password" });

  const token = createToken(user);

  res.json({ token, user: toUserPayload(user) });
};

export const me = async (req, res) => {
  const user = await User.findById(req.user.id).select("name email role");

  if (!user) {
    return res.status(404).json({ msg: "User not found" });
  }

  res.json({ user: toUserPayload(user) });
};

export const listUsers = async (req, res) => {
  const users = await User.find().select("name email role").sort({ name: 1 });
  res.json(users.map(toUserPayload));
};