import React, { useState } from 'react';

const Navbar = ({
    searchQuery,
    setSearchQuery,
    userRole,
    authorName,
    authorBio,
    profilePicture,
    articleCount,
    setAuthorBio,
    setProfilePicture,
    handleProfileSubmit,
    isEditingProfile,
    setIsEditingProfile,
    handleArticleSubmit,
    newArticle,
    setNewArticle,
    setCoverImage,
}) => {
    const [isAuthorDashboardVisible, setIsAuthorDashboardVisible] = useState(false);

    return (
        <nav style={{ background: '#333', padding: '10px', color: 'white', position: 'relative' }}>
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

            {/* Author Dashboard Toggle Button */}
            {userRole === 'author' && (
                <button
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        background: 'blue',
                        color: 'white',
                        fontSize: '20px',
                    }}
                    onClick={() => setIsAuthorDashboardVisible(!isAuthorDashboardVisible)}
                >
                    A
                </button>
            )}

            {/* Full-Screen Author Dashboard */}
            {isAuthorDashboardVisible && userRole === 'author' && (
                <div
                    style={{
                        position: 'fixed',
                        top: '0',
                        left: '0',
                        width: '100vw',
                        height: '100vh',
                        background: 'white',
                        color: 'black',
                        padding: '20px',
                        zIndex: 1000,
                        overflowY: 'auto',
                    }}
                >
                    <button
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            fontSize: '20px',
                            padding: '5px 10px',
                            background: 'red',
                            color: 'white',
                            borderRadius: '5px',
                        }}
                        onClick={() => setIsAuthorDashboardVisible(false)}
                    >
                        Close
                    </button>
                    <h2>Author Dashboard</h2>
                    {profilePicture && (
                        <img
                            src={
                                profilePicture instanceof File
                                    ? URL.createObjectURL(profilePicture)
                                    : `http://localhost:5000/${profilePicture}?t=${new Date().getTime()}`
                            }
                            alt="Profile"
                            style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                        />
                    )}
                    <p>
                        <strong>Name:</strong> {authorName}
                        <button
                            style={{ marginLeft: '10px', padding: '5px', fontSize: '12px' }}
                            onClick={() => setIsEditingProfile(true)}
                        >
                            Edit Profile
                        </button>
                    </p>
                    <p>
                        <strong>Bio:</strong> {authorBio}
                    </p>
                    <p>
                        <strong>Total Articles:</strong> {articleCount}
                    </p>

                    {/* Edit Profile Form */}
                    {isEditingProfile && (
                        <form onSubmit={handleProfileSubmit} style={{ marginTop: '10px' }}>
                            <textarea
                                value={authorBio}
                                onChange={(e) => setAuthorBio(e.target.value)}
                                placeholder="Write your bio here..."
                                required
                                style={{ width: '100%', height: '50px', marginBottom: '10px' }}
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfilePicture(e.target.files[0])}
                            />
                            <button
                                type="submit"
                                style={{
                                    marginTop: '10px',
                                    padding: '5px 10px',
                                    background: 'green',
                                    color: 'white',
                                }}
                            >
                                Save Changes
                            </button>
                        </form>
                    )}

                    <h3>Upload New Article</h3>
                    <form onSubmit={handleArticleSubmit} style={{ marginTop: '10px' }}>
                        <input
                            name="title"
                            placeholder="Article Title"
                            value={newArticle.title}
                            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                            required
                            style={{ width: '100%', padding: '5px', marginBottom: '10px' }}
                        />
                        <textarea
                            name="content"
                            placeholder="Article Content"
                            value={newArticle.content}
                            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                            required
                            style={{ width: '100%', height: '100px', marginBottom: '10px' }}
                        />
                        <textarea
                            name="categories"
                            placeholder="Enter categories separated by commas (e.g., tech, health, science)"
                            value={newArticle.categories}
                            onChange={(e) =>
                                setNewArticle({ ...newArticle, categories: e.target.value })
                            }
                            required
                            style={{ width: '100%', height: '50px', marginBottom: '10px' }}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files[0])}
                        />
                        <button
                            type="submit"
                            style={{
                                marginTop: '10px',
                                padding: '5px 10px',
                                background: 'blue',
                                color: 'white',
                            }}
                        >
                            Upload Article
                        </button>
                    </form>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
