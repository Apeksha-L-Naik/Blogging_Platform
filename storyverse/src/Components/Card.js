import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Styles/Cards.css';

const Card = () => {
    const navigate = useNavigate();

    const handleLoginClick = () => {
        navigate('/login');
    };

    const handleAnalyticsClick = () => {
        navigate('/analytics');
    };

    return (
        <div>
            {/* Heading Container */}
            <div className="heading-container">
                <h1>Welcome to Your Dashboard</h1>
                <p>Explore powerful tools to manage and analyze your blog performance effortlessly.</p>
            </div>

            {/* Cards Container */}
            <div className="cards-container">
                {/* Login Card */}
                <div className="card login-card">
                    <div className="card-header"></div>
                    <div className="card-image-wrapper">
                        <img
                            src="https://static.vecteezy.com/system/resources/previews/002/437/945/large_2x/illustration-of-a-login-account-free-vector.jpg"
                            alt="Login"
                            className="card-image"
                        />
                    </div>
                    <h2>Login</h2>
                    <p>Access your account and manage your blog platform.</p>
                    <button
                        className="card-button green-button"
                        onClick={handleLoginClick}
                    >
                        Login
                    </button>
                </div>

                {/* Analytics Card */}
                <div className="card analytics-card">
                    <div className="card-header"></div>
                    <div className="card-image-wrapper">
                        <img
                            src="https://image.freepik.com/free-vector/business-analytics-vector_28257-13.jpg"
                            alt="Analytics"
                            className="card-image"
                        />
                    </div>
                    <h2>Analytics</h2>
                    <p>Track your blog performance and insights.</p>
                    <button
                        className="card-button red-button"
                        onClick={handleAnalyticsClick}
                    >
                        View Analytics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Card;