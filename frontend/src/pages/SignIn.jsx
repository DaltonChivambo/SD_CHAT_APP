import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { addAuth } from "../redux/slices/authSlice";
import { checkValidSignInFrom } from "../utils/validate";
import { PiEye, PiEyeClosedLight } from "react-icons/pi";
import { motion } from "framer-motion";

const SignIn = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [load, setLoad] = useState("");
    const [isShow, setIsShow] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const logInUser = (e) => {
        toast.loading("Entrando na sua conta, aguarde...");
        e.target.disabled = true;
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        })
            .then((response) => response.json())
            .then((json) => {
                setLoad("");
                e.target.disabled = false;
                toast.dismiss();
                if (json.token) {
                    localStorage.setItem("token", json.token);
                    dispatch(addAuth(json.data));
                    navigate("/");
                    toast.success(json?.message || "Login realizado com sucesso!");
                } else {
                    toast.error(json?.message || "Falha ao fazer login.");
                }
            })
            .catch((error) => {
                console.error("Erro:", error);
                setLoad("");
                toast.dismiss();
                toast.error(`Erro: ${error.message || "Problema de conexão"}`);
                e.target.disabled = false;
            });
    };

    const handleLogin = (e) => {
        if (!email || !password) {
            toast.error("Todos os campos são obrigatórios");
            return;
        }
        const validError = checkValidSignInFrom(email, password);
        if (validError) {
            toast.error(validError);
            return;
        }
        setLoad("Carregando...");
        logInUser(e);
    };

    // Variantes para animações
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
    };

    const fieldVariants = {
        hidden: { opacity: 0, x: -30 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" },
        }),
    };

    return (
        <div className="min-h-screen  flex items-center justify-center px-4 py-12">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-8"
            >
                <h2 className="text-3xl font-extrabold text-center text-white mb-10 tracking-wider bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Login SD-Chat
                </h2>
                <form className="space-y-7" onSubmit={(e) => e.preventDefault()}>
                    <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                        <label className="block text-sm font-medium text-white/90 mb-2 tracking-wide">
                            Email
                        </label>
                        <input
                            type="email"
                            placeholder="Seu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 shadow-sm"
                            required
                        />
                    </motion.div>

                    <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible" className="relative">
                        <label className="block text-sm font-medium text-white/90 mb-2 tracking-wide">
                            Senha
                        </label>
                        <input
                            type={isShow ? "text" : "password"}
                            placeholder="Sua senha"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300 pr-12 shadow-sm"
                            required
                        />
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            type="button"
                            onClick={() => setIsShow(!isShow)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                        >
                            {isShow ? (
                                <PiEyeClosedLight fontSize={22} />
                            ) : (
                                <PiEye fontSize={22} />
                            )}
                        </motion.button>
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(59, 130, 246, 0.2)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleLogin}
                        disabled={load !== ""}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {load === "" ? "Entrar" : load}
                    </motion.button>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="flex items-center justify-between text-sm"
                    >
                        <Link
                            to="#"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline underline-offset-4"
                        >
                            Esqueci a senha
                        </Link>
                        <Link
                            to="/signup"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 hover:underline underline-offset-4"
                        >
                            Criar conta
                        </Link>
                    </motion.div>
                </form>
            </motion.div>
        </div>
    );
};

export default SignIn;