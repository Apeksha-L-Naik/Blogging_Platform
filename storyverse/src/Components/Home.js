import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Articles from './Articles';

const Home = () => {
    const [userRole, setUserRole] = useState(null);
    const [authorData, setAuthorData] = useState({
        totalArticles: 0,
        totalComments: 0,
        totalViews: 0,
    });
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
                    fetchAuthorData(token);
                }
            })
            .catch(() => {
                alert('Session expired. Please login again.');
                localStorage.removeItem('token');
                navigate('/login');
            });
    }, [navigate]);

    const fetchAuthorData = async (token) => {
        try {
            const response = await axios.get('http://localhost:5000/author-stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAuthorData(response.data);
        } catch (error) {
            console.error('Error fetching author data:', error);
        }
    };

    const handleArticleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:5000/upload-article',
                newArticle,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Article uploaded successfully!');
            setNewArticle({ title: '', content: '' });
            fetchAuthorData(token);
        } catch (error) {
            alert('Error uploading article: ' + error.response?.data || 'Server error');
        }
    };

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
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
                    <h2>Author Dashboard</h2>
                    <p>Total Articles Published: {authorData.totalArticles}</p>
                    <p>Total Comments: {authorData.totalComments}</p>
                    <p>Total Views: {authorData.totalViews}</p>
                    
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
                    {/* <h2>Explore</h2>
                    <Link to="/articles">
                        <button>Browse Articles</button>
                    </Link> */}
                    <Articles/>
                </div>
            )}
        </div>
    );
};

export default Home;
