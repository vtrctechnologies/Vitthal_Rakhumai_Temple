import User from "./user.model.js";
import generateToken from "../../shared/utils/generateToken.js";

/**
 * Issues an HttpOnly, Secure, SameSite cookie containing the JWT session token
 * to protect against Cross-Site Scripting (XSS) and token theft from browser LocalStorage (SEC-015).
 */
export const sendTokenCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("temple_admin_token", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
};

/**
 * Clears the session cookie upon logout.
 */
export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("temple_admin_token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  });
  res.json({
    success: true,
    status: "success",
    message: "Logged out successfully",
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    // Check if user already exists
    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      res.status(400);
      throw new Error("User with this email already exists");
    }

    // Create user - strictly enforce role: "user" for public registration (SEC-001)
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: "user",
    });

    if (user) {
      const token = generateToken(user._id);
      sendTokenCookie(res, token);
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      };
      res.status(201).json({
        success: true,
        status: "success",
        data: userData,
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error("Please provide email and password");
    }

    // Find user by email or name
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { name: email }],
    });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken(user._id);
      sendTokenCookie(res, token);
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      };
      res.json({
        success: true,
        status: "success",
        data: {
          ...userData,
          admin: { id: user._id, name: user.name, email: user.email, role: user.role },
        },
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile (Read - Self)
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
      res.json({
        success: true,
        status: "success",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          admin: { id: user._id, name: user.name, email: user.email, role: user.role },
        },
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged in user profile (Update - Self)
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const token = generateToken(updatedUser._id);
      sendTokenCookie(res, token);

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          token,
        },
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete own user profile (Delete - Self)
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      await user.deleteOne();
      res.json({
        success: true,
        message: "User account deleted successfully",
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN CONTROLLERS (Manage all users)
// ==========================================

// @desc    Create a user/admin (Admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email, and password");
    }

    if (typeof password !== "string" || password.length < 6) {
      res.status(400);
      throw new Error("Password must be at least 6 characters");
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();
    const assignedRole = role === "admin" ? "admin" : "user";

    // Check if user already exists
    const userExists = await User.findOne({ email: trimmedEmail });
    if (userExists) {
      res.status(400);
      throw new Error("User with this email already exists");
    }

    // Create user with authorized role
    const user = await User.create({
      name: trimmedName,
      email: trimmedEmail,
      password,
      role: assignedRole,
    });

    if (user) {
      res.status(201).json({
        success: true,
        status: "success",
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Read - Admin)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID (Read - Admin)
// @route   GET /api/auth/users/:id
// @access  Private/Admin
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user) {
      res.json({
        success: true,
        data: user,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user by ID (Update - Admin)
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user by ID (Delete - Admin)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      await user.deleteOne();
      res.json({
        success: true,
        message: "User removed successfully",
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  } catch (error) {
    next(error);
  }
};
