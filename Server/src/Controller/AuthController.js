const User = require("../Model/User");
const validateUser = require("../utils/Validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const redisClient = require("../config/redis");
const Admin = require("../Model/Admin");

const generateTokens = (user) => {
    const payload = {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn: "1h" });
    const refresh = jwt.sign(payload, process.env.JWT_REFRESH_KEY, { expiresIn: "7d" });
    return { token, refresh };
};

// Common error response sanitizer
const sendError = (res, message, statusCode = 400) => {
    let msg = message;
    if (typeof message === "string" && message.includes("<!DOCTYPE html>")) {
        msg = "Unexpected server error, please try again.";
    } else if (typeof message !== "string") {
        msg = message?.message || "An error occurred";
    }
    return res.status(statusCode).json({
        success: false,
        message: msg,
        user: null
    });
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? 'None' : 'Lax',
};

const register = async (req, res) => {
    try {
        validateUser(req.body);

        const existingUser = await User.findOne({ email: req.body.email.toLowerCase() });
        if (existingUser) throw new Error("Email already registered");

        const hashPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashPassword;

        if ((req.body.role || '').toLowerCase() === 'admin') {
            req.body.role = 'user';
        }

        const savedUser = await User.create({ ...req.body, email: req.body.email.toLowerCase() });
        if (!savedUser) throw new Error("Failed to sign up, please try again");

        const { token, refresh } = generateTokens(savedUser);
        res.cookie('token', token, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
        res.cookie('refresh', refresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(201).json({
            success: true,
            message: "Sign up successful",
            user: {
                name: savedUser.name,
                email: savedUser.email,
                number: savedUser.number,
                role: 'user'
            }
        });
    } catch (e) {
        console.error("Register error:", e.message);
        sendError(res, e.message, 400);
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) throw new Error("Invalid credentials");

        const userInfo = await User.findOne({ email: email.toLowerCase() });
        if (!userInfo) return sendError(res, "User not found!", 404);

        const isPasswordCorrect = await bcrypt.compare(password, userInfo.password);
        if (!isPasswordCorrect) return sendError(res, "Invalid credentials", 400);

        const { token, refresh } = generateTokens(userInfo);
        res.cookie('token', token, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
        res.cookie('refresh', refresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 });

        res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                name: userInfo.name,
                email: userInfo.email,
                number: userInfo.number,
                role: userInfo.role
            }
        });
    } catch (e) {
        console.error("Login error:", e.message);
        sendError(res, e.message, 400);
    }
};

const logout = async (req, res) => {
    try {

        res.clearCookie('token');
        res.clearCookie('refresh');
        res.status(200).send('Logout successfully');
    } catch (e) {
        console.error("Logout error:", e.message);
        sendError(res, e.message);
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.user._id;
        const deleted = await User.findByIdAndDelete(userId);

        if (!deleted) return sendError(res, "User not found", 404);

        res.clearCookie('token');
        res.clearCookie('refresh');

        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (e) {
        
        console.error("Delete error:", e.message);
        sendError(res, e.message);
    }
};

const resetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return sendError(res, "Old and new passwords are required", 400);
        }

        const user = await User.findById(req.user._id);
        if (!user) return sendError(res, "User not found", 404);

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return sendError(res, "Old password is incorrect", 400);

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful" });
    } catch (e) {
        console.error("Reset password error:", e.message);
        sendError(res, e.message);
    }
};

const AddAdmin = async(req,res)=>{
    try{
     const {role} = req.user;
     if(role !== "admin") throw new Error("your not a admin");  
     const {email,password} = req.body;
     const find = await User.findOne({email:email});
     if(!find) throw new Error("User does not exist");
     const compare = await bcrypt.compare(password,find.password);
     if(!compare) throw new Error("invalid password");
     find.role = "admin";
     await find.save();
     const save = await Admin.create(find);
     res.status(201).json({
        message:"admin created!"
     })
    }catch(e){
        res.status(400).json({
            message:e.message
        })
    }
}

module.exports = { register, login, logout, deleteUser, resetPassword , AddAdmin };
