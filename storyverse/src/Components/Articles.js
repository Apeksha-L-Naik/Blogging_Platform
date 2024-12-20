import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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
        <div>
            <h2>Articles</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {filteredArticles.map((article) => (
                    <div
                        key={article.article_id}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '16px',
                            width: '300px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        }}
                    >
                        {article.cover_image_url && (
                            <img
                                src={`http://localhost:5000/${article.cover_image_url}`}
                                alt="Cover"
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    marginBottom: '10px',
                                }}
                            />
                        )}
                        <h3>{article.title}</h3>
                        <p style={{ fontStyle: 'italic', color: 'gray' }}>
                            By: {article.author_name || 'Unknown Author'}
                        </p>
                        <Link to={`/articles/${article.article_id}`}>
                            <button style={{ marginTop: '10px' }}>Read More</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Articles;
