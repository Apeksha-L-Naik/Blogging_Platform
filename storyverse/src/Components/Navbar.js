import React, { useState } from 'react';
import '../Styles/navbar.css'

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
        <nav className="navbar">
             {!isAuthorDashboardVisible && (
          <>
            <div className="navbar-left">
              <div className="navbar-logo">
                <h1>StoryVerse</h1>
              </div>
            </div>
  
            <div className="navbar-right">
              <div className="navbar-search">
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-button">Search</button>
              </div>
              {userRole === 'author' && (
                <button
                  className="dashboard-toggle"
                  onClick={() => setIsAuthorDashboardVisible(true)}
                  >
                  <i className="fas fa-user-circle"></i>
                </button>
              )}
            </div>
          </>
        )}


            {/* Full-Screen Author Dashboard */}
            {isAuthorDashboardVisible && userRole === 'author' && (
                
                <div  className="author-dashboard"
                > 
                    <button
                     className="author-dashboard-close-btn"

                        onClick={() => setIsAuthorDashboardVisible(false)}
                    >
                        Close
                    </button>
                    <h2 className="author-dashboard-title">Author Dashboard</h2>
                    {profilePicture && (
                        <img
                        className="author-profile-picture"
                            src={
                                profilePicture instanceof File
                                    ? URL.createObjectURL(profilePicture)
                                    : `http://localhost:5000/${profilePicture}?t=${new Date().getTime()}`
                            }
                            alt="Profile"
                        />
                    )}
                    <p className="author-profile-name">
                        <strong>Name:</strong> {authorName}
                        <button
                         id="profile-picture-upload"
                         className="edit-profile-btn"
                            onClick={() => setIsEditingProfile(true)}
                        >
                            Edit Profile
                        </button>
                    </p>
                    <p className="author-profile-bio">
                        <strong>Bio:</strong> {authorBio}
                    </p>
                    <p className="author-article-count">
                        <strong>Total Articles:</strong> {articleCount}
                    </p>

                    {/* Edit Profile Form */}
                    {isEditingProfile && (
                        <form onSubmit={handleProfileSubmit}  className="edit-profile-form" >
                            <textarea
                            className="edit-profile-bio"
                                value={authorBio}
                                onChange={(e) => setAuthorBio(e.target.value)}
                                placeholder="Write your bio here..."
                                required
                            />
                            <div className="custom-file-upload-container">

                            <input
                             className="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={(e) => setProfilePicture(e.target.files[0])}
                            />
                            </div>
                            <button
                             className="save-profile-btn" 
                                type="submit"
                            >
                                Save Changes
                            </button>
                        </form>
                    )}
<section className="upload-article-section">

<h3 className="upload-article-title">Upload New Article</h3>

                    <form onSubmit={handleArticleSubmit} style={{ marginTop: '10px' }}>
                        <input
                         className="article-title-input"
                            name="title"
                            placeholder="Article Title"
                            value={newArticle.title}
                            onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                            required
                        />
                        <textarea
                            name="content"
                            className="article-content-input"
                            placeholder="Article Content"
                            value={newArticle.content}
                            onChange={(e) => setNewArticle({ ...newArticle, content: e.target.value })}
                            required
                        />
                        <textarea
                            name="categories"
                            className="article-categories-input"
                            placeholder="Enter categories separated by commas (e.g., tech, health, science)"
                            value={newArticle.categories}
                            onChange={(e) =>
                                setNewArticle({ ...newArticle, categories: e.target.value })
                            }
                            required
                        />
                         <div className="upload-article-cover-container">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverImage(e.target.files[0])}
                        />
                           </div>

                        <button className="upload-article-cover-btn"
                            type="submit"
                        >
                            Upload Article
                        </button>
                    </form>
                    </section>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
