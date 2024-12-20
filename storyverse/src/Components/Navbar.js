import React from 'react';

const Navbar = ({ searchQuery, setSearchQuery }) => {
    return (
        <nav style={{ background: '#333', padding: '10px', color: 'white' }}>
            <h1 style={{ display: 'inline', marginRight: '20px' }}>Article Hub</h1>
            <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                    padding: '5px',
                    fontSize: '16px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    width: '200px',
                }}
            />
        </nav>
    );
};

export default Navbar;
