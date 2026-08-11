const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
async function registerUserController(req, res) {

    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password"
        })
    }

    const isUserAlreadyExists = await userModel.findOne({
        $or: [ { username }, { email } ]
    })

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "Account already exists with this email address or username"
        })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username,
        email,
        password: hash
    })

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)


    res.status(201).json({
        message: "User registered successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
async function loginUserController(req, res) {

    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password"
        })
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)
    res.status(200).json({
        message: "User loggedIn successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
async function logoutUserController(req, res) {
    const token = req.cookies.token

    if (token) {
        await tokenBlacklistModel.create({ token })
    }

    res.clearCookie("token")

    res.status(200).json({
        message: "User logged out successfully"
    })
}

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
async function getMeController(req, res) {

    const user = await userModel.findById(req.user.id)



    res.status(200).json({
        message: "User details fetched successfully",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })

}

/**
 * @name verifyIdentityController
 * @description verify a user's identity by matching email and username, used as step 1 of password reset
 * @access Public
 */
async function verifyIdentityController(req, res) {
    const { email, username } = req.body

    if (!email || !username) {
        return res.status(400).json({
            message: "Please provide both email address and username."
        })
    }

    const user = await userModel.findOne({ email, username })

    if (!user) {
        return res.status(404).json({
            message: "We couldn't find an account with that email address and username."
        })
    }

    res.status(200).json({
        message: "Identity verified successfully."
    })
}

/**
 * @name resetPasswordController
 * @description reset a user's password after identity verification
 * @access Public
 */
async function resetPasswordController(req, res) {
    const { email, username, newPassword, confirmPassword } = req.body

    if (!email || !username || !newPassword || !confirmPassword) {
        return res.status(400).json({
            message: "All fields are required."
        })
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            message: "Your passwords do not match. Please enter the same password in both fields."
        })
    }

    const user = await userModel.findOne({ email, username })

    if (!user) {
        return res.status(404).json({
            message: "We couldn't find an account with that email address and username."
        })
    }

    const hash = await bcrypt.hash(newPassword, 10)
    user.password = hash
    await user.save()

    res.status(200).json({
        message: "Your password has been reset successfully. You can now log in with your new password."
    })
}



module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController,
    verifyIdentityController,
    resetPasswordController
}
