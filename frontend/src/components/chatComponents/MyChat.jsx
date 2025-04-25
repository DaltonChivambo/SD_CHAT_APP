import React, { useEffect } from "react";
import { FaPenAlt } from "react-icons/fa";
import { addMyChat, addSelectedChat } from "../../redux/slices/myChatSlice";
import { useDispatch, useSelector } from "react-redux";
import {
    setChatLoading,
    setGroupChatBox,
} from "../../redux/slices/conditionSlice";
import ChatShimmer from "../loading/ChatShimmer";
import getChatName, { getChatImage } from "../../utils/getChatName";
import { VscCheckAll } from "react-icons/vsc";
import { SimpleDateAndTime, SimpleTime } from "../../utils/formateDateTime";
import { motion } from "framer-motion";

const MyChat = () => {
    const dispatch = useDispatch();
    const myChat = useSelector((store) => store.myChat.chat);
    const authUserId = useSelector((store) => store?.auth?._id);
    const selectedChat = useSelector((store) => store?.myChat?.selectedChat);
    const isChatLoading = useSelector(
        (store) => store?.condition?.isChatLoading
    );

    // Re-render when a new message or group chat is created
    const newMessageId = useSelector((store) => store?.message?.newMessageId);
    const isGroupChatId = useSelector((store) => store.condition.isGroupChatId);

    // Fetch all chats
    useEffect(() => {
        const getMyChat = () => {
            dispatch(setChatLoading(true));
            const token = localStorage.getItem("token");
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((json) => {
                    dispatch(addMyChat(json?.data || []));
                    dispatch(setChatLoading(false));
                })
                .catch((err) => {
                    console.log(err);
                    dispatch(setChatLoading(false));
                });
        };
        getMyChat();
    }, [newMessageId, isGroupChatId]);

    return (
        <>
            <div className="p-6 w-full h-[7vh] font-semibold flex justify-between items-center bg-gradient-to-r from-gray-900 to-slate-800 text-white shadow-lg">
                <h1 className="mr-2 whitespace-nowrap text-xl tracking-wider text-white">
                    Meu Chat
                </h1>
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 border border-white/20 py-1 px-3 rounded-lg cursor-pointer bg-white/10 backdrop-blur-sm hover:bg-gray-700 transition-colors"
                    title="Criar novo grupo"
                    onClick={() => dispatch(setGroupChatBox())}
                >
                    <h1 className="line-clamp-1 whitespace-nowrap w-full text-white">
                        Novo Grupo
                    </h1>
                    <FaPenAlt />
                </motion.div>
            </div>
            <div className="flex flex-col w-full px-4 gap-2 py-4 overflow-y-auto overflow-hidden scroll-style h-[73vh] bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 ">
                {myChat.length === 0 && isChatLoading ? (
                    <ChatShimmer />
                ) : (
                    <>
                        {myChat?.length === 0 && (
                            <div className="w-full h-full flex justify-center items-center text-white/70">
                                <h1 className="text-base font-medium tracking-wide text-white/70">
                                    Iniciar uma nova conversa.
                                </h1>
                            </div>
                        )}
                        {myChat?.map((chat, index) => {
                            const isSelected = selectedChat?._id === chat?._id;
                            return (
                                <motion.div
                                    key={chat?._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`w-full h-16 rounded-lg flex items-center p-3 gap-3 cursor-pointer transition-all border ${
                                        isSelected
                                            ? "bg-gradient-to-r from-gray-600 to-gray-600 text-white border-white/30 shadow-md"
                                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-gray-800 hover:border-white/20"
                                    }`}
                                    onClick={() => {
                                        dispatch(addSelectedChat(chat));
                                    }}
                                >
                                    <img
                                        className="h-12 w-12 rounded-full border border-white/20"
                                        src={getChatImage(chat, authUserId)}
                                        alt="img"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="line-clamp-1 capitalize font-medium tracking-wide text-white">
                                                {getChatName(chat, authUserId)}
                                            </span>
                                            <span className={`text-xs font-light ${isSelected ? "text-white/90" : "text-white/60"}`}>
                                                {chat?.latestMessage &&
                                                    SimpleTime(
                                                        chat?.latestMessage
                                                            ?.createdAt
                                                    )}
                                            </span>
                                        </div>
                                        <span className={`text-xs font-light line-clamp-1 flex items-center ${isSelected ? "text-white/90" : "text-white/70"}`}>
                                            {chat?.latestMessage ? (
                                                <>
                                                    {chat?.latestMessage
                                                        ?.sender?._id ===
                                                        authUserId && (
                                                        <VscCheckAll
                                                            color={isSelected ? "white" : "#60a5fa"}
                                                            fontSize={14}
                                                        />
                                                    )}
                                                    <span className="ml-1">
                                                        {
                                                            chat?.latestMessage
                                                                ?.message
                                                        }
                                                    </span>
                                                </>
                                            ) : (
                                                <span>
                                                    {SimpleDateAndTime(
                                                        chat?.createdAt
                                                    )}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </>
                )}
            </div>
        </>
    );
};

export default MyChat;