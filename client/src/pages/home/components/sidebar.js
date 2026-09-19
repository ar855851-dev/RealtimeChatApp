import Search from "./search";
import { useState } from "react";
import UserList from "./userList";

function Sidebar({socket, onlineUser}) {
    const [searchKey, setSearchKey] = useState("");
    return (
        <div className="app-sidebar">
            <Search 
            searchKey={searchKey} 
            setSearchKey={setSearchKey}>
            </Search>
            <UserList 
            searchKey={searchKey}
            socket={socket}
            onlineUser={onlineUser}>
            </UserList>
        </div>
    );
}

export default Sidebar;