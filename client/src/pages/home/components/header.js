import { useDispatch , useSelector } from 'react-redux';

function Header() {
    const { user } = useSelector(state => state.userReducer);

function getFullname() {
    let fname = user?.firstname.at(0).toUpperCase() + user?.firstname.slice(1).toLowerCase();
    let lname = user?.lastname.at(0).toUpperCase() + user?.lastname.slice(1).toLowerCase();
    return fname +' '+ lname;
}
function getInitials() {
    let f = user?.firstname.toUpperCase()[0];
    let l = user?.lastname.toUpperCase()[0];
    return f + l;
}

return(
    <div className="app-header">
        <div className="app-logo">
            <i className="fa fa-comment" aria-hidden="true"></i>
            QuickChat
        </div>
        <div className="app-user-profile">
            <div className="logged-user-name">{getFullname()}</div>
            <div className="logged-user-profile-pic">{getInitials()}</div>
        </div>
        </div>
    )
}

export default Header;