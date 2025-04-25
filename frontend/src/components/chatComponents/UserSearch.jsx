import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import {
    setChatLoading,
    setLoading,
    setUserSearchBox,
} from "../../redux/slices/conditionSlice";
import { toast } from "react-toastify";
import ChatShimmer from "../loading/ChatShimmer";
import { addSelectedChat } from "../../redux/slices/myChatSlice";
import { SimpleDateAndTime } from "../../utils/formateDateTime";
import socket from "../../socket/socket";
import { motion } from "framer-motion";

const UserSearch = () => {
    const dispatch = useDispatch();
    const isChatLoading = useSelector(
        (store) => store?.condition?.isChatLoading
    );
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [inputUserName, setInputUserName] = useState("");
    const authUserId = useSelector((store) => store?.auth?._id);

    // All Users Api Call
    useEffect(() => {
        const getAllUsers = () => {
            dispatch(setChatLoading(true));
            const token = localStorage.getItem("token");
            fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/users`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((res) => res.json())
                .then((json) => {
                    setUsers(json.data || []);
                    setSelectedUsers(json.data || []);
                    dispatch(setChatLoading(false));
                })
                .catch((err) => {
                    console.log(err);
                    dispatch(setChatLoading(false));
                });
        };
        getAllUsers();
    }, []);

    useEffect(() => {
        setSelectedUsers(
            users.filter((user) => {
                return (
                    user.firstName
                        .toLowerCase()
                        .includes(inputUserName?.toLowerCase()) ||
                    user.lastName
                        .toLowerCase()
                        .includes(inputUserName?.toLowerCase()) ||
                    user.email
                        .toLowerCase()
                        .includes(inputUserName?.toLowerCase())
                );
            })
        );
    }, [inputUserName]);

    const handleCreateChat = async (userId) => {
        dispatch(setLoading(true));
        const token = localStorage.getItem("token");
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                userId: userId,
            }),
        })
            .then((res) => res.json())
            .then((json) => {
                dispatch(addSelectedChat(json?.data));
                dispatch(setLoading(false));
                socket.emit("chat created", json?.data, authUserId);
                toast.success("Chat criado com sucesso");
                dispatch(setUserSearchBox());
            })
            .catch((err) => {
                console.log(err);
                toast.error(err.message);
                dispatch(setLoading(false));
            });
    };

    return (
        <>
            <div className="p-6 w-full h-[7vh] font-semibold flex justify-between items-center bg-gradient-to-r from-gray-900 to-slate-800 text-white shadow-lg">
                <h1 className="mr-2 whitespace-nowrap text-xl tracking-wider text-white">
                    Novo Chat
                </h1>
                <div className="w-2/3 flex flex-nowrap items-center gap-2">
                    <input
                        id="search"
                        type="text"
                        placeholder="Pesquisar usuários..."
                        className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        onChange={(e) => setInputUserName(e.target?.value)}
                    />
                    <label htmlFor="search" className="cursor-pointer text-white/70 hover:text-white transition-colors">
                        <FaSearch title="Pesquisar usuários" fontSize={18} />
                    </label>
                </div>
            </div>
            <div className="flex flex-col w-full px-4 gap-2 py-4 overflow-y-auto overflow-hidden scroll-style h-[73vh] bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
                {selectedUsers.length === 0 && isChatLoading ? (
                    <ChatShimmer />
                ) : (
                    <>
                        {selectedUsers?.length === 0 && (
                            <div className="w-full h-full flex justify-center items-center text-white/70">
                                <h1 className="text-base font-medium tracking-wide text-white/70">
                                    Sem usuários registrados.
                                </h1>
                            </div>
                        )}
                        {selectedUsers?.map((user, index) => {
                            return (
                                <motion.div
                                    key={user?._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="w-full h-16 rounded-lg flex items-center p-3 gap-3 cursor-pointer transition-all border bg-white/5 border-white/10 text-gray-300 hover:bg-gray-800 hover:border-white/20"
                                    onClick={() => handleCreateChat(user._id)}
                                >
                                    <img
                                        className="h-12 min-w-12 rounded-full border border-white/20"
                                        src={user?.image}
                                        alt="img"
                                    />
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <span className="line-clamp-1 capitalize font-medium text-white">
                                                {user?.firstName} {user?.lastName}
                                            </span>
                                            <span className="text-xs font-light text-white/60">
                                                {SimpleDateAndTime(user?.createdAt)}
                                            </span>
                                        </div>
                                        <span className="text-xs font-light line-clamp-1 text-white/70">
                                            {/* No message preview in UserSearch, leaving this empty */}
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

export default UserSearch;