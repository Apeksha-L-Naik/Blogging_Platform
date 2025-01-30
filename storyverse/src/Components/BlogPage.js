import React from 'react';
import { useNavigate } from 'react-router-dom';
import myBlog from '../Images/bloggingpage.jpg';
import '../Styles/BlogPage.css';

const BlogPage = () => {
    const navigate = useNavigate();

    const handleExploreClick = () => {
        navigate('/cards');
    };

    return (
        <div className="image-container-blog" style={{ width: '1500px' }}>
            <img src={myBlog} alt="Home Page" className="home-image" />
            
            {/* Text overlay for Welcome message */}
            <div className="text-overlay">
                <h1>
                    Welcome to <br />
                    <span>Blogging Platform</span>
                </h1>
            </div>
            
            <div className="image-overlay-button">
                <button className="explore-button fade-in" onClick={handleExploreClick}>
                    Explore
                </button>
            </div>
        </div>
    );
};

export default BlogPage;