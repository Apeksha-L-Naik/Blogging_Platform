import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../Styles/ArticleDetails.css'

const ArticleDetails = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [likeCount, setLikeCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');

    const userId = localStorage.getItem('userId'); // Replace with your authentication system
    

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
            const response = await axios.post(`http://localhost:5000/article/${id}/likes`, { user_id: userId });
            if (response.data.success) {
                setLikeCount(prevCount => prevCount + 1);
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
            await axios.post(`http://localhost:5000/article/${id}/comment`, { user_id: userId, text: commentText });
            setCommentText('');
            const commentsResponse = await axios.get(`http://localhost:5000/article/${id}/comments`);
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
                 <button className="like-button">❤</button>

                 <span className="like-count">{likeCount} Likes</span>
            </div>

            <div className="article-comments-section">
                 <h3 className="comments-header">Comments</h3>
                {comments.map(comment => (
                    <div key={comment.comment_id} className="comment">
                         <p>
                <strong>User {comment.user_id}</strong>: {comment.text}
              </p>

                    </div>
                ))}

                <textarea
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
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
