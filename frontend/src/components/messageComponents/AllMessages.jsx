import React, { Fragment, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { VscCheckAll } from "react-icons/vsc";
import { CgChevronDoubleDown } from "react-icons/cg";
import {
    SimpleDateAndTime,
    SimpleDateMonthDay,
    SimpleTime,
} from "../../utils/formateDateTime";
import { motion } from "framer-motion";

const AllMessages = ({ allMessage }) => {
    const chatBox = useRef();
    const adminId = useSelector((store) => store.auth?._id);
    const isTyping = useSelector((store) => store?.condition?.isTyping);

    const [scrollShow, setScrollShow] = useState(true);

    // Handle Chat Box Scroll Down
    const handleScrollDownChat = () => {
        if (chatBox.current) {
            chatBox.current.scrollTo({
                top: chatBox.current.scrollHeight,
            });
        }
    };

    // Scroll Button Hidden
    useEffect(() => {
        handleScrollDownChat();
        if (chatBox.current.scrollHeight === chatBox.current.clientHeight) {
            setScrollShow(false);
        }
        const handleScroll = () => {
            const currentScrollPos = chatBox.current.scrollTop;
            if (
                currentScrollPos + chatBox.current.clientHeight <
                chatBox.current.scrollHeight - 30
            ) {
                setScrollShow(true);
            } else {
                setScrollShow(false);
            }
        };
        const chatBoxCurrent = chatBox.current;
        chatBoxCurrent.addEventListener("scroll", handleScroll);
        return () => {
            chatBoxCurrent.removeEventListener("scroll", handleScroll);
        };
    }, [allMessage, isTyping]);

    return (
        <>
            {scrollShow && (
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="absolute bottom-16 right-4 cursor-pointer z-20 text-white/70 bg-white/10 hover:bg-gray-700 p-1.5 rounded-full transition-colors backdrop-blur-sm border border-white/20"
                    onClick={handleScrollDownChat}
                >
                    <CgChevronDoubleDown title="Scroll Down" fontSize={24} />
                </motion.div>
            )}
            <div
                className="flex flex-col w-full px-4 gap-2 py-4 overflow-y-auto overflow-hidden scroll-style h-[73vh] bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900"
                ref={chatBox}
            >
                {allMessage?.map((message, idx) => {
                    return (
                        <Fragment key={message._id}>
                            <div className="sticky top-0 flex w-full justify-center z-10">
                                {new Date(
                                    allMessage[idx - 1]?.updatedAt
                                ).toDateString() !==
                                    new Date(
                                        message?.updatedAt
                                    ).toDateString() && (
                                    <span className="text-xs font-light text-white/60 bg-white/10 h-6 w-fit px-4 rounded-full flex items-center justify-center cursor-pointer backdrop-blur-sm">
                                        {SimpleDateMonthDay(message?.updatedAt)}
                                    </span>
                                )}
                            </div>
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex items-start gap-2 ${
                                    message?.sender?._id === adminId
                                        ? "flex-row-reverse text-white"
                                        : "flex-row text-white"
                                }`}
                            >
                                {message?.chat?.isGroupChat &&
                                    message?.sender?._id !== adminId &&
                                    (allMessage[idx + 1]?.sender?._id !==
                                    message?.sender?._id ? (
                                        <img
                                            src={message?.sender?.image}
                                            alt=""
                                            className="h-9 w-9 rounded-full border border-white/20"
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-full"></div>
                                    ))}
                                <div
                                    className={`${
                                        message?.sender?._id === adminId
                                            ? "bg-gradient-to-tr from-blue-800 to-blue-700 rounded-s-lg rounded-ee-2xl"
                                            : "bg-gradient-to-tr from-gray-800 to-slate-600 rounded-e-lg rounded-es-2xl"
                                    } py-1.5 px-3 min-w-10 text-start flex flex-col relative max-w-[85%] border border-white/10 shadow-md`}
                                >
                                    {message?.chat?.isGroupChat &&
                                        message?.sender?._id !== adminId && (
                                            <span className="text-xs font-medium text-white/90 tracking-wide">
                                                {message?.sender?.firstName}
                                            </span>
                                        )}
                                    <div
                                        className={`mt-1 pb-1.5 ${
                                            message?.sender?._id === adminId
                                                ? "pr-16"
                                                : "pr-12"
                                        }`}
                                    >
                                        <span className="text-white break-words overflow-wrap-anywhere">
                                            {message?.message}
                                        </span>
                                        <span
                                            className="text-[11px] font-light absolute bottom-1 right-2 flex items-end gap-1.5 text-white/70"
                                            title={SimpleDateAndTime(
                                                message?.updatedAt
                                            )}
                                        >
                                            {SimpleTime(message?.updatedAt)}
                                            {message?.sender?._id ===
                                                adminId && (
                                                <VscCheckAll
                                                    color="white"
                                                    fontSize={14}
                                                />
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </Fragment>
                    );
                })}
                {isTyping && (
                    <div id="typing-animation" className="flex gap-1 px-3 py-2">
                        <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce delay-100"></span>
                        <span className="w-2 h-2 bg-white/70 rounded-full animate-bounce delay-200"></span>
                    </div>
                )}
            </div>
        </>
    );
};

export default AllMessages;