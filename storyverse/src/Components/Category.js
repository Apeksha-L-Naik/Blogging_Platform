import React from 'react';

const Category = ({ setSelectedCategory }) => {
    const categories = ['Tech', 'Health', 'Education', 'Sports', 'Travel'];

    return (
        <div className="category-container">
            <h3>Select Category</h3>
            <ul className="category-list">
                {categories.map((category) => (
                    <li
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className="category-item"
                    >
                        {category}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Category;
