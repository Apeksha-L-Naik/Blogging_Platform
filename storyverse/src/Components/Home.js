import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Articles from './Articles';

const Home = () => {
    const [userRole, setUserRole] = useState(null);
    const [authorName, setAuthorName] = useState('');
    const [newArticle, setNewArticle] = useState({ title: '', content: '' });
    const [isAuthorDashboardVisible, setIsAuthorDashboardVisible] = useState(false);
    const navigate = useNavigate();

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
                    fetchAuthorName(token);
                }
            })
            .catch(() => {
                alert('Session expired. Please login again.');
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);

    const fetchAuthorName = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/author-name', {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data && response.data.name) {
                setAuthorName(response.data.name);
            } else {
                console.error('Author name not found in the response:', response.data);
            }
        } catch (error) {
            console.error('Error fetching author name:', error);
        }
    };

    const handleArticleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            console.log('Token:', token);  // Log the token to make sure it's valid
            await axios.post(
                'http://localhost:5000/upload-article',
                newArticle,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Article uploaded successfully!');
            setNewArticle({ title: '', content: '' });
    
        } catch (error) {
            alert('Error uploading article: ' + (error.response?.data || error.message || 'Server error'));
        }
    };
    
    

    return (
        <div>
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
                    <p><strong>Name:</strong> {authorName|| 'N/A'}</p>
                </div>
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
                    <button type="submit">Upload Article</button>
                </form>
                </div>
            ) : (
                <div>
                    <Articles />
                </div>
            )}
        </div>
    );
};

export default Home;
