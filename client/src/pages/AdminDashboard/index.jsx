import { useEffect, useState } from "react";
import { fetchDashboardStats } from "../../api/adminApi";
import { toast } from "react-toastify";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "./AdminDashboard.css";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState("month"); // "month" or "day"

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardStats();
      if (res.success) {
        setStats(res.stats);
      } else {
        toast.error("Lỗi tải thống kê");
      }
    } catch (e) {
      toast.error("Lỗi kết nối máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Đang tải dữ liệu...</div>;
  if (!stats) return <div className="admin-error">Không có dữ liệu thống kê</div>;

  // Mock data for mini sparklines if API doesn't provide them
  const miniChartDataGreen = [{v: 10}, {v: 15}, {v: 12}, {v: 25}, {v: 18}, {v: 30}];
  const miniChartDataPurple = [{v: 5}, {v: 8}, {v: 15}, {v: 12}, {v: 20}, {v: 25}];
  const miniChartDataYellow = [{v: 20}, {v: 18}, {v: 22}, {v: 20}, {v: 20}, {v: 21}];

  return (
    <div className="tz-dashboard">
      <div className="tz-dashboard-header">
        <div className="tz-dashboard-greeting">
          <h2>Chào mừng trở lại! <span className="wave-emoji">👋</span></h2>
          <p>Đây là tổng quan hoạt động của hệ thống TZONE.</p>
        </div>
        <div className="tz-dashboard-date-picker">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>25/05/2025 - 25/06/2025</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </div>
      
      {/* 1. KPI Cards */}
      <div className="tz-stats-grid">
        <div className="tz-stat-card">
          <div className="tz-stat-card-header">
            <div className="tz-stat-icon tz-icon-green">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>
            </div>
            <div className="tz-stat-info">
              <h3>TỔNG HỌC VIÊN</h3>
              <p className="tz-stat-number">{stats.totalUsers}</p>
              <p className="tz-stat-trend tz-trend-up">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                12% so với tháng trước
              </p>
            </div>
          </div>
          <div className="tz-stat-sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={miniChartDataGreen}>
                <defs>
                  <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#10b981" fillOpacity={1} fill="url(#colorGreen)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tz-stat-card">
          <div className="tz-stat-card-header">
            <div className="tz-stat-icon tz-icon-purple">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm2 4h12v2H6zm-2 4h16v2H4zm2 4h12v2H6z"></path></svg>
            </div>
            <div className="tz-stat-info">
              <h3>KHÓA HỌC</h3>
              <p className="tz-stat-number">{stats.totalCourses}</p>
              <p className="tz-stat-trend tz-trend-up">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>
                8% so với tháng trước
              </p>
            </div>
          </div>
          <div className="tz-stat-sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={miniChartDataPurple}>
                <defs>
                  <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#a855f7" fillOpacity={1} fill="url(#colorPurple)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="tz-stat-card">
          <div className="tz-stat-card-header">
            <div className="tz-stat-icon tz-icon-yellow">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"></path></svg>
            </div>
            <div className="tz-stat-info">
              <h3>DOANH THU</h3>
              <p className="tz-stat-number">{stats.totalRevenue.toLocaleString()} đ</p>
              <p className="tz-stat-trend tz-trend-neutral">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                Không thay đổi
              </p>
            </div>
          </div>
          <div className="tz-stat-sparkline">
            <ResponsiveContainer width="100%" height={40}>
              <AreaChart data={miniChartDataYellow}>
                <defs>
                  <linearGradient id="colorYellow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#f59e0b" fillOpacity={1} fill="url(#colorYellow)" strokeWidth={2} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="tz-dashboard-layout">
        {/* 2. Main Chart */}
        <div className="tz-main-chart-card">
          <div className="tz-chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <h3>{chartView === "month" ? "Doanh thu 12 tháng gần nhất" : "Doanh thu 30 ngày gần nhất"}</h3>
            <div className="tz-chart-controls" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <select 
                value={chartView} 
                onChange={(e) => setChartView(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer', background: '#fff' }}
              >
                <option value="month">Theo tháng</option>
                <option value="day">Theo ngày</option>
              </select>
              <div className="tz-chart-legend">
                <span className="legend-dot"></span> Doanh thu (đ)
              </div>
            </div>
          </div>
          
          <div className="tz-chart-wrapper">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartView === "month" ? stats.revenueByMonth : (stats.revenueByDay || [])} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} 
                  dx={-10}
                />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} đ`, "Doanh thu"]}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="tz-chart-summary">
            <div className="tz-summary-item">
              <div className="tz-summary-icon icon-bg-green">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div className="tz-summary-text">
                <p>Tổng doanh thu</p>
                <h4>{stats.totalRevenue.toLocaleString()} đ</h4>
              </div>
            </div>
            <div className="tz-summary-divider"></div>
            <div className="tz-summary-item">
              <div className="tz-summary-icon icon-bg-teal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              </div>
              <div className="tz-summary-text">
                <p>Doanh thu trung bình/tháng</p>
                <h4>{(stats.totalRevenue / 12 || 0).toLocaleString()} đ</h4>
              </div>
            </div>
            <div className="tz-summary-divider"></div>
            <div className="tz-summary-item">
              <div className="tz-summary-icon icon-bg-gray">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
              </div>
              <div className="tz-summary-text">
                <p>Tăng trưởng</p>
                <h4>—%</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
