import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ArticleDetails = () => {
    const { id } = useParams();  // Get article ID from the URL
    const [article, setArticle] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false); // To track if the user has already liked the article
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');

    const userId = 6;  // This should come from the logged-in user's session or token

    useEffect(() => {
        const fetchArticle = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/article/${id}`);
                setArticle(response.data);
            } catch (error) {
                console.error('Error fetching article:', error.response || error);
            }
        };

        const fetchLikeCount = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/article/${id}/likes`);
                setLikeCount(response.data.like_count);
            } catch (error) {
                console.error('Error fetching like count:', error.response || error);
            }
        };

        const fetchComments = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/article/${id}/comments`);
                setComments(response.data);
            } catch (error) {
                console.error('Error fetching comments:', error.response || error);
            }
        };

        fetchArticle();
        fetchLikeCount();
        fetchComments();
    }, [id]);

    const handleLike = async () => {
        if (hasLiked) {
            alert('You have already liked this article!');
            return;
        }
    
        try {
            const response = await axios.post(`http://localhost:5000/article/${id}/like`, { user_id: userId });
            console.log('Like response:', response.data);  // Log response to check success
            
            if (response.data.success) {
                setLikeCount(prevCount => prevCount + 1);  // Update like count
                setHasLiked(true);  // Mark as liked
            } else {
                alert(response.data.message);  // Show the error message from the backend
            }
        } catch (error) {
            console.error('Error adding like:', error.response || error);  // Log detailed error
            alert('Error adding like. Please try again later.');
        }
    };
    

    const handleCommentSubmit = async () => {
        if (!commentText) {
            alert('Please enter a comment!');
            return;
        }

        try {
            const response = await axios.post(`http://localhost:5000/article/${id}/comment`, { user_id: userId, text: commentText });
            console.log('Comment response:', response);  // Log the response to check success
            setCommentText('');  // Clear the comment box
            // Fetch the new comments after posting the comment
            const commentsResponse = await axios.get(`http://localhost:5000/article/${id}/comments`);
            setComments(commentsResponse.data);
        } catch (error) {
            console.error('Error posting comment:', error.response || error);  // Log detailed error
        }
    };

    if (!article) return <div>Loading...</div>;

    return (
        <div style={{ padding: '20px' }}>
            <h2>{article.title}</h2>
            <p style={{ fontStyle: 'italic', color: 'gray' }}>By: {article.author_name}</p>
            <img
                                src={`http://localhost:5000/${article.cover_image_url}`}
                                alt="Cover"
                                style={{
                                    width: '100%',
                                    height: '350px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                }}
                            />
            <div style={{ marginTop: '20px' }}>
                <p>{article.content}</p>
            </div>

            {/* Like Button and Counter */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <button
                    style={{ marginRight: '10px' }}
                    onClick={handleLike}
                    disabled={hasLiked}
                >
                    Like
                </button>
                <span>{likeCount} Likes</span>
            </div>

            {/* Comments Section */}
            <div style={{ marginTop: '20px' }}>
                <h3>Comments</h3>
                <div>
                    {comments.map((comment) => (
                        <div key={comment.comment_id} style={{ marginBottom: '10px' }}>
                            <p><strong>User {comment.user_id}</strong>: {comment.text}</p>
                        </div>
                    ))}
                </div>
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows="4"
                    style={{ width: '100%' }}
                />
                <button style={{ marginTop: '10px' }} onClick={handleCommentSubmit}>Post Comment</button>
            </div>
        </div>
    );
};

export default ArticleDetails;
