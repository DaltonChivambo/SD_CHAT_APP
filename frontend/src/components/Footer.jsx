import React from "react";
import { FaPenAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => {
    return (
        <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full  shadow-lg border-white/20 py-6 px-4 flex flex-col items-center text-white"
        >

            <h1 className="text-center text-sm font-semibold">
                Todos os direitos reservados 2025 &copy; SD-Chat
            </h1>
        </motion.footer>
    );
};

export default Footer;
