import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate,Link} from 'react-router-dom'; // Import useNavigate
import myImage from '../Images/chaithanya.jpg';
import '../Styles/signup.css'

const Signup = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'reader',
    });

    const navigate = useNavigate(); // Initialize useNavigate

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/signup', formData);
            alert(response.data);
            navigate('/'); // Redirect to login page after signup
        } catch (error) {
            alert(error.response?.data || 'An error occurred');
        }
    };

    return (
        <div className='signup-container'>
             <div class="content-wrap">
             <div className='signup-section'>
             <h2 className="signup-title">Create Account</h2>
        <form onSubmit={handleSubmit} className='signup-form'>
            <label>Username</label>
            <input name="username" placeholder="Username" onChange={handleChange} required />
            <label>Email</label>
            <input name="email" placeholder="Enter your email" type="email" onChange={handleChange} required />
            <label>Password</label>
            <input name="password" type="password" placeholder="Enter your password" onChange={handleChange} required />
            <label>Role</label>
            <select name="role" onChange={handleChange}>
                <option value="reader">Reader</option>
                <option value="author">Author</option>
            </select>
            <button type="submit" className='signup-button'>Signup</button>
           
        </form>
        <p className='signup-links'>
               
                <Link to="/Login">Back to login</Link> {/* Link to Signup page */}
            </p>
       </div>
       <div className='info-sect'>
               <h2>
                 Join <span className='brand'>StoryVerse</span>
               </h2>
               <p>
               Create your account to explore inspiring articles and stories.
               </p>
               <img src={myImage} alt="Login Illustration" className='info-img' />
         </div>
        </div>
        </div>
    );
};

export default Signup;