const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/jwtProvider");

const registerUser = async (req, res, next) => {
	let { firstName, lastName, email, password } = req.body;
	const existingUser = await User.findOne({ email: email });
	if (existingUser) {
		return res.status(400).json({ message: `Nome de usuário não disponível` });
	}
	password = bcrypt.hashSync(password, 8);
	const userData = new User({
		firstName,
		lastName,
		email,
		password,
	});
	const user = await userData.save();
	const jwt = generateToken(user._id);
	res.status(200).json({
		message: "Cadastrado com sucesso",
		token: jwt,
	});
};

const loginUser = async (req, res) => {
	let { email, password } = req.body;
	let user = await User.findOne({ email: email });
	if (!user) {
		return res.status(404).json({ message: `Senha ou email invalidos` });
	}
	const isPasswordValid = bcrypt.compareSync(password, user.password);
	if (!isPasswordValid) {
		return res.status(401).json({ message: "Senha ou email invalidos" });
	}
	const jwt = generateToken(user._id);
	user.password = null;
	res.status(200).json({
		message: "Entrou com sucesso",
		data: user,
		token: jwt,
	});
};

module.exports = { registerUser, loginUser };
