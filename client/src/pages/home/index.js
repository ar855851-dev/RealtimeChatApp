import { useSelector } from "react-redux";
import Header from "./components/header";
import Sidebar from "./components/sidebar";
import ChatArea from "./components/chat";
import { io } from "socket.io-client";
import { useEffect, useState } from "react";


const socket = io('https://realtimechatapp-7ooa.onrender.com');


function Home() {
  const { selectedChat, user } = useSelector(state => state.userReducer);
  const [onlineUser, setOnlineUser] = useState([]);

  
  useEffect(() => {
    if(user){
      socket.emit('join-room', user._id);
      socket.emit('user-login', user._id);

      const handleOnlineUsers = (onlineusers) => {
        setOnlineUser(onlineusers);
      };

      socket.on('online-users', handleOnlineUsers);

      return () => {
        socket.off('online-users', handleOnlineUsers);
      };
    }
  }, [user]);

    return ( 
         <div className="home-page">
            <Header></Header>
            <div className="main-content">
                <Sidebar socket={socket} onlineUsers={onlineUser}></Sidebar>
                {selectedChat && <ChatArea socket = {socket}></ChatArea>}
            </div>
        </div>
    );
}

export default Home;