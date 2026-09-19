import React from 'react';
import{Link} from "react-router-dom";
import { signupUser } from "./../../apiCalls/auth";
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { showLoader, hideLoader } from '../../redux/loaderSlice';

function Signup() {
    const dispatch = useDispatch();
    const[user, setUser] = React.useState({
    firstname: '',
    lastname: '',
    email: '',
    password: ''
  });

  async function onFormSubmit(e) {
    e.preventDefault();
    let response = null;
    try {
        dispatch(showLoader());
        response = await signupUser(user);
        dispatch(hideLoader());
        if(response.success){
           toast.success(response.message);
        }else{
            toast.error(response.message);
        }
    } catch (err) {
        dispatch(hideLoader());
        toast.error(response.message);
    }
  }

    return (
        <div className="auth-page">
        <div className="signup-container">
            <h2>Sign Up</h2>
            <form onSubmit={ onFormSubmit }>
                <div>
                    <label htmlFor="firstname">First Name</label>
                    <input type="text" id="firstname" name="firstname" required 
                    value={user.firstname}
                    onChange={(e) => setUser({...user, firstname: e.target.value})}/>{/* Update the firstname property in the user state */}
                </div>
                <div>
                    <label htmlFor="lastname">Last Name</label>
                    <input type="text" id="lastname" name="lastname" required
                     value={user.lastname}
                     onChange={(e) => setUser({...user, lastname: e.target.value})}/>
                </div>
                <div>
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" required
                     value={user.email}
                     onChange={(e) => setUser({...user, email: e.target.value})}/>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input type="password" id="password" name="password" required 
                    value={user.password}
                    onChange={(e) => setUser({...user, password: e.target.value})}/>
                </div>
                <button type="submit">Sign Up</button>
                <p>
                    Already have an account? <Link to="/login">Login here</Link>
                </p>
            </form>
        </div>
    </div>
    );
}

export default Signup;