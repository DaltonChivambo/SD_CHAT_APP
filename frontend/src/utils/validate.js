export const checkValidSignInFrom = (email, password) => {
	// valid email and return different different values depending----------
	const isEmailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
		email
	);
	const isPasswordValid =
		/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^((0-9)|(a-z)|(A-Z)|\s)]).{8,}$/.test(
			password
		);
	if (!isEmailValid) return "Formato de email inválido";
	if (!isPasswordValid) return "Senha inválida";
	return null;
};
export const checkValidSignUpFrom = (firstName, lastName, email, password) => {
	const isFirstValid = /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+/.test(firstName);
	const isLastValid = /\b([A-ZÀ-ÿ][-,a-z. ']+[ ]*)+/.test(lastName);
	const isEmailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
		email
	);
	if (!isFirstValid) return "Primeiro nome inválido";
	if (!isLastValid) return "Ultimo nome inválido";
	if (!isEmailValid) return "Formato de email inválido";
	if (password.length < 8) return "Min 8 caracteres";
	if (!/[a-z]/.test(password)) return "Precisa de 1 letra minúscula";
	if (!/[A-Z]/.test(password)) return "Precisa de 1 letra maiúscula";
	if (!/\d/.test(password)) return "Precisa de 1 número";
	if (!/[^((0-9)|(a-z)|(A-Z)|\s)]/.test(password))
		return "Precisa de 1 caractere especial";
	return null;
};
export const checkValidForgotFrom = (email) => {
	const isEmailValid = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(
		email
	);
	if (!isEmailValid) return "Formato de email inválido";
	return null;
};
