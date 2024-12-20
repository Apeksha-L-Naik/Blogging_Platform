import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Articles = () => {
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

    return (
        <div>
            <h2>Articles</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {articles.map((article) => (
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
                            By: {article.author_name}
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
