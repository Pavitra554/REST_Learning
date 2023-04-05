const mongoose = require("mongoose")
const validator = require("validator")
const bycript = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Task = require('../models/task')

const userSchema = mongoose.Schema({
	email: {
		type: String,
		unique: true,
		required: true,
		validate(value) {
			if (!validator.isEmail(value)) {
				throw new Error("Email is not valid")
			}
		},
	},
	password: {
		type: String,
		required: true,
		trim: true,
		minlength: 7,
		validate(value) {
			if (value.toLowerCase().includes("password")) {
				throw new Error("password")
			}
		},
	},
	tokens: [{
		token: {
			type: String,
			required: true
		}
	}],
	avatar:{
		type:Buffer
	}
},{
	timestamps:true
})

userSchema.virtual('tasks',{
	ref: 'task',
	localField: '_id',
	foreignField: 'owner',
})

userSchema.methods.toJSON = function(){
	const user = this
	const userObject = user.toObject()

	delete userObject.password
	delete userObject.tokens
	delete userObject.avatar
	 
	return userObject
}

//JSON web token
userSchema.methods.GenerateToken = async function () {
	const user = this
	const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET_KEY)
	user.tokens = user.tokens.concat({ token })
	await user.save()
	return token
}
//Login Process
userSchema.statics.findByCredentials = async (email, password) => {
	const acc = await user.findOne({ email })

	if (!acc) {
		throw new Error('Unable to login')
	}

	const isMatch = await bycript.compare(password, acc.password)

	if (!isMatch) {
		throw new Error('Unable to login')
	}
	return acc
}

//Middleware
userSchema.pre("save", async function (next) {
	const user = this
	if (user.isModified("password")) {
		user.password = await bycript.hash(user.password, 4)
	}
	next()
})

//Delete tasks when user removed
userSchema.pre('remove',async function (next){
	const user = this
	await Task.deleteMany({owner:user._id})
	next()

})

const user = mongoose.model("users", userSchema)

module.exports = user
 