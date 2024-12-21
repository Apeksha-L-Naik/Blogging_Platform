import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Articles from './Articles';
import Navbar from './Navbar';

const Home = () => {
    const [userRole, setUserRole] = useState(null);
    const [newArticle, setNewArticle] = useState({ title: '', content: '', categories: '' });
    const [coverImage, setCoverImage] = useState(null);
    const [isAuthorDashboardVisible, setIsAuthorDashboardVisible] = useState(false);
    const [authorName, setAuthorName] = useState('');
    const [authorBio, setAuthorBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [articleCount, setArticleCount] = useState(0); // State to store the total article count
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

    const fetchAuthorDetails = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/author-name', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data) {
                setAuthorName(response.data.name || 'N/A');
                setAuthorBio(response.data.bio || 'N/A');
                setProfilePicture(response.data.profilePicture || '');
                setArticleCount(response.data.articleCount || 0); // Set article count state
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
            <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

            {userRole === 'author' && (
                <button
                    style={{
                        position: 'fixed',
                        top: 10,
                        right: 10,
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        background: 'blue',
                        color: 'white',
                        fontSize: '20px',
                    }}
                    onClick={() => setIsAuthorDashboardVisible(!isAuthorDashboardVisible)}
                >
                    A
                </button>
            )}

            {isAuthorDashboardVisible ? (
                <div>
                    <div>
                        <h2>Author Dashboard</h2>
                        {profilePicture && (
                            <img
                                src={
                                    profilePicture instanceof File
                                        ? URL.createObjectURL(profilePicture) // Create a preview for a new upload
                                        : `http://localhost:5000/${profilePicture}?t=${new Date().getTime()}` // Use the existing URL
                                }
                                alt="Profile"
                                style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                            />
                        )}
                        <p>
                            <strong>Name:</strong> {authorName}
                            <button
                                style={{ marginLeft: '10px' }}
                                onClick={() => setIsEditingProfile(true)}
                            >
                                Edit Profile
                            </button>
                        </p>
                        <p>
                            <strong>Bio:</strong> {authorBio}
                        </p>
                        <p>
                            <strong>Total Articles:</strong> {articleCount} {/* Display total article count */}
                        </p>
                    </div>
                    {isEditingProfile && (
                        <form onSubmit={handleProfileSubmit}>
                            <textarea
                                value={authorBio}
                                onChange={(e) => setAuthorBio(e.target.value)}
                                placeholder="Write your bio here..."
                                required
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfilePicture(e.target.files[0])}
                            />
                            <button type="submit">Save Changes</button>
                        </form>
                    )}
                    <h3>Upload New Article</h3>
                    <form onSubmit={handleArticleSubmit}>
                        <input
                            name="title"
                            placeholder="Article Title"
                            value={newArticle.title}
                            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                            required
                        />
                        <textarea
                            name="content"
                            placeholder="Article Content"
                            value={newArticle.content}
                            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                            required
                        />
                        <textarea
                            name="categories"
                            placeholder="Enter categories separated by commas (e.g., tech, health, science)"
                            value={newArticle.categories}
                            onChange={(e) =>
                                setNewArticle({ ...newArticle, categories: e.target.value })
                            }
                            required
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files[0])}
                        />
                        <button type="submit">Upload Article</button>
                    </form>
                </div>
            ) : (
                <div>
                    <Articles searchQuery={searchQuery} />
                </div>
            )}
        </div>
    );
};

export default Home;
