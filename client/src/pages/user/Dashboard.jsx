import React, { useContext, useEffect, useMemo } from 'react';
import DateTimeDisplay from '../../components/common/DateTimeDisplay';
import Sidebar from '../../components/layout/Sidebar';
import { AuthContext } from '../../context/AuthContext';
import { UserContext } from '../../context/UserContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Legend as PieLegend } from 'recharts';
import { FaUsers, FaBook, FaExclamationTriangle, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import './Dashboard.css';
const StatCard = ({ icon, label, value, bgColor }) => (
  <div className="stat-card-v2" style={{ backgroundColor: bgColor }}>
    <div className="stat-icon-wrapper">{icon}</div>
    <div className="stat-info">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  </div>
);
const ChartContainer = ({ title, children }) => (
  <div className="chart-container">
    <h3 className="chart-title">{title}</h3>
    {children}
  </div>
);
const Dashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const { allBooks, allUsers, borrows } = useContext(UserContext);
  const { refreshAuthContext } = useContext(AuthContext);
  const processedData = useMemo(() => {
    const totalMembers = allUsers.length;
    const totalOverdue = borrows.filter(b => !b.returnDate && new Date(b.dueDate) < new Date()).length;
    const currentlyBorrowed = borrows.filter(b => !b.returnDate).length;
    const booksRead = borrows.filter(b => b.returnDate).length;
    const userOverdue = borrows.filter(b => !b.returnDate && new Date(b.dueDate) < new Date()).length;
    let barChartData = [];
    let pieChartData = [];
    let userGenreChartData = [];
    if (isAdmin(user, ["Admin", "Librarian"])) {
      const monthlyBorrows = Array(6).fill(0);
      const monthLabels = [];
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        monthLabels.push(d.toLocaleString('default', { month: 'short' }));
      }
      borrows.forEach(borrow => {
        const borrowDate = new Date(borrow.borrowDate);
        const monthDiff = (today.getFullYear() - borrowDate.getFullYear()) * 12 + (today.getMonth() - borrowDate.getMonth());
        if (monthDiff >= 0 && monthDiff < 6) {
          monthlyBorrows[5 - monthDiff]++;
        }
      });
      barChartData = monthLabels.map((name, index) => ({ name, borrows: monthlyBorrows[index] }));
      const genreCounts = allBooks.reduce((acc, book) => {
        const genre = book.genre || 'Uncategorized';
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});
      pieChartData = Object.entries(genreCounts).map(([name, value]) => ({ name, value }));
    } else {
      const userGenreCounts = borrows.reduce((acc, borrow) => {
        if (borrow.book) {
          const genre = borrow.book.genre || 'Uncategorized';
          acc[genre] = (acc[genre] || 0) + 1;
        }
        return acc;
      }, {});
      userGenreChartData = Object.entries(userGenreCounts).map(([name, value]) => ({ name, books: value }));
    }
    const recentBorrows = [...borrows]
      .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
      .slice(0, 5);
    return { totalMembers, totalOverdue, currentlyBorrowed, booksRead, userOverdue, barChartData, pieChartData, recentBorrows, userGenreChartData };
  }, [allBooks, allUsers, borrows]);
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF4560'];
  return (
    <div className="dashboard-container-v2">
      <Sidebar />
      <main className="main-content-v2">
        <header className="header-v2">
          <div className="header-greeting">
            <h1>Dashboard</h1>
            <p>Welcome back, {user?.name || 'User'}!</p>
          </div>
          <DateTimeDisplay />
        </header>
        {}
        <section className="stats-grid">
          {isAdmin(user, ["Admin", "Librarian"]) ? (
            <>
              <StatCard icon={<FaUsers />} label="Total Members" value={processedData.totalMembers} bgColor="#e0f2fe" />
              <StatCard icon={<FaBook />} label="Total Books" value={allBooks.length} bgColor="#dcfce7" />
              <StatCard icon={<FaExclamationTriangle />} label="Overdue Books" value={processedData.totalOverdue} bgColor="#fee2e2" />
            </>
          ) : (
            <>
              <StatCard icon={<FaBook />} label="Currently Borrowed" value={processedData.currentlyBorrowed} bgColor="#e0f2fe" />
              <StatCard icon={<FaExclamationTriangle />} label="Overdue Books" value={processedData.userOverdue} bgColor="#fee2e2" />
              <StatCard icon={<FaCheckCircle />} label="Books Read" value={processedData.booksRead} bgColor="#dcfce7" />
            </>
          )}
        </section>
        {}
        <section className="charts-grid">
          {isAdmin(user, ["Admin", "Librarian"]) ? (
            <>
              <ChartContainer title="Monthly Borrowing Trends">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.barChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="borrows" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              <ChartContainer title="Book Genres">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={processedData.pieChartData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                      {processedData.pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <PieLegend layout="vertical" verticalAlign="middle" align="right" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </>
          ) : (
            <div className="full-width-chart">
              <ChartContainer title="Your Reading Habits by Genre">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.userGenreChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                    <Legend iconType="circle" />
                    <Bar dataKey="books" fill="#8884d8" barSize={30} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          )}
        </section>
        {}
        <section className="recent-activity-section">
          <div className="recent-activity-header">
            <h3 className="recent-activity-title">Recent Borrows</h3>
            <a href="/catalog" className="view-all-link">
              View All <FaArrowRight />
            </a>
          </div>
          <div className="recent-activity-list">
            {processedData.recentBorrows.map(borrow => (
              <div key={borrow?._id} className="activity-item">
                <div className="activity-details">
                  <span className="activity-book-title">{borrow?.book?.title || 'Unknown Book'}</span>
                  {isAdmin(user, ["Admin", "Librarian"]) && <span className="activity-member-name">by {borrow?.user?.name || 'Unknown User'}</span>}
                </div>
                <span className="activity-date">{new Date(borrow?.borrowDate).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
export default Dashboard;