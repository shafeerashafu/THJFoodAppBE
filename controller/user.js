const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
require('dotenv').config();


const registerController = async (req, res) => {
  try {
    
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({
        message: "User already exist",
        success: false,
      });
    }

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    req.body.password = hashPassword;

    const confrimPassword = await bcrypt.hash(req.body.passwordConfrim, salt);

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCase: false,
      specialChars: false,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
    });

    req.body.passwordConfrim = confrimPassword;

    if (req.body.password === req.body.passwordConfrim) {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        profileImage: req.body.profileImage,
        password: req.body.password,
        passwordConfrim: req.body.passwordConfrim,
        otp: otp,
      });

      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS || "",
        },
      });

      const mailOptions = {
        from: "Auth client webdev warriors",
        to: req.body.email,
        subject: "Otp for email verification",
        text: `Your verify otp is ${otp}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
         
          return res.status(500).send("Error sending email..");
        }
        res.send({
          message: "Otp sent to email",
        });
      });

      return res.status(201).send({
        message: "Register sucessfully",
        data: {
          user: newUser,
          token,
        },
        success: true,
      });
    } else {
      return res.status(201).send({
        message: "Password not match",

        success: false,
      });
    }
  } catch (error) {
    
    return res.status(500).send({
      message: "Register error",

      success: false,
    });
  }
};

const authConroller = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(200).send({
        message: "User not found",
        success: false,
      });
    } else {
     
      return res.status(200).send({
        message: "Register successfully",
        data: {
          user,
        },
        success: true,
      });
    }
  } catch (error) {
   
    res.status(500).send({
      success: false,
      message: `Auth error`,
    });
  }
};

const loginController = async (req, res) => {
  try {
   
    const user = await User.findOne({ email: req.body.email }).select(
      "+password"
    );
    if (!user) {
      return res.status(200).send({
        message: "User not found",
        success: false,
      });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);

    const signuser = await User.findOne({ email: req.body.email });
    if (!isMatch) {
      return res.status(200).send({
        success: false,
        message: `Invalid password and email`,
      });
    }

    const token = jwt.sign({ id: signuser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(201).send({
      message: "Login sucessfully",
      data: {
        user: signuser,
        token,
      },
      success: true,
    });
  } catch (error) {
   
    res.status(500).send({
      success: false,
      message: `Auth error`,
    });
  }
};

const verifyOtpController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (user.otp === req.body.combinedOtp) {
      user.isVerified = true;
      await user.save();
      res.status(200).send({
        success: true,
        message: `otp verified`,
      });
    } else {
      res.status(200).send({
        success: false,
        message: `otp not verified`,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: `failed to verified`,
    });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      name,
      profileImage,
      userId,
      street,
      city,
      state,
      zipCode,
      country,
    } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).send({
        message: "User not found",
        success: false,
      });
    }

    user.name = name || user.name;
    user.profileImage = profileImage || user.profileImage;
    user.street = street || user.street;
    user.city = city || user.city;
    user.state = state || user.state;
    user.zipCode = zipCode || user.zipCode;
    user.country = country || user.country;

    await user.save();
    return res.status(201).send({
      message: "Profile update succesfully",
      success: true,
    });
  } catch (error) {
    return res.status(200).send({
      message: "User error",
      success: false,
    });
  }
};

module.exports = {
  registerController,
  authConroller,
  loginController,
  verifyOtpController,
  updateUserProfile,
};
