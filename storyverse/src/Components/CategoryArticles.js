import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/arti.css'



const CategoryArticles = () => {
    const { categoryId } = useParams(); // Extract category ID from the URL
    const [articles, setArticles] = useState([]); // State for storing articles
    const [loading, setLoading] = useState(true); // State for loading status
    const [error, setError] = useState(''); // State for error handling
        const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/categories/${categoryId}/articles`);
                console.log('Fetched articles:', response.data); // Debug log for fetched data
                setArticles(response.data || []); // Set articles state
            } catch (err) {
                setError('Error fetching articles for this category.');
            } finally {
                setLoading(false); // Stop loading regardless of success or failure
            }
        };
        fetchArticles();
    }, [categoryId]);

    // Handle loading and error states
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <>
         
        <div className="unique-articles-container">
            <h2 className='title'>Articles in {categoryId} Category</h2>
            <div className="articles-list">
                {articles.length > 0 ? (
                    articles.map((article) => (
                        <div key={article.article_id} className="unique-article-card">
                            {/* Display cover image if available */}
                            {article.cover_image_url && (
                                <img
                                    src={`http://localhost:5000/${article.cover_image_url}`}
                                    alt="Cover"
                                    className="unique-article-image"
                                />
                            )}
                            {/* Display article title */}
                            <h3 className="unique-article-title">{article.title}</h3>
                            {/* Display article author */}
                            <p className="unique-article-author">
                                By: {article.author_name || 'Unknown Author'}
                            </p>
                            {/* Link to the full article */}
                            <Link to={`/articles/${article.article_id}`}>
                                <button className="unique-article-button">Read More</button>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No articles found in this category.</p>
                )}
            </div>
        </div>
        </>
    );
};

export default CategoryArticles;