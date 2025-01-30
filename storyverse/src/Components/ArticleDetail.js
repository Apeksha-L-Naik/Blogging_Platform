import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ArticleDetails.css';

const ArticleDetails = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [viewCount, setViewCount] = useState(0); // View count

    // Retrieve the token from localStorage
    const token = localStorage.getItem('token'); // Replace with your authentication system

    // Make sure the token exists before proceeding with requests
    if (!token) {
        // Redirect the user to login page if no token exists
        window.location.href = '/login';
    }

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/article/${id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                setArticle(response.data);
            } catch (error) {
                console.error('Error fetching article:', error.response || error);
            }
        };

        const fetchLikeCount = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/article/${id}/likes`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Fetched like count:', response.data.like_count);
                setLikeCount(response.data.like_count || 0); // Set 0 if undefined
            } catch (error) {
                console.error('Error fetching like count:', error.response || error);
            }
        };
    
        

        const fetchLikeStatus = async () => {
    try {
        const response = await axios.get(`http://localhost:5000/article/${id}/likes/status`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            }
        });
        setHasLiked(response.data.hasLiked); // Set hasLiked based on server response
    } catch (error) {
        console.error('Error fetching like status:', error.response || error);
    }
};


        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/article/${id}/comments`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error.response || error);
            }
        };

        const fetchViewCount = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/article/${id}/views`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                setViewCount(response.data.view_count);
            } catch (error) {
                console.error('Error fetching view count:', error.response || error);
            }
        };

        const incrementViewCount = async () => {
            try {
                await axios.post(`http://localhost:5000/article/${id}/views`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
                fetchViewCount(); // Fetch updated view count
            } catch (error) {
                console.error('Error incrementing view count:', error.response || error);
            }
        };

        // Trigger all the fetches when the component mounts
        fetchArticle();
        fetchLikeCount();
        fetchLikeStatus();
        fetchComments();
        incrementViewCount(); // Increment view count upon loading article details
    }, [id, token]);

    const handleLike = async () => {
        if (hasLiked) {
            alert('You have already liked this article!');
            return;
        }
    
        try {
            const response = await axios.post(`http://localhost:5000/article/${id}/likes`, {}, { // Empty body
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            if (response.data.success) {
                setLikeCount(response.data.like_count);
                setHasLiked(true);
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error('Error adding like:', error.response || error);
        }
    };
    

    const handleCommentSubmit = async () => {
        if (!commentText) {
            alert('Please enter a comment!');
            return;
        }

        try {
            await axios.post(`http://localhost:5000/article/${id}/comment`, { userId: token, text: commentText }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setCommentText('');
            const commentsResponse = await axios.get(`http://localhost:5000/article/${id}/comments`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setComments(commentsResponse.data);
        } catch (error) {
            console.error('Error posting comment:', error.response || error);
        }
    };

    if (!article) return <div>Loading...</div>;

    return (
        <div className="article-details-container">
            <div className="article-header">
                <h2 className="article-title">{article.title}</h2>
                <p className="article-author">By: <span>{article.author_name}</span></p>
                <div className="view-count">
                    <span>Views: {viewCount}</span>
                </div>
            </div>
            <div className="article-cover">
                <img
                    src={`http://localhost:5000/${article.cover_image_url}`}
                    alt="Cover"
                    className="article-image"
                />
            </div>
            <div className="article-content">
                <p>{article.content}</p>
            </div>
            <div className="article-actions">
                <button
                    className={`like-button ${hasLiked ? 'liked' : ''}`}
                    onClick={handleLike}
                >
                    ❤
                </button>
                <span className="like-count">{likeCount} - Likes</span>
            </div>

            <div className="article-comments-section">
                <h3 className="comments-header">Comments</h3>
                {comments.map((comment) => (
                    <div key={comment.comment_id} className="comment">
                        <p>
                            <strong>User {comment.username}</strong>: {comment.text}
                        </p>
                    </div>
                ))}
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows="4"
                    className="comment-input"
                />
                <button className="comment-submit-button" onClick={handleCommentSubmit}>Post Comment</button>
            </div>
        </div>
    );
};

export default ArticleDetails;
