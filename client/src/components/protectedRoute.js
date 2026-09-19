import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoggedUser } from './../apiCalls/users';
import { getAllUsers } from './../apiCalls/users';
import { useDispatch , useSelector } from 'react-redux';
import { showLoader, hideLoader } from '../redux/loaderSlice';
import { setUser } from '../redux/usersSlice';
import { setAllUsers } from '../redux/usersSlice';
import { toast } from 'react-hot-toast';
import { getAllChats } from './../apiCalls/chat';
import { setAllChats } from '../redux/usersSlice';

function ProtectedRoute({children}) {
    const { user } = useSelector(state => state.userReducer);
    const dispatch = useDispatch();

    const navigate = useNavigate();

    const getloggedInUser = async () => {
        let response = null;
        try{
            dispatch(showLoader());
            response = await getLoggedUser();
            dispatch(hideLoader());
            if(response.success){
                dispatch(setUser(response.data));
            }else{
                toast.error(response.message);
                navigate('/login');
            }
        }catch (error) {
            dispatch(hideLoader());
            navigate('/login');
        }
    }


    const getAllUsersFromDB = async () => {
        let response = null;
        try{
            dispatch(showLoader());
            response = await getAllUsers();
            dispatch(hideLoader());
            if(response.success){
                dispatch(setAllUsers(response.data));
            }else{
                toast.error(response.message);
                navigate('/login');
            }
        }catch (error) {
            dispatch(hideLoader());
            navigate('/login');
        }
    }

    const getCurrentUserChats = async () => {
        try{
            const response = await getAllChats();
            if(response.success){
                dispatch(setAllChats(response.data));
            }
        }catch(error){
            navigate('/login');
        }
    }




    useEffect(() => {
        if (localStorage.getItem('token')) {
            // User is authenticated
            getloggedInUser();
            getAllUsersFromDB();
            getCurrentUserChats();
        } else {
            // User is not authenticated
            navigate('/login'); // Redirect to login page
        }
    }, []);

    return (
        <div>
            {children}
        </div>
    );
}

export default ProtectedRoute;