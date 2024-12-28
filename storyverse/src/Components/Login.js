import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation
import '../Styles/login.css'
import myImage from '../Images/chaithanya.jpg';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSwapped, setIsSwapped] = useState(false);
    const navigate = useNavigate(); 

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', formData);
            alert('Login successful!');
            localStorage.setItem('token', response.data.token); 
            navigate('/home'); 
        } catch (error) {
            alert(error.response?.data || 'An error occurred');
        }
    };
    const handleSwap = () => {
        setIsSwapped(prev => !prev); 
    };

    return (
        <div className='login-container'>
              <div class="content-wrapper">
            
            <div className={`login-section ${isSwapped ? 'right' : ''}`}>
            <h2 className="login-title">Login to Explore</h2>
            <form onSubmit={handleSubmit} className='login-form '>
                <label>Email</label>
                <input name="email" type="email" placeholder="Enter your email" onChange={handleChange} required />
                <label>Password</label>
                <input name="password" type="password" placeholder="Enter your password" onChange={handleChange} required />
                <button type="submit" className='login-button'>Login</button>
            </form>
            <p className='login-links'>
                        Don't have an account?{' '}
                        <span onClick={handleSwap}>
                            <Link to="/Signup">Create an account</Link> 
                        </span>
                    </p>
            </div>
            <div className={`info-section ${isSwapped ? 'left' : ''}`}>
        <h2>
          Welcome to <span className='brand'>StoryVerse</span>
        </h2>
        <p>
        Explore endless articles, inspiring stories, and curated reads just for you..
        </p>
        <img src={myImage} alt="Login Illustration" className='info-image' />
      </div>
    </div>
    </div>
    );
};

export default Login;