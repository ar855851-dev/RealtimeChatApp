import { useDispatch, useSelector } from "react-redux";
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { toast } from "react-hot-toast";
import { useState, useEffect } from "react";
import moment from "moment";
import { clearUnreadMessageCount } from "./../../../apiCalls/chat";
import store from "./../../../redux/store";
import { setAllChats } from "../../../redux/usersSlice";

function ChatArea({ socket }) {

    const dispatch = useDispatch();



    const {
        selectedChat,
        user,
        allChats
    } = useSelector(state => state.userReducer);

    const [message, setMessage] = useState("");
    const [allMessages, setAllMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);


    // ==========================================
    // SAMNE WALE USER KA NAME NIKALNE KE LIYE
    // ==========================================
    const recipientUser = selectedChat?.members?.find(
        (m) => String(m._id) !== String(user?._id)
    );


    // ==========================================
    // JOIN USER SOCKET ROOM
    // ==========================================

    useEffect(() => {

        if (socket && user?._id) {

            console.log("🟢 JOINING USER ROOM:", user._id);

            socket.emit("join-room", String(user._id));


            
        }

    }, [socket, user?._id]);


    // ==========================================
    // SEND MESSAGE
    // ==========================================

    const sendMessage = async () => {

        if (!message.trim()) {
            return;
        }

        if (!selectedChat || !user) {
            return;
        }

        try {

            const newMessage = {
                chatId: selectedChat._id,
                sender: user._id,
                text: message.trim()
            };


            // Save message in MongoDB
            const response = await createNewMessage(newMessage);


            if (response.success) {

                // Add message to sender's screen immediately
                setAllMessages(prevMsg => [
                    ...prevMsg,
                    response.data
                ]);


                // Send realtime message
                socket.emit("send-message", {

                    ...newMessage,

                    members: selectedChat.members.map(
                        member => String(member._id)
                    ),

                    read: false,

                    createdAt: response.data.createdAt
                });


                console.log("📤 MESSAGE SENT THROUGH SOCKET");


                setMessage("");
            }

        } catch (error) {

            console.error(error);

            toast.error(error.message);
        }
    };


    // ==========================================
    // GET ALL MESSAGES
    // ==========================================

    const getMessage = async () => {

        if (!selectedChat?._id) {
            return;
        }

        try {

            dispatch(showLoader());

            const response =
                await getAllMessages(selectedChat._id);

            dispatch(hideLoader());

            if (response.success) {

                setAllMessages(response.data);
            }

        } catch (error) {

            dispatch(hideLoader());

            toast.error(error.message);
        }
    };


    // ==========================================
    // CLEAR UNREAD
    // ==========================================

const clearUnreadMessages = async () => {
    if (!selectedChat?._id) return;

    try {

        const currentAllChats =
            store.getState().userReducer.allChats || [];

        const updatedChats = currentAllChats.map(chat => {

            if (
                String(chat._id) ===
                String(selectedChat._id)
            ) {
                return {
                    ...chat,
                    unreadMessagesCount: 0
                };
            }

            return chat;
        });

        dispatch(setAllChats(updatedChats));

        const response = await clearUnreadMessageCount(
            selectedChat._id
        );

        if (response.success) {

            // 🔥 IMPORTANT:
            // Receiver ne messages read kar liye,
            // ab sender ko realtime batao
            socket.emit("clear-unread-messages", {
                chatId: selectedChat._id,
                members: selectedChat.members.map(
                    member => String(member._id)
                )
            });

            console.log(
                "🟢 READ STATUS SENT TO BOTH USERS"
            );

        } else {
            console.log(
                "❌ Failed to clear unread:",
                response.message
            );
        }

    } catch (error) {
        console.error("❌ CLEAR UNREAD ERROR:", error);
        toast.error(error.message);
    }
};


    // ==========================================
    // CHAT OPEN + SOCKET LISTENERS
    // ==========================================

useEffect(() => {

    if (!selectedChat?._id || !socket) {
        return;
    }

    getMessage();

    if (
        selectedChat?.lastMessage?.[0]?.sender !==
        user?._id
    ) {
        clearUnreadMessages();
    }


    // ==========================================
    // RECEIVE NEW MESSAGE
    // ==========================================

    const receiveMessage = (message) => {

        console.log(
            "🔥🔥 CHAT AREA RECEIVED:",
            message
        );

        const currentSelectedChat =
            store.getState().userReducer.selectedChat;


        if (
            String(currentSelectedChat?._id) ===
            String(message.chatId)
            &&
            String(message.sender) !==
            String(user?._id)
        ) {

            setAllMessages(prevMsg => {

                const alreadyExists =
                    prevMsg.some(
                        msg =>
                            String(msg._id) ===
                            String(message._id)
                    );

                if (alreadyExists) {
                    return prevMsg;
                }

                return [
                    ...prevMsg,
                    message
                ];
            });

            clearUnreadMessages();
        }
    };


    // ==========================================
    // 🔥 MESSAGE READ EVENT
    // ==========================================

    const messageCountCleared = (data) => {

        console.log(
            "🔴 MESSAGE READ EVENT RECEIVED:",
            data
        );

        if (
            String(data.chatId) !==
            String(selectedChat?._id)
        ) {
            return;
        }

        setAllMessages(prevMessages =>
            prevMessages.map(msg => {

                const senderId =
                    typeof msg.sender === "string"
                        ? msg.sender
                        : msg.sender?._id;

                if (
                    String(senderId) ===
                    String(user?._id)
                ) {
                    return {
                        ...msg,
                        read: true
                    };
                }

                return msg;
            })
        );
    };


    socket.on(
        "receive-message",
        receiveMessage
    );

    socket.on(
        "message-count-cleared",
        messageCountCleared
    );

    socket.on("started-typing", (data) => {
        if(selectedChat._id === data.chatId && data.sender !== user._id) {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
            }, 2000);
        }
    })



    return () => {

        socket.off(
            "receive-message",
            receiveMessage
        );

        socket.off(
            "message-count-cleared",
            messageCountCleared
        );
    };

}, [selectedChat?._id, socket]);


    // ==========================================
    // AUTO SCROLL
    // ==========================================

    useEffect(() => {

        const msgContainer =
            document.getElementById(
                "main-chat-area"
            );


        if (msgContainer) {

            msgContainer.scrollTop =
                msgContainer.scrollHeight;
        }

    }, [allMessages]);


    // ==========================================
    // TIME
    // ==========================================

    const formatTime = (timestamp) => {

        if (!timestamp) {
            return "";
        }

        const now = moment();
        const msgDate = moment(timestamp);

        const diff = now.diff(msgDate, "days");


        if (
            diff < 1 &&
            now.date() === msgDate.date()
        ) {

            return `Today ${msgDate.format("hh:mm A")}`;

        } else if (
            diff <= 1 ||
            (
                diff < 2 &&
                now.date() !== msgDate.date()
            )
        ) {

            return `Yesterday ${msgDate.format("hh:mm A")}`;

        } else {

            return msgDate.format(
                "MMM D, hh:mm A"
            );
        }
    };


    // ==========================================
    // NAME
    // ==========================================

    function formatName(userObj) {

        if (!userObj || !userObj.firstname) {
            return "";
        }

        let fname =
            userObj.firstname.charAt(0).toUpperCase() +
            userObj.firstname.slice(1).toLowerCase();

        let lname = userObj.lastname
            ? userObj.lastname.charAt(0).toUpperCase() +
              userObj.lastname.slice(1).toLowerCase()
            : "";

        return (fname + " " + lname).trim();
    }


    // ==========================================
    // UI
    // ==========================================

    return (
        <>
            {selectedChat && (

                <div className="app-chat-area">

                    <div className="app-chat-area-header">

                        {/* YAHAN FIX KIYA HAI: recipientUser pass kiya hai */}
                        {formatName(recipientUser)}

                    </div>


                    <div
                        className="main-chat-area"
                        id="main-chat-area"
                    >

                        {allMessages.map(msg => {

                            const isCurrentUserSender =
                                (
                                    typeof msg.sender === "string"
                                        ? msg.sender
                                        : msg.sender?._id
                                ) === user?._id;


                            return (

                                <div
                                    className="message-container"
                                    key={msg._id}
                                >

                                    <div>

                                        <div
                                            className={
                                                isCurrentUserSender
                                                    ? "send-message"
                                                    : "received-message"
                                            }
                                        >
                                            {msg.text}
                                        </div>


                                        <div className="message-timestamp">

                                            {formatTime(
                                                msg.createdAt
                                            )}


                                            {isCurrentUserSender &&
                                                msg.read && (

                                                    <span
                                                        style={{
                                                            color: "#e74c3c",
                                                            marginLeft: "5px",
                                                            fontWeight: "bold"
                                                        }}
                                                    >
                                                        ✓
                                                    </span>
                                                )
                                            }

                                        </div>

                                    </div>

                                </div>
                            );
                        })}
                        <div className="typing-indicator">
                            {isTyping && <i>typing...</i>}
                        </div>
                    </div>


                    <div className="send-message-div">

                        <input
                            className="send-message-input"
                            type="text"
                            placeholder="Type a message..."
                            value={message}
                            onChange={(e) =>{
                                setMessage(e.target.value)
                                socket.emit('started-typing', {
                                chatId: selectedChat._id,
                                members: selectedChat.members.map(m => String(m._id)),
                                sender: user._id
                                })
                            }
                            }
                            onKeyDown={(e) => {

                                if (
                                    e.key === "Enter"
                                ) {
                                    sendMessage();
                                }

                            }}
                        />


                        <button
                            className="send-message-btn"
                            onClick={sendMessage}
                        >
                            <i
                                className="fa fa-paper-plane"
                                aria-hidden="true"
                            ></i>
                        </button>

                    </div>

                </div>
            )}
        </>
    );
}

export default ChatArea;