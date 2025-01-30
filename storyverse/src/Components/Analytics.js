import React, { useEffect, useState } from 'react';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';
import '../Styles/analytics.css';

const Analytics = () => {
    const [activeChart, setActiveChart] = useState('performance');
    const [articles, setArticles] = useState([]);
    const [summary, setSummary] = useState({ totalArticles: 0, totalReaders: 0, totalAuthors: 0 });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await fetch('http://localhost:5000/analytics');
                if (!response.ok) throw new Error('Failed to fetch data');

                const data = await response.json();

                setSummary({
                    totalArticles: data.totalArticles || 0,
                    totalReaders: data.totalReaders || 0,
                    totalAuthors: data.totalAuthors || 0,
                });
                setArticles(data.articles || []);
                setCategories(data.categories || []);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="loading-container"><h2>Loading...</h2></div>;
    }

    const articleData = {
        labels: articles.map(article => article.title),
        datasets: [
            {
                label: 'Views',
                data: articles.map(article => article.views),
                backgroundColor: '#4285F4',
            },
            {
                label: 'Likes',
                data: articles.map(article => article.likes),
                backgroundColor: '#FBBC05',
            },
        ],
    };

    const categoryData = {
        labels: categories.map(category => category.name),
        datasets: [
            {
                label: 'Articles per Category',
                data: categories.map(category => category.count),
                backgroundColor: ['#34A853', '#EA4335', '#FBBC05', '#4285F4'],
            },
        ],
    };

    const summaryData = {
        labels: ['Articles', 'Readers', 'Authors'],
        datasets: [
            {
                data: [summary.totalArticles, summary.totalReaders, summary.totalAuthors],
                backgroundColor: ['#FF5733', '#33FFBD', '#3375FF'],
            },
        ],
    };

    return (
        <div className="analytics-container">
            <h1 className="dashboard-title">Analytics Dashboard</h1>

            {/* Summary Section */}
            <div className="summary-container">
                <div className="summary-card">
                    <h3>Total Articles</h3>
                    <p>{summary.totalArticles}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Readers</h3>
                    <p>{summary.totalReaders}</p>
                </div>
                <div className="summary-card">
                    <h3>Total Authors</h3>
                    <p>{summary.totalAuthors}</p>
                </div>
            </div>

            {/* Button Group */}
            <div className="button-group">
                <button
                    onClick={() => setActiveChart('performance')}
                    className={activeChart === 'performance' ? 'active' : ''}
                >
                    Performance
                </button>
                <button
                    onClick={() => setActiveChart('category')}
                    className={activeChart === 'category' ? 'active' : ''}
                >
                    Articles by Category
                </button>
                <button
                    onClick={() => setActiveChart('overview')}
                    className={activeChart === 'overview' ? 'active' : ''}
                >
                    Overview
                </button>
            </div>

            {/* Chart Section */}
            <div className="charts-container">
                {activeChart === 'performance' && (
                    <div className="chart-card">
                        <h3>Articles Performance</h3>
                        <Bar data={articleData} />
                    </div>
                )}
                {activeChart === 'category' && (
                    <div className="chart-card">
                        <h3>Articles by Category</h3>
                        <Pie data={categoryData} />
                    </div>
                )}
                {activeChart === 'overview' && (
                    <div className="chart-card">
                        <h3>Overview</h3>
                        <Doughnut data={summaryData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;