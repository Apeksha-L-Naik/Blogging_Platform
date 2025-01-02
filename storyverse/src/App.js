import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './Components/Signup';
import Login from './Components/Login';
import Home from './Components/Home';
import Articles from './Components/Articles';
import ArticleDetail from './Components/ArticleDetail';
import Categories from './Components/Categories';
import CategoryArticles from './Components/CategoryArticles';
import Analytics from './Components/Analytics';

function App() {
    return (
        <Router>
            <div>
                <Routes>
                <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    {/* <Route path="/login" element={<Login />} /> */}
                    <Route path='/home' element={<Home/>}/>
                    <Route path="/articles" element={<Articles />} />
                    <Route path="/articles/:id" element={<ArticleDetail />} />
                    <Route path="/categories" element={<Categories/>}/>
                    <Route path="/categories/:categoryId" element={<CategoryArticles/>}/>
                    <Route path="/analytics" element={<Analytics/>}/>
                </Routes>
            </div>
        </Router>
    );
}

export default App;