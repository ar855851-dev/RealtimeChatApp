import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { createNewChat } from "./../../../apiCalls/chat";
import { showLoader, hideLoader } from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat} from "./../../../redux/usersSlice";
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";

function UserList({searchKey, socket, onlineUser =[]}) {
    const {allUsers , allChats , user: currentUser, selectedChat} = useSelector(state => state.userReducer);

    const dispatch = useDispatch();
    const startNewChat = async (searchedUserId) => {
    let response = null;
    try{
        dispatch(showLoader());
        const response = await createNewChat([currentUser._id, searchedUserId]);
        dispatch(hideLoader());
        
        if(response.success){
            toast.success(response.message);
            const newChat = response.data;
            const updatedChat = [...allChats, newChat];
            dispatch(setAllChats(updatedChat));
            dispatch(setSelectedChat(newChat));
        }
    }catch(error){
        dispatch(hideLoader());
        toast.error(response.message);
    }
}

    const openChat = (searchedUserId) => {
        const chat = allChats.find(chat => 
            chat.members.map(member => member._id).includes(currentUser._id) && 
            chat.members.map(member => member._id).includes(searchedUserId)
        )
        if (chat) {
            dispatch(setSelectedChat(chat));
        }
    } 

const getLastMeassageTimeStamp = (userId) => {
    if (!allChats) return "";

    const chat = allChats.find(chat => chat.members.some(m => m && m._id === userId));

    // Agar chat nahi mili, ya usme koi message hi nahi hai
    if (!chat || !chat.lastMessage || chat.lastMessage.length === 0) {
        return "";
    }

    // Dynamic dynamic message timestamp parsing
    return moment(chat.lastMessage[0]?.createdAt).format('hh:mm A');
}

    const IsSelectedChat = (user) => {
        if(selectedChat){
            return selectedChat.members.map(member => member._id).includes(user._id);
        }
        return false;
    }


    const getlastMessage = (userId) => {
        const chat = allChats.find(chat => chat.members.some(m=>m._id === userId));
        console.log(`Chat data for ${userId}:`,chat)

        if(chat && chat.lastMessage && chat.lastMessage.length > 0){
            const msgPrefix = chat.lastMessage[0].sender === currentUser?._id ? "You: " : "";

            return msgPrefix + chat.lastMessage[0].text.substring(0, 25) || "";
        }else{
            return null;
        }
    }


    function formatName(user){
        console.log(user);
        let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
        let lname = user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();
        return fname + ' ' + lname;
    }


useEffect(() => {

    console.log("🔥 USERLIST SOCKET LISTENER REGISTERED");

    const receiveMessage = (message) => {


        const selectedChat =
            store.getState().userReducer.selectedChat;


        const currentChats =
            store.getState().userReducer.allChats || [];


        const updatedChats =
            currentChats.map(chat => {

                if (
                    String(chat._id) ===
                    String(message.chatId)
                ) {

                    console.log(
                        "✅ CHAT MATCHED:",
                        chat._id
                    );


                    // Current chat open nahi hai
                    if (
                        String(selectedChat?._id) !==
                        String(message.chatId)
                    ) {

                        return {

                            ...chat,

                            unreadMessagesCount:
                                (
                                    chat.unreadMessagesCount ||
                                    0
                                ) + 1,

                            lastMessage: [message]
                        };
                    }


                    // Current chat open hai
                    return {

                        ...chat,

                        lastMessage: [message]
                    };
                }


                return chat;
            });


        // Message wali chat ko top par lao
        const messageChat =
            updatedChats.find(
                chat =>
                    String(chat._id) ===
                    String(message.chatId)
            );


        const remainingChats =
            updatedChats.filter(
                chat =>
                    String(chat._id) !==
                    String(message.chatId)
            );


        const sortedChats =
            messageChat
                ? [
                    messageChat,
                    ...remainingChats
                ]
                : updatedChats;


        dispatch(
            setAllChats(sortedChats)
        );
    };


    socket.on(
        "receive-message",
        receiveMessage
    );


    return () => {


        socket.off(
            "receive-message",
            receiveMessage
        );
    };


}, [socket, dispatch]);

    const getUnreadMessageCount = (userId) => {
        const chat = allChats.find(chat =>
             chat.members.map(m => m._id).includes(userId));
        if(chat && chat.unreadMessagesCount && chat.lastMessage?.[0]?.sender !== currentUser._id){
            return  <div className="unread-message-counter"> {chat.unreadMessagesCount} </div>
        }else{
            return "";
        }
    }

    function getData(){
        if(searchKey === ""){
            return allChats || []; 
        } else {
            // Yahan return lagana zaroori hai
            return allUsers ? allUsers.filter(user => {
                return user.firstname.toLowerCase().includes(searchKey.toLowerCase()) ||
                    user.lastname.toLowerCase().includes(searchKey.toLowerCase());
            }) : [];
        }
    }

    return(
        getData()
        .map(obj => {
            let user = obj;
            if(obj.members){
                user = obj.members.find(mem => mem._id !== currentUser?._id);
            }

            return <div className="user-search-filter" onClick={() => openChat(user._id)} key={user._id}>
            <div className = {IsSelectedChat(user) ? "selected-user" : "filtered-user"}>
                <div className="filter-user-display">
                  {user.profilePic && 
                    <img 
                    src={user.profilePic} 
                    alt="user-profile" 
                    className="filter-user-profile-pic" 
                    style={onlineUser?.some(id => String(id) === String(user._id)) ? { border: "15px solid green" } : {}}> 
                    </img>}
                  {!user.profilePic && 
                    <div 
                    className={IsSelectedChat(user) ? "user-selected-avatar" : "user-default-avatar"}
                    style={onlineUser?.some(id => String(id) === String(user._id)) ? { border: "15px solid green" } : {}}
                    >
                    {user?.firstname?.charAt(0).toUpperCase() + user?.lastname?.charAt(0).toUpperCase()}
                    </div>
                }


                    <div className ="filter-user-details">
                        <div className="filter-display-name">{formatName(user)}</div>
                        <div className="filter-display-email">{ getlastMessage(user._id)? getlastMessage(user._id) : user.email}</div>
                    </div>

                    <div>
                        
                       
                       <div className="last-message-timestamp">{getLastMeassageTimeStamp(user._id)}</div>
                        {getUnreadMessageCount(user._id)}
                    </div>
                    { !allChats.find(chat => chat.members.map(member => member._id).includes(user._id)) &&
                        <div className="user-start-chat">
                            <button className="user-start-chat-btn" onClick={() => startNewChat(user._id)}>
                                Start Chat
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
        })
    )
}

export default UserList;