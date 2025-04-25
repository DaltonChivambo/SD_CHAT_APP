import React, { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import {
    setChatDetailsBox,
    setMessageLoading,
} from "../../redux/slices/conditionSlice";
import { useDispatch, useSelector } from "react-redux";
import AllMessages from "./AllMessages";
import MessageSend from "./MessageSend";
import { addAllMessages } from "../../redux/slices/messageSlice";
import MessageLoading from "../loading/MessageLoading";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import getChatName, { getChatImage } from "../../utils/getChatName";
import ChatDetailsBox from "../chatDetails/ChatDetailsBox";
import { CiMenuKebab } from "react-icons/ci";
import { toast } from "react-toastify";
import socket from "../../socket/socket";
import { motion } from "framer-motion";

const MessageBox = ({ chatId }) => {
    const dispatch = useDispatch();
    const chatDetailsBox = useRef(null);
    const [isExiting, setIsExiting] = useState(false);
    const isChatDetailsBox = useSelector(
        (store) => store?.condition?.isChatDetailsBox
    );
    const isMessageLoading = useSelector(
        (store) => store?.condition?.isMessageLoading
    );
    const allMessage = useSelector((store) => store?.message?.message);
    const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
    const authUserId = useSelector((store) => store?.auth?._id);

    useEffect(() => {
        const getMessage = (chatId) => {
            dispatch(setMessageLoading(true));
            const token = localStorage.getItem("token");
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/message/${chatId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((json) => {
                    dispatch(addAllMessages(json?.data || []));
                    dispatch(setMessageLoading(false));
                    socket.emit("join chat", selectedChat._id);
                })
                .catch((err) => {
                    console.log(err);
                    dispatch(setMessageLoading(false));
                    toast.error("Falha ao carregar mensagens");
                });
        };
        getMessage(chatId);
    }, [chatId]);

    const handleClickOutside = (event) => {
        if (
            chatDetailsBox.current &&
            !chatDetailsBox.current.contains(event.target)
        ) {
            setIsExiting(true);
            setTimeout(() => {
                dispatch(setChatDetailsBox(false));
                setIsExiting(false);
            }, 500);
        }
    };

    useEffect(() => {
        if (isChatDetailsBox) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isChatDetailsBox]);

    return (
        <div className="flex flex-col h-[80vh] w-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 rounded-lg shadow-lg">
            <div className="py-6 sm:px-6 px-3 w-full h-[7vh] font-semibold flex justify-between items-center bg-gradient-to-r from-gray-900 to-slate-800 text-white shadow-md border-b border-white/10">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            dispatch(addSelectedChat(null));
                        }}
                        className="sm:hidden bg-white/10 hover:bg-gray-700 h-8 w-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                    >
                        <FaArrowLeft title="Voltar" fontSize={14} className="text-white/70" />
                    </motion.div>
                    <img
                        src={getChatImage(selectedChat, authUserId)}
                        alt=""
                        className="h-9 w-9 rounded-full border border-white/20"
                    />
                    <h1 className="line-clamp-1 text-xl tracking-wider text-white">
                        {getChatName(selectedChat, authUserId)}
                    </h1>
                </div>
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch(setChatDetailsBox(true))}
                    className="cursor-pointer text-white/70 hover:text-white transition-colors"
                >
                    <CiMenuKebab fontSize={18} title="Menu" />
                </motion.div>
            </div>

            {isChatDetailsBox && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-[60vh] w-full max-w-96 absolute top-0 left-0 z-20 p-1"
                >
                    <div
                        ref={chatDetailsBox}
                        className="flex border-t border-b border-white/20 bg-gradient-to-br from-gray-900 to-slate-800 overflow-hidden rounded-lg shadow-lg"
                    >
                        <ChatDetailsBox />
                    </div>
                </motion.div>
            )}

            <div className="flex-1 overflow-y-auto scroll-style">
                {isMessageLoading ? (
                    <MessageLoading />
                ) : (
                    <AllMessages allMessage={allMessage} />
                )}
            </div>

            <div className="p-4 bg-gradient-to-r from-gray-900 to-slate-900 border-t border-white/10">
                <MessageSend chatId={chatId} />
            </div>
        </div>
    );
};

export default MessageBox;