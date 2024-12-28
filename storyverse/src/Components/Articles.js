import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../Styles/article.css'

const Articles = ({ searchQuery }) => {
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const response = await axios.get('http://localhost:5000/articles');
                setArticles(response.data);
            } catch (error) {
                console.error('Error fetching articles:', error);
            }
        };
        fetchArticles();
    }, []);

    // Filter and sort articles safely
    const filteredArticles = articles
        .filter((article) => {
            const title = article.title || ''; // Default to an empty string if undefined
            const content = article.content || ''; // Default to an empty string if undefined
            const categories = article.categories || []; // Default to an empty array if undefined
            const authorName = article.author_name || ''; // Default to an empty string if undefined

            return (
                title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                authorName.toLowerCase().includes(searchQuery.toLowerCase()) || // Check author name
                categories.some((category) =>
                    (category || '').toLowerCase().includes(searchQuery.toLowerCase())
                )
            );
        })
        .sort((a, b) => {
            const aTitleMatch = (a.title || '').toLowerCase().includes(searchQuery.toLowerCase());
            const bTitleMatch = (b.title || '').toLowerCase().includes(searchQuery.toLowerCase());

            if (aTitleMatch && !bTitleMatch) return -1; // Prioritize articles with title match
            if (!aTitleMatch && bTitleMatch) return 1;
            return 0; // Maintain original order otherwise
        });

    return (
        <div className="unique-articles-container">
            <h2 className="unique-articles-title">Articles</h2>
            <div className="unique-articles-list">
                {filteredArticles.map((article) => (
                    <div
                        key={article.article_id}
                        className="unique-article-card"
                    >
                        {article.cover_image_url && (
                            <img
                                src={`http://localhost:5000/${article.cover_image_url}`}
                                alt="Cover"
                                className="unique-article-image"
                            />
                        )}
                        <h3 className="unique-article-title">{article.title}</h3>
                        <p className="unique-article-author">
                            By: {article.author_name || 'Unknown Author'}
                        </p>
                        <Link to={`/articles/${article.article_id}`}>
                            <button  className="unique-article-button">Read More</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Articles;
