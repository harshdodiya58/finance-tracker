import { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    CreditCard,
    PiggyBank,
    PieChart,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    DollarSign,
    ShoppingBag,
    Home,
    Car,
    Coffee,
    Briefcase
} from 'lucide-react';
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { transactionAPI, budgetAPI, investmentAPI } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const categoryIcons = {
    Food: <Coffee className="w-4 h-4" />,
    Transport: <Car className="w-4 h-4" />,
    Shopping: <ShoppingBag className="w-4 h-4" />,
    Housing: <Home className="w-4 h-4" />,
    Salary: <Briefcase className="w-4 h-4" />,
    Other: <DollarSign className="w-4 h-4" />,
};

const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        budgetUsage: 0,
        investments: 0,
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chartFilter, setChartFilter] = useState('7'); // 7, 30, or 90 days

    useEffect(() => {
        fetchDashboardData();
    }, [chartFilter]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch transactions
            const transRes = await transactionAPI.getAll({ limit: 5, sort: '-date' });
            const transactions = transRes.data.data;
            setRecentTransactions(transactions);

            // Calculate stats
            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            // Fetch budgets
            const budgetRes = await budgetAPI.getAll();
            const budgets = budgetRes.data.data || [];
            const totalBudget = budgets.reduce((sum, b) => sum + (b.progress?.limit || b.amount || 0), 0);
            const totalSpent = budgets.reduce((sum, b) => sum + (b.progress?.spent || 0), 0);
            const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget * 100).toFixed(1) : 0;

            // Fetch investments
            const invRes = await investmentAPI.getAll();
            const investments = invRes.data.data;
            const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0);

            setStats({
                totalBalance: income - expenses,
                monthlyIncome: income,
                monthlyExpenses: expenses,
                budgetUsage,
                investments: totalInvestments,
            });

            // Prepare chart data based on selected filter
            const days = parseInt(chartFilter);
            const chartDays = [];
            const now = new Date();
            
            // Fetch transactions for the selected period
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            
            const periodTransRes = await transactionAPI.getAll({ 
                startDate: startDate.toISOString().split('T')[0],
                endDate: now.toISOString().split('T')[0]
            });
            const periodTransactions = periodTransRes.data.data;
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];

                const dayIncome = periodTransactions
                    .filter(t => t.type === 'income' && t.date.split('T')[0] === dateStr)
                    .reduce((sum, t) => sum + t.amount, 0);

                const dayExpense = periodTransactions
                    .filter(t => t.type === 'expense' && t.date.split('T')[0] === dateStr)
                    .reduce((sum, t) => sum + t.amount, 0);

                chartDays.push({
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    income: dayIncome,
                    expense: dayExpense,
                });
            }
            setChartData(chartDays);

            // Prepare category data
            const categories = {};
            transactions.filter(t => t.type === 'expense').forEach(t => {
                categories[t.category] = (categories[t.category] || 0) + t.amount;
            });

            const catData = Object.entries(categories).map(([name, value]) => ({
                name,
                value: Math.round(value),
            }));
            setCategoryData(catData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const overviewCards = [
        {
            title: 'Total Balance',
            value: formatCurrency(stats.totalBalance),
            icon: <CreditCard className="w-7 h-7" />,
            color: 'from-purple-500 to-indigo-600',
            textColor: 'text-purple-500',
            trend: stats.totalBalance >= 0 ? '+' : '-',
        },
        {
            title: 'Monthly Income',
            value: formatCurrency(stats.monthlyIncome),
            icon: <TrendingUp className="w-7 h-7" />,
            color: 'from-green-400 to-emerald-600',
            textColor: 'text-green-500',
            trend: '+',
        },
        {
            title: 'Monthly Expenses',
            value: formatCurrency(stats.monthlyExpenses),
            icon: <TrendingDown className="w-7 h-7" />,
            color: 'from-red-400 to-rose-600',
            textColor: 'text-red-500',
            trend: '-',
        },
        {
            title: 'Investments',
            value: formatCurrency(stats.investments),
            icon: <PiggyBank className="w-7 h-7" />,
            color: 'from-pink-400 to-fuchsia-600',
            textColor: 'text-pink-500',
            trend: '+',
        },
    ];

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {overviewCards.map((card, idx) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`bg-gradient-to-br ${card.color} rounded-xl p-3 text-white`}>
                                {card.icon}
                            </div>
                            <span className={`text-xs font-semibold ${card.textColor} flex items-center gap-1`}>
                                {card.trend === '+' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                {Math.abs(5)}%
                            </span>
                        </div>
                        <div className="text-3xl font-bold text-gray-800 mb-1">{card.value}</div>
                        <div className="text-sm text-gray-500">{card.title}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Income vs Expense Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="xl:col-span-2 bg-white rounded-2xl shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Income vs Expenses</h2>
                        <select 
                            value={chartFilter}
                            onChange={(e) => setChartFilter(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="7">Last 7 Days</option>
                            <option value="30">Last 30 Days</option>
                            <option value="90">Last 90 Days</option>
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                formatter={(value) => formatCurrency(value)}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} name="Income" />
                            <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} name="Expenses" />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Category Breakdown */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Expense Categories</h2>
                    {categoryData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <RechartsPie>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                </RechartsPie>
                            </ResponsiveContainer>
                            <div className="mt-4 space-y-2">
                                {categoryData.slice(0, 4).map((cat, idx) => (
                                    <div key={cat.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                            <span className="text-sm text-gray-700">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-800">{formatCurrency(cat.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <p>No expense data yet</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Recent Transactions & Quick Actions */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Transactions */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="xl:col-span-2 bg-white rounded-2xl shadow-lg p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">Recent Transactions</h2>
                        <button className="text-purple-600 text-sm font-semibold hover:text-purple-700">View All</button>
                    </div>
                    {recentTransactions.length > 0 ? (
                        <div className="space-y-4">
                            {recentTransactions.map((transaction) => (
                                <div key={transaction._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                            }`}>
                                            {categoryIcons[transaction.category] || <DollarSign className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{transaction.description}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(transaction.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                                        </p>
                                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                                            {transaction.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <DollarSign className="w-16 h-16 mb-4 opacity-50" />
                            <p className="text-lg mb-2">No transactions yet</p>
                            <p className="text-sm">Add your first transaction to get started!</p>
                        </div>
                    )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white rounded-2xl shadow-lg p-6"
                >
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <button className="w-full bg-gradient-to-r from-green-400 to-emerald-600 text-white rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                            <span className="font-semibold">Add Income</span>
                            <Plus className="w-5 h-5" />
                        </button>
                        <button className="w-full bg-gradient-to-r from-red-400 to-rose-600 text-white rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                            <span className="font-semibold">Add Expense</span>
                            <Plus className="w-5 h-5" />
                        </button>
                        <button className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                            <span className="font-semibold">Create Budget</span>
                            <PieChart className="w-5 h-5" />
                        </button>
                        <button className="w-full bg-gradient-to-r from-pink-400 to-fuchsia-600 text-white rounded-xl p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                            <span className="font-semibold">Add Investment</span>
                            <PiggyBank className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Budget Progress */}
                    <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Budget Usage</span>
                            <span className="text-sm font-bold text-purple-600">{stats.budgetUsage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(stats.budgetUsage, 100)}%` }}
                            ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {stats.budgetUsage < 70 ? '✅ You\'re on track!' : stats.budgetUsage < 90 ? '⚠️ Nearing budget limit' : '🚨 Over budget!'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default Dashboard;
