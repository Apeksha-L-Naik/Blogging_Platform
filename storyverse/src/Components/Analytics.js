import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import '../Styles/analytics.css'

const Analytics = () => {
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
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1,
            },
            {
                label: 'Likes',
                data: articles.map(article => article.likes),
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const categoryData = {
        labels: categories.map(category => category.name),
        datasets: [
            {
                label: 'Articles per Category',
                data: categories.map(category => category.count),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                ],
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Analytics Overview',
            },
        },
    };

    return (
        <div className="analytics-container">
            <div className="summary-card">
                <h1 className="title">Analytics Dashboard</h1>
                <div className="summary-details">
                    <p><strong>Total Articles:</strong> {summary.totalArticles}</p>
                    <p><strong>Total Readers:</strong> {summary.totalReaders}</p>
                    <p><strong>Total Authors:</strong> {summary.totalAuthors}</p>
                </div>
            </div>

            <div className="charts-container">
                {articles.length > 0 && (
                    <div className="chart-card">
                        <h3>Article Performance</h3>
                        <Bar data={articleData} options={options} />
                    </div>
                )}

                {categories.length > 0 && (
                    <div className="chart-card">
                        <h3>Articles by Category</h3>
                        <Pie data={categoryData} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
