import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Articles from './Articles';
import '../Styles/home.css'

const Home = () => {
    const [userRole, setUserRole] = useState(null);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', categories: '' });
    const [coverImage, setCoverImage] = useState(null);
    const [authorName, setAuthorName] = useState('');
    const [authorBio, setAuthorBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [articleCount, setArticleCount] = useState(0); // Total articles count

    const navigate = useNavigate();

    // Fetch user info and author details
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios
            .get('http://localhost:5000/user-info', {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((response) => {
                setUserRole(response.data.role);
                if (response.data.role === 'author') {
                    fetchAuthorDetails(token);
                }
            })
            .catch(() => {
                alert('Session expired. Please login again.');
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);

    // Fetch author details
    const fetchAuthorDetails = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/author-name', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data) {
                setAuthorName(response.data.name || 'N/A');
                setAuthorBio(response.data.bio || 'N/A');
                setProfilePicture(response.data.profilePicture || '');
                setArticleCount(response.data.articleCount || 0); // Set total article count
            }
        } catch (error) {
            console.error('Error fetching author details:', error);
        }
    };

    // Handle profile update
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('bio', authorBio);
        if (profilePicture instanceof File) {
            formData.append('profilePicture', profilePicture);
        }

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('http://localhost:5000/update-profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (response.data && response.data.profilePicture) {
                setProfilePicture(response.data.profilePicture); // Update state with new image
            }
            alert('Profile updated successfully!');
            setIsEditingProfile(false);
        } catch (error) {
            alert('Error updating profile: ' + (error.response?.data || error.message || 'Server error'));
        }
    };

    // Handle article submission
    const handleArticleSubmit = async (e) => {
        e.preventDefault();
        const categoriesArray = newArticle.categories.split(',').map((category) => category.trim());
        const formData = new FormData();

        formData.append('title', newArticle.title);
        formData.append('content', newArticle.content);
        formData.append('categories', JSON.stringify(categoriesArray));
        if (coverImage) {
            formData.append('coverImage', coverImage);
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/upload-article', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('Article and cover image uploaded successfully!');
            setNewArticle({ title: '', content: '', categories: '' });
            setCoverImage(null);
        } catch (error) {
            alert('Error uploading article: ' + (error.response?.data || error.message || 'Server error'));
        }
    };

    return (
        <div>
            {/* Navbar Component */}
            <Navbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                userRole={userRole}
                authorName={authorName}
                authorBio={authorBio}
                profilePicture={profilePicture}
                articleCount={articleCount}
                setAuthorBio={setAuthorBio}
                setProfilePicture={setProfilePicture}
                handleProfileSubmit={handleProfileSubmit}
                isEditingProfile={isEditingProfile}
                setIsEditingProfile={setIsEditingProfile}
                handleArticleSubmit={handleArticleSubmit}
                newArticle={newArticle}
                setNewArticle={setNewArticle}
                setCoverImage={setCoverImage}
            />
            <div className="image-container" style={{width:'1550px'}}>
    <img
        src="https://i.pinimg.com/736x/20/c8/f1/20c8f1e4e08799bef736da87324e9b37.jpg" 
        alt="Home Page"
        className="home-image"
    />
    <div className="image-overlay-text">
        <h1 className="fade-in">Welcome to StoryVerse</h1>
        <p className="fade-in">Embark on a journey through endless articles, inspiring stories, and unforgettable reads, all crafted for you.</p>
        <button className="cta-button fade-in">Explore Stories</button>
    </div>
</div>


            {/* Articles Display */}
            <div style={{ padding: '20px' }}>
                <Articles searchQuery={searchQuery} />
            </div>
        </div>
    );
};

export default Home;
