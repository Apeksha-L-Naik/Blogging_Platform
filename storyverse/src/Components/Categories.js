import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Styles/category.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('http://localhost:5000/categories');
                console.log('Fetched categories:', response.data); // Debug log
                setCategories(response.data); // Assumes response.data is an array of strings
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName) => {
        navigate(`/categories/${categoryName}`);
    };

    return (
        <div className="unique-category-container">
            <h2 className="unique-category-title">Categories</h2>
            <ul className="category-list">
                {categories.map((category, index) => (
                    <ul key={index} className="category-item" onClick={() => handleCategoryClick(category)}>
                         <span className="category-text">{category}</span>
                    </ul>
                ))}
            </ul>
        </div>
    );
};

export default Categories;