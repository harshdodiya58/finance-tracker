import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { investmentAPI } from '../services/api';
import { formatCurrency, formatDate } from '../utils/helpers';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  const [formData, setFormData] = useState({
    symbol: '',
    type: 'stock',
    amountInvested: '',
    quantity: '',
    purchasePrice: '',
    currentValue: '',
    date: new Date().toISOString().split('T')[0]
  });

  const investmentTypes = ['stock', 'crypto'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [investmentsRes, portfolioRes] = await Promise.all([
        investmentAPI.getAll(),
        investmentAPI.getPortfolio()
      ]);
      setInvestments(investmentsRes.data.data || []);
      setPortfolio(portfolioRes.data.data || null);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProfitLoss = (investment) => {
    return investment.currentValue - investment.amountInvested;
  };

  const calculateProfitLossPercentage = (investment) => {
    if (investment.amountInvested === 0) return 0;
    return ((investment.currentValue - investment.amountInvested) / investment.amountInvested * 100).toFixed(2);
  };

  const handleOpenModal = (investment = null) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData({
        symbol: investment.symbol,
        type: investment.type,
        amountInvested: investment.amountInvested,
        quantity: investment.quantity || '',
        purchasePrice: investment.purchasePrice || '',
        currentValue: investment.currentValue,
        date: new Date(investment.date).toISOString().split('T')[0]
      });
    } else {
      setEditingInvestment(null);
      setFormData({
        symbol: '',
        type: 'stock',
        amountInvested: '',
        quantity: '',
        purchasePrice: '',
        currentValue: '',
        date: new Date().toISOString().split('T')[0]
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvestment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInvestment) {
        await investmentAPI.update(editingInvestment._id, formData);
      } else {
        await investmentAPI.create(formData);
      }
      fetchData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving investment:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await investmentAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting investment:', error);
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Portfolio Overview */}
        {portfolio && portfolio.overall && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-purple-100">Total Invested</p>
                <DollarSign className="w-6 h-6 text-purple-200" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(portfolio.overall.totalInvested || 0)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-blue-100">Current Value</p>
                <PieChart className="w-6 h-6 text-blue-200" />
              </div>
              <p className="text-3xl font-bold">{formatCurrency(portfolio.overall.totalCurrentValue || 0)}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={`rounded-2xl shadow-lg p-6 text-white ${
                (portfolio.overall.profitLoss || 0) >= 0
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-red-500 to-rose-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={(portfolio.overall.profitLoss || 0) >= 0 ? 'text-green-100' : 'text-red-100'}>
                  Profit/Loss
                </p>
                {(portfolio.overall.profitLoss || 0) >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-200" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-200" />
                )}
              </div>
              <p className="text-3xl font-bold">{formatCurrency(Math.abs(portfolio.overall.profitLoss || 0))}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`rounded-2xl shadow-lg p-6 text-white ${
                (portfolio.overall.profitLossPercentage || 0) >= 0
                  ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                  : 'bg-gradient-to-br from-red-500 to-rose-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className={(portfolio.overall.profitLossPercentage || 0) >= 0 ? 'text-green-100' : 'text-red-100'}>
                  Return %
                </p>
                {(portfolio.overall.profitLossPercentage || 0) >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-200" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-200" />
                )}
              </div>
              <p className="text-3xl font-bold">
                {(portfolio.overall.profitLossPercentage || 0) >= 0 ? '+' : ''}{(portfolio.overall.profitLossPercentage || 0).toFixed(2)}%
              </p>
            </motion.div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Investment Portfolio</h1>
            <p className="text-gray-600 mt-1">Track and manage your investments</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-medium shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Investment
          </button>
        </div>

        {/* Investments List */}
        {investments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-card p-12 text-center"
          >
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Investments Yet</h3>
            <p className="text-gray-600 mb-6">Add your first investment to start tracking your portfolio</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all inline-flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Investment
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {investments.map((investment, index) => {
              const profitLoss = calculateProfitLoss(investment);
              const profitLossPercentage = calculateProfitLossPercentage(investment);
              const isProfit = profitLoss >= 0;

              return (
                <motion.div
                  key={investment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-card p-6 hover:shadow-card-hover transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">{investment.symbol}</h3>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full mt-2 capitalize">
                        {investment.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(investment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(investment._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Invested</span>
                      <span className="text-sm font-semibold text-gray-800">{formatCurrency(investment.amountInvested)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Current Value</span>
                      <span className="text-sm font-semibold text-gray-800">{formatCurrency(investment.currentValue)}</span>
                    </div>
                    {investment.quantity > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quantity</span>
                        <span className="text-sm font-semibold text-gray-800">{investment.quantity}</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Profit/Loss</span>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            {isProfit ? '+' : ''}{formatCurrency(Math.abs(profitLoss))}
                          </p>
                          <p className={`text-xs ${isProfit ? 'text-green-600' : 'text-red-600'}`}>
                            {isProfit ? '+' : ''}{profitLossPercentage}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 text-xs text-gray-500">
                      Added: {formatDate(investment.date)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingInvestment ? 'Edit Investment' : 'Add Investment'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                  <input
                    type="text"
                    required
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    placeholder="e.g., AAPL, BTC"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent uppercase"
                    maxLength="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    {investmentTypes.map(type => (
                      <option key={type} value={type} className="capitalize">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Invested</label>
                  <input
                    type="number"
                    required
                    value={formData.amountInvested}
                    onChange={(e) => setFormData({ ...formData, amountInvested: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (Optional)</label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Price (Optional)</label>
                    <input
                      type="number"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Value</label>
                  <input
                    type="number"
                    required
                    value={formData.currentValue}
                    onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all font-medium"
                  >
                    {editingInvestment ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Investments;
