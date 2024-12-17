import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link for navigation

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const navigate = useNavigate(); // Initialize useNavigate

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/login', formData);
            alert('Login successful!');
            localStorage.setItem('token', response.data.token); // Save token to localStorage (if needed)
            navigate('/home'); // Redirect to home page
        } catch (error) {
            alert(error.response?.data || 'An error occurred');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input name="email" placeholder="Email" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account?{' '}
                <Link to="/Signup">Create one here</Link> {/* Link to Signup page */}
            </p>
        </div>
    );
};

export default Login;
