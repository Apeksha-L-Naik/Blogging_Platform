import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Articles = () => {
    const [articles, setArticles] = useState([]);

    // Fetch all articles on component mount
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

    return (
        <div>
            <h2>Articles</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {articles.map((articles) => (
    <div
        key={articles.article_id}  // Use article_id as the key
        style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '16px',
            width: '300px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        }}
    >
        <h3>{articles.title}</h3>
        <p>{articles.content.substring(0, 100)}...</p>
        <p style={{ fontStyle: 'italic', color: 'gray' }}>
            By: {articles.author_name}  {/* Ensure 'author_name' exists in the DB */}
        </p>
    </div>
))}
            </div>
        </div>
    );
};

export default Articles;
