import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Check, X, Phone, Lock, Mail, AlertCircle, Loader2, Bell, Trash2, CheckCircle2, RefreshCw, MessageSquare, Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { updateProfile } from '../../api/userApi';
import { getNotifications, markNotificationAsRead, deleteNotification, clearAllNotifications } from '../../api/notificationApi';
import { getConversations, getMessages, sendMessage, markConversationRead } from '../../api/chatApi';
import { getBuyerChatRequests, getSellerChatRequests, respondToChatRequest } from '../../api/chatRequestApi';
import { createReport } from '../../api/reportApi';
import { toast } from 'react-toastify';

export const Topbar = ({ onToggleSidebar }) => {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Logout & Profile states
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Profile Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone_number || user?.mobile_number || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Notifications states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Chat feature states
  const [conversations, setConversations] = useState([]);
  const [showChats, setShowChats] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatRequests, setChatRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [respondingRequestId, setRespondingRequestId] = useState('');
  const [showChatReportModal, setShowChatReportModal] = useState(false);
  const [chatReportType, setChatReportType] = useState('chat_abuse');
  const [chatReportReason, setChatReportReason] = useState('');
  const [submittingChatReport, setSubmittingChatReport] = useState(false);
  const [reportContext, setReportContext] = useState(null);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null
  });

  const handleLogout = () => {
    logout();
    setShowConfirmLogout(false);
    navigate('/login');
  };

  const handleOpenModal = () => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setPhone(user?.phone_number || user?.mobile_number || '');
    setPassword('');
    setConfirmPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setShowProfileModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Name is required.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg('Email is required.');
      return;
    }
    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name,
        email,
        mobile_number: phone
      };
      if (password) {
        payload.password = password;
      }
      
      const updatedUser = await updateProfile(payload);
      
      // Update local storage and context state
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setSuccessMsg('Profile updated successfully!');
      toast.success('Profile updated successfully!');
      
      setPassword('');
      setConfirmPassword('');
      
      setTimeout(() => {
        setShowProfileModal(false);
        setSuccessMsg('');
      }, 1500);

    } catch (err) {
      console.error('Failed to update profile:', err);
      const errMsg = err.response?.data?.detail || err.response?.data?.message || 'Failed to update profile.';
      setErrorMsg(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Notification Operations
  const fetchNotifs = async () => {
    if (!user) return;
    try {
      setLoadingNotifs(true);
      const data = await getNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      toast.success('Notification marked as read');
    } catch (err) {
      console.error('Failed to mark notification read:', err);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleDeleteNotif = (e, id) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Clear Notification',
      message: 'Are you sure you want to clear this notification?',
      onConfirm: async () => {
        try {
          await deleteNotification(id);
          setNotifications(prev => prev.filter(n => n.id !== id));
          toast.success('Notification cleared successfully');
        } catch (err) {
          console.error('Failed to delete notification:', err);
          toast.error('Failed to delete notification.');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleClearAllNotifs = () => {
    if (notifications.length === 0) return;
    setConfirmModal({
      isOpen: true,
      title: 'Clear All Notifications',
      message: 'Are you sure you want to clear all notifications from your logs?',
      onConfirm: async () => {
        try {
          await clearAllNotifications();
          setNotifications([]);
          toast.success('All notifications cleared');
        } catch (err) {
          console.error('Failed to clear notifications:', err);
          toast.error('Failed to clear notifications.');
        }
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const fetchChats = async () => {
    if (!user || !['buyer', 'seller', 'dealer'].includes(user.role?.toLowerCase())) return;
    try {
      setLoadingChats(true);
      const [data, requestData] = await Promise.all([
        getConversations(),
        user.role?.toLowerCase() === 'buyer' ? getBuyerChatRequests() : getSellerChatRequests()
      ]);
      const list = Array.isArray(data) ? data : (data?.conversations || data?.data || []);
      const requestList = Array.isArray(requestData) ? requestData : (requestData?.requests || requestData?.data || []);
      setConversations(list);
      setChatRequests(requestList);
    } catch (err) {
      console.error("Failed to load chat channels:", err);
    } finally {
      setLoadingChats(false);
    }
  };

  const handleRespondToRequest = async (e, requestId, action) => {
    e.stopPropagation();
    try {
      setRespondingRequestId(requestId);
      const result = await respondToChatRequest(requestId, action);
      toast.success(action === 'accept' ? 'Request accepted. Chat is now open.' : 'Request rejected. Buyer has been notified.');
      await fetchChats();
      if (action === 'accept') {
        const chatId = result?.conversation_id || result?.conversation?.conversation_id;
        if (chatId) {
          const data = await getConversations();
          const list = Array.isArray(data) ? data : (data?.conversations || data?.data || []);
          const found = list.find(c => (c.id || c.conversation_id) === chatId);
          if (found) {
            await handleOpenChat(found);
          } else {
            localStorage.setItem('open_chat_id', chatId);
          }
        }
      }
    } catch (err) {
      console.error("Failed to respond to request:", err);
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to respond to request.');
    } finally {
      setRespondingRequestId('');
    }
  };

  const handleChatIconClick = () => {
    setShowChats(!showChats);
    setShowNotifications(false);
    if (!showChats) {
      fetchChats();
    }
  };

  const handleOpenChat = async (conv) => {
    setActiveChat(conv);
    setActiveRequest(null);
    setShowChats(true);
    setLoadingMessages(true);
    const cid = conv.conversation_id || conv.id;
    try {
      const data = await getMessages(cid);
      const list = Array.isArray(data) ? data : (data?.messages || data?.data || []);
      setMessages(list);
      await markConversationRead(cid);
      // Refresh chat list to clear badge
      fetchChats();
    } catch (err) {
      console.error("Failed to open conversation channel:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const openAcceptedRequestChat = async (req) => {
    const chatId = req?.conversation_id || req?.conversation?.conversation_id;
    if (!chatId) {
      toast.error('Chat opens once the seller accepts your request.');
      return;
    }
    try {
      const data = await getConversations();
      const list = Array.isArray(data) ? data : (data?.conversations || data?.data || []);
      const found = list.find(c => (c.id || c.conversation_id) === chatId);
      if (found) {
        await handleOpenChat(found);
      } else {
        localStorage.setItem('open_chat_id', chatId);
      }
    } catch (err) {
      console.error("Failed to open accepted request chat:", err);
      toast.error("Failed to open chat.");
    }
  };

  const handleOpenAcceptedRequestChat = async (e, req) => {
    e.stopPropagation();
    await openAcceptedRequestChat(req);
  };

  const handleOpenRequest = async (req) => {
    const status = String(req?.status || '').toUpperCase();
    if (status === 'ACCEPTED') {
      await openAcceptedRequestChat(req);
      return;
    }
    setActiveChat(null);
    setActiveRequest(req);
    setShowChats(true);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;

    const cid = activeChat.conversation_id || activeChat.id;
    const text = newMessage.trim();
    setNewMessage('');

    try {
      const sent = await sendMessage(cid, text);
      
      // Append locally
      setMessages(prev => [...(Array.isArray(prev) ? prev : []), {
        id: sent.id || 'm_' + Date.now(),
        sender_id: user.user_id || user.id,
        sender_name: user.name,
        message: text,
        is_read: false,
        created_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message.");
    }
  };

  const getChatReportedUserId = () => {
    if (reportContext) return reportContext.reported_user_id;
    if (!activeChat || !user) return null;
    const myId = user.user_id || user.id;
    if (myId === activeChat.buyer_id) return activeChat.seller_id;
    if (myId === activeChat.seller_id) return activeChat.buyer_id;
    return activeChat.buyer_id || activeChat.seller_id || null;
  };

  const handleSubmitChatReport = async (e) => {
    e.preventDefault();
    if (!activeChat && !reportContext) return;
    if (chatReportReason.trim().length < 10) {
      toast.error('Please add at least 10 characters explaining the issue.');
      return;
    }

    try {
      setSubmittingChatReport(true);
      await createReport({
        product_id: reportContext?.product_id || activeChat.product_id,
        reported_user_id: getChatReportedUserId(),
        report_type: chatReportType,
        reason: chatReportReason.trim(),
        evidence: reportContext?.evidence || messages.slice(-10).map((msg) => `${msg.sender_id}: ${msg.message}`)
      });
      toast.success('Report submitted. Admin will review it.');
      setShowChatReportModal(false);
      setReportContext(null);
      setChatReportType('chat_abuse');
      setChatReportReason('');
    } catch (err) {
      console.error('Failed to submit chat report:', err);
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmittingChatReport(false);
    }
  };

  const openRequestReport = (e, req) => {
    e.stopPropagation();
    setReportContext({
      product_id: req.product_id,
      reported_user_id: req.seller_id,
      evidence: [
        `Request status: ${req.status}`,
        `Buyer message: ${req.buyer_message || ''}`,
        `Seller response: ${req.seller_response_message || ''}`
      ]
    });
    setChatReportType(req.status === 'REJECTED' ? 'seller_buyer_dispute' : 'other');
    setShowChatReportModal(true);
  };

  // Background polling for conversations
  useEffect(() => {
    if (!user || !['buyer', 'seller', 'dealer'].includes(user.role?.toLowerCase())) return;

    fetchChats();
    const interval = setInterval(fetchChats, 10000);
    return () => clearInterval(interval);
  }, [user]);

  // Background polling for active conversation messages
  useEffect(() => {
    if (!activeChat) return;
    const cid = activeChat.conversation_id || activeChat.id;

    const interval = setInterval(async () => {
      try {
        const data = await getMessages(cid);
        const list = Array.isArray(data) ? data : (data?.messages || data?.data || []);
        setMessages(list);
        await markConversationRead(cid);
        fetchChats();
      } catch (err) {
        console.error("Error polling messages:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeChat]);

  // External chat triggering via localStorage
  useEffect(() => {
    const checkExternalChatOpen = async () => {
      const openChatId = localStorage.getItem('open_chat_id');
      if (openChatId) {
        localStorage.removeItem('open_chat_id');
        try {
          const data = await getConversations();
          const list = Array.isArray(data) ? data : (data?.conversations || data?.data || []);
          setConversations(list);
          const found = list.find(c => (c.id || c.conversation_id) === openChatId);
          if (found) {
            setActiveChat(found);
            const dataMsgs = await getMessages(openChatId);
            const listMsgs = Array.isArray(dataMsgs) ? dataMsgs : (dataMsgs?.messages || dataMsgs?.data || []);
            setMessages(listMsgs);
            await markConversationRead(openChatId);
          }
        } catch (err) {
          console.error("Failed to auto-open conversation:", err);
        }
      }
    };

    checkExternalChatOpen();
    const intv = setInterval(checkExternalChatOpen, 1000);
    return () => clearInterval(intv);
  }, []);

  const unreadChatsCount = Array.isArray(conversations) ? conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) : 0;
  const pendingRequestCount = Array.isArray(chatRequests)
    ? chatRequests.filter(r => r.status === 'PENDING' && user?.role?.toLowerCase() !== 'buyer').length
    : 0;
  const chatBadgeCount = unreadChatsCount + pendingRequestCount;

  const formatChatDateTime = (value) => {
    if (!value) return '';
    try {
      const d = new Date(value);
      return isNaN(d.getTime())
        ? ''
        : d.toLocaleString([], {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
    } catch (e) {
      return '';
    }
  };

  const getConversationTitle = (conv) => (
    conv.product_title ||
    conv.product?.title ||
    'Product Chat'
  );

  const getConversationParticipant = (conv) => {
    if (conv.other_participant_name || conv.participant_name) {
      return conv.other_participant_name || conv.participant_name;
    }
    const role = user?.role?.toLowerCase();
    if (role === 'buyer') return conv.seller?.name || 'Seller';
    if (role === 'seller' || role === 'dealer') return conv.buyer?.name || 'Buyer';
    return conv.buyer?.name || conv.seller?.name || 'Member';
  };

  const getLastMessageText = (conv) => {
    if (!conv) return 'No messages yet';
    if (typeof conv.last_message === 'string') return conv.last_message;
    if (conv.last_message?.message) return conv.last_message.message;
    return conv.last_message_text || 'No messages yet';
  };

  const messagesEndRef = React.useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      <header style={{
        height: '70px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        {/* Left side: Hamburger and title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={onToggleSidebar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#475569',
              display: 'none', // Hidden on desktop
            }}
            className="mobile-toggle"
          >
            <Menu size={24} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#0b0f19' }}>
            DealsKB C2C Portal
          </h2>
        </div>

        {/* Right side: Chats, Notifications, Profile, Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          
          {/* Chat Icon dropdown trigger */}
          {user && ['buyer', 'seller', 'dealer'].includes(user.role?.toLowerCase()) && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={handleChatIconClick}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#475569',
                  position: 'relative',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Chats"
              >
                <MessageSquare size={22} />
                {chatBadgeCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: pendingRequestCount > 0 ? '#ef4444' : '#10b981',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>
                    {chatBadgeCount}
                  </span>
                )}
              </button>

              {/* Chats Window */}
              {showChats && (
                <div style={{
                  position: 'fixed',
                  right: '24px',
                  top: '84px',
                  width: 'min(720px, calc(100vw - 2rem))',
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15)',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  zIndex: 9000,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: 'calc(100vh - 110px)'
                }}>
                  {activeRequest && (
                    <>
                      <div style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#ffffff', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                          <button
                            type="button"
                            onClick={() => setActiveRequest(null)}
                            style={{ background: 'none', border: 'none', color: '#bfdbfe', cursor: 'pointer', display: 'flex', padding: '0.15rem' }}
                            title="Back to chats"
                          >
                            <ArrowLeft size={20} />
                          </button>
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '0.65rem', color: '#93c5fd', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
                              Purchase Request
                            </span>
                            <strong style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                              {activeRequest.listing_name || 'Listing'}
                            </strong>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setReportContext({
                                product_id: activeRequest.product_id,
                                reported_user_id: user?.role?.toLowerCase() === 'buyer' ? activeRequest.seller_id : activeRequest.buyer_id,
                                evidence: [
                                  `Request status: ${activeRequest.status}`,
                                  `Buyer message: ${activeRequest.buyer_message || ''}`,
                                  `Seller response: ${activeRequest.seller_response_message || ''}`
                                ]
                              });
                              setChatReportType(String(activeRequest.status).toUpperCase() === 'REJECTED' ? 'seller_buyer_dispute' : 'other');
                              setShowChatReportModal(true);
                            }}
                            style={{ border: '1px solid rgba(248, 113, 113, 0.45)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fecaca', borderRadius: '0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.45rem', fontSize: '0.7rem', fontWeight: 800 }}
                          >
                            <AlertCircle size={13} />
                            Report
                          </button>
                          <button
                            onClick={() => { setActiveRequest(null); setShowChats(false); }}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: '#f8fafc', minHeight: '420px' }}>
                        <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.8rem', color: '#475569' }}>
                          <div><strong style={{ color: '#0f172a' }}>Buyer:</strong> {activeRequest.buyer_name || 'Buyer'}</div>
                          <div><strong style={{ color: '#0f172a' }}>Winning bid:</strong> ₹{activeRequest.winning_bid_amount}</div>
                          <div><strong style={{ color: '#0f172a' }}>Status:</strong> {activeRequest.status}</div>
                          <div><strong style={{ color: '#0f172a' }}>Created:</strong> {formatChatDateTime(activeRequest.created_at) || 'Just now'}</div>
                        </div>

                        <div style={{ alignSelf: user?.role?.toLowerCase() === 'buyer' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                          <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.85rem', borderBottomRightRadius: user?.role?.toLowerCase() === 'buyer' ? 0 : '0.85rem', borderBottomLeftRadius: user?.role?.toLowerCase() === 'buyer' ? '0.85rem' : 0, backgroundColor: user?.role?.toLowerCase() === 'buyer' ? '#2563eb' : '#ffffff', color: user?.role?.toLowerCase() === 'buyer' ? '#ffffff' : '#0f172a', border: user?.role?.toLowerCase() === 'buyer' ? 'none' : '1px solid #e2e8f0', lineHeight: 1.45, fontSize: '0.85rem' }}>
                            {activeRequest.buyer_message}
                          </div>
                          <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block', textAlign: user?.role?.toLowerCase() === 'buyer' ? 'right' : 'left' }}>
                            {formatChatDateTime(activeRequest.created_at)}
                          </span>
                        </div>

                        {activeRequest.seller_response_message && (
                          <div style={{ alignSelf: user?.role?.toLowerCase() === 'buyer' ? 'flex-start' : 'flex-end', maxWidth: '82%' }}>
                            <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.85rem', borderBottomRightRadius: user?.role?.toLowerCase() === 'buyer' ? '0.85rem' : 0, borderBottomLeftRadius: user?.role?.toLowerCase() === 'buyer' ? 0 : '0.85rem', backgroundColor: user?.role?.toLowerCase() === 'buyer' ? '#ffffff' : '#2563eb', color: user?.role?.toLowerCase() === 'buyer' ? '#0f172a' : '#ffffff', border: user?.role?.toLowerCase() === 'buyer' ? '1px solid #e2e8f0' : 'none', lineHeight: 1.45, fontSize: '0.85rem' }}>
                              {activeRequest.seller_response_message}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block', textAlign: user?.role?.toLowerCase() === 'buyer' ? 'left' : 'right' }}>
                              {formatChatDateTime(activeRequest.responded_at || activeRequest.updated_at)}
                            </span>
                          </div>
                        )}
                      </div>

                      {String(activeRequest.status || '').toUpperCase() === 'REJECTED' ? (
                        <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#b91c1c', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Lock size={16} />
                          {user?.role?.toLowerCase() === 'buyer' ? 'Conversation is closed because the seller rejected this request.' : 'You rejected this request. Conversation is closed.'}
                        </div>
                      ) : (
                        <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #fde68a', backgroundColor: '#fffbeb', color: '#92400e', fontWeight: 800, fontSize: '0.85rem' }}>
                          Chat will open once the seller accepts this request.
                        </div>
                      )}
                    </>
                  )}

                  {activeChat && (
                    <>
                      <div style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#ffffff', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                          <button
                            type="button"
                            onClick={() => setActiveChat(null)}
                            style={{ background: 'none', border: 'none', color: '#bfdbfe', cursor: 'pointer', display: 'flex', padding: '0.15rem' }}
                            title="Back to chats"
                          >
                            <ArrowLeft size={20} />
                          </button>
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '0.65rem', color: '#93c5fd', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
                              Chat Conversation
                            </span>
                            <strong style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                              {getConversationTitle(activeChat)}
                            </strong>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            type="button"
                            onClick={() => setShowChatReportModal(true)}
                            style={{ border: '1px solid rgba(248, 113, 113, 0.45)', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#fecaca', borderRadius: '0.45rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.45rem', fontSize: '0.7rem', fontWeight: 800 }}
                          >
                            <AlertCircle size={13} />
                            Report
                          </button>
                          <button
                            onClick={() => { setActiveChat(null); setShowChats(false); }}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#f8fafc', minHeight: '420px' }}>
                        <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.8rem', color: '#475569' }}>
                          <div><strong style={{ color: '#0f172a' }}>Listing:</strong> {getConversationTitle(activeChat)}</div>
                          <div><strong style={{ color: '#0f172a' }}>Participant:</strong> {getConversationParticipant(activeChat)}</div>
                          <div><strong style={{ color: '#0f172a' }}>Status:</strong> OPEN</div>
                          <div><strong style={{ color: '#0f172a' }}>Updated:</strong> {formatChatDateTime(activeChat.updated_at || activeChat.created_at) || 'Just now'}</div>
                        </div>
                        {loadingMessages ? (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
                          </div>
                        ) : (!Array.isArray(messages) || messages.length === 0) ? (
                          <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', padding: '2rem 1rem' }}>
                            No messages yet. Send a message to start the conversation!
                          </div>
                        ) : (
                          messages.map((msg, index) => {
                            const isMe = user && msg && (msg.sender_id === user.user_id || msg.sender_id === user.id);
                            return (
                              <div key={msg?.id || index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '0.75rem', borderBottomRightRadius: isMe ? 0 : '0.75rem', borderBottomLeftRadius: isMe ? '0.75rem' : 0, backgroundColor: isMe ? '#2563eb' : '#ffffff', color: isMe ? '#ffffff' : '#0f172a', fontSize: '0.85rem', fontWeight: 500, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', border: isMe ? 'none' : '1px solid #e2e8f0', wordBreak: 'break-word', textAlign: 'left' }}>
                                  {msg?.message || ''}
                                </div>
                                <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <span>{formatChatDateTime(msg?.created_at)}</span>
                                  {isMe && <span title={msg?.is_read ? 'Read' : 'Sent'} style={{ color: msg?.is_read ? '#2563eb' : '#94a3b8', fontWeight: 900, letterSpacing: '-0.08em' }}>✓✓</span>}
                                </span>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <form onSubmit={handleSendMessage} style={{ padding: '0.75rem', borderTop: '1px solid #cbd5e1', display: 'flex', gap: '0.5rem', backgroundColor: '#ffffff' }}>
                        <input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, padding: '0.5rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '9999px', fontSize: '0.85rem', outline: 'none', backgroundColor: '#f8fafc' }} />
                        <button type="submit" disabled={!newMessage.trim()} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: newMessage.trim() ? '#2563eb' : '#eff6ff', color: newMessage.trim() ? '#ffffff' : '#94a3b8', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'default', transition: 'all 0.15s ease' }}>
                          <Send size={16} />
                        </button>
                      </form>
                    </>
                  )}

                  {!activeChat && !activeRequest && (
                    <>
                  {/* Dropdown Header */}
                  <div style={{
                    padding: '1rem 1.15rem',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', display: 'block' }}>
                        Chats & Conversations
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700 }}>
                        Purchase requests and active chats
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={fetchChats}
                        disabled={loadingChats}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.35rem' }}
                        title="Refresh chats"
                      >
                        <RefreshCw size={16} style={{ animation: loadingChats ? 'spin 1s linear infinite' : 'none' }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowChats(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.35rem' }}
                        title="Close chats"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Chat List */}
                  <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '420px' }}>
                    {(!Array.isArray(conversations) || conversations.length === 0) && (!Array.isArray(chatRequests) || chatRequests.length === 0) ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                        No conversations yet
                      </div>
                    ) : (
                      <>
                        {Array.isArray(chatRequests) && chatRequests
                          .filter(req => req && typeof req === 'object' && user?.role?.toLowerCase() !== 'buyer')
                          .map((req) => {
                            const status = String(req.status || '').toUpperCase();
                            const isPending = status === 'PENDING';
                            const isAccepted = status === 'ACCEPTED';
                            const statusColor = isPending ? '#b45309' : isAccepted ? '#166534' : '#b91c1c';
                            const bgColor = isPending ? '#fffbeb' : isAccepted ? '#f0fdf4' : '#fef2f2';
                            const borderColor = isPending ? '#fde68a' : isAccepted ? '#bbf7d0' : '#fecaca';
                            return (
                              <div
                                key={req.request_id}
                                onClick={() => handleOpenRequest(req)}
                                style={{
                                  padding: '0.85rem 1rem',
                                  borderBottom: `1px solid ${borderColor}`,
                                  backgroundColor: bgColor,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.45rem',
                                  cursor: 'pointer'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'flex-start' }}>
                                  <div style={{ minWidth: 0 }}>
                                    <span style={{ fontSize: '0.78rem', color: statusColor, fontWeight: 800 }}>Purchase Request</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', display: 'block', marginTop: '0.15rem', textDecoration: 'underline' }}>{req.listing_name}</span>
                                  </div>
                                  <span style={{ fontSize: '0.65rem', color: statusColor, fontWeight: 900, border: `1px solid ${borderColor}`, borderRadius: '999px', padding: '0.15rem 0.45rem', flexShrink: 0 }}>
                                    {status || 'PENDING'}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                                  Buyer: {req.buyer_name} | Bid: ₹{req.winning_bid_amount}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#334155',
                                  lineHeight: 1.45,
                                  display: 'block',
                                  whiteSpace: 'normal'
                                }}>
                                  {req.buyer_message}
                                </span>
                                {req.seller_response_message && (
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: '#64748b',
                                    lineHeight: 1.45,
                                    display: 'block',
                                    whiteSpace: 'normal'
                                  }}>
                                    {req.seller_response_message}
                                  </span>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  {isPending && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => handleRespondToRequest(e, req.request_id, 'accept')}
                                        disabled={respondingRequestId === req.request_id}
                                        style={{
                                          flex: 1,
                                          border: 'none',
                                          borderRadius: '0.45rem',
                                          padding: '0.45rem',
                                          backgroundColor: '#10b981',
                                          color: '#ffffff',
                                          fontWeight: 800,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Accept
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => handleRespondToRequest(e, req.request_id, 'reject')}
                                        disabled={respondingRequestId === req.request_id}
                                        style={{
                                          flex: 1,
                                          border: '1px solid #fecaca',
                                          borderRadius: '0.45rem',
                                          padding: '0.45rem',
                                          backgroundColor: '#ffffff',
                                          color: '#dc2626',
                                          fontWeight: 800,
                                          cursor: 'pointer'
                                        }}
                                      >
                                        Reject
                                      </button>
                                    </>
                                  )}
                                  {isAccepted && (
                                    <button
                                      type="button"
                                      onClick={(e) => handleOpenAcceptedRequestChat(e, req)}
                                      style={{
                                        flex: 1,
                                        border: 'none',
                                        borderRadius: '0.45rem',
                                        padding: '0.45rem',
                                        backgroundColor: '#2563eb',
                                        color: '#ffffff',
                                        fontWeight: 800,
                                        cursor: 'pointer'
                                      }}
                                    >
                                      Open Chat
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => openRequestReport(e, req)}
                                    style={{
                                      flex: isPending || isAccepted ? 1 : 'unset',
                                      border: '1px solid #fecaca',
                                      borderRadius: '0.45rem',
                                      padding: '0.45rem 0.7rem',
                                      backgroundColor: '#ffffff',
                                      color: '#dc2626',
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Report
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                        {Array.isArray(chatRequests) && chatRequests
                          .filter(req => req && typeof req === 'object' && user?.role?.toLowerCase() === 'buyer')
                          .map((req) => (
                            <div
                              key={req.request_id}
                              onClick={() => handleOpenRequest(req)}
                              style={{
                                padding: '0.85rem 1rem',
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: req.status === 'REJECTED' ? '#fef2f2' : req.status === 'ACCEPTED' ? '#f0fdf4' : '#fffbeb',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.35rem',
                                cursor: 'pointer'
                              }}
                            >
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', textDecoration: 'underline' }}>{req.listing_name}</span>
                              <span style={{
                                fontSize: '0.75rem',
                                color: req.status === 'REJECTED' ? '#b91c1c' : req.status === 'ACCEPTED' ? '#166534' : '#b45309',
                                fontWeight: 800
                              }}>
                                {req.status === 'PENDING'
                                  ? 'Waiting for seller response'
                                  : req.status === 'ACCEPTED'
                                    ? 'Seller accepted your request'
                                    : 'Seller declined the request'}
                              </span>
                              {req.seller_response_message && (
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#64748b',
                                  lineHeight: 1.35,
                                  display: 'block',
                                  whiteSpace: 'normal'
                                }}>
                                  {req.seller_response_message}
                                </span>
                              )}
                              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                                {req.status === 'ACCEPTED' && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenAcceptedRequestChat(e, req)}
                                    style={{
                                      flex: 1,
                                      border: 'none',
                                      borderRadius: '0.45rem',
                                      padding: '0.45rem',
                                      backgroundColor: '#2563eb',
                                      color: '#ffffff',
                                      fontWeight: 800,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Open Chat
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => openRequestReport(e, req)}
                                  style={{
                                    flex: req.status === 'ACCEPTED' ? 1 : 'unset',
                                    border: '1px solid #fecaca',
                                    borderRadius: '0.45rem',
                                    padding: '0.45rem 0.7rem',
                                    backgroundColor: '#ffffff',
                                    color: '#dc2626',
                                    fontWeight: 800,
                                    cursor: 'pointer'
                                  }}
                                >
                                  Report
                                </button>
                              </div>
                            </div>
                          ))}

                        {conversations.filter(c => c && typeof c === 'object').map((conv) => {
                          const cid = conv.conversation_id || conv.id;
                          const hasUnread = (conv.unread_count || 0) > 0;
                          return (
                            <div
                              key={cid}
                              onClick={() => handleOpenChat(conv)}
                              style={{
                                padding: '0.85rem 1rem',
                                borderBottom: hasUnread ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                                backgroundColor: hasUnread ? '#eff6ff' : '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.3rem',
                                position: 'relative',
                                transition: 'background-color 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = hasUnread ? '#eff6ff' : '#ffffff'}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{ minWidth: 0 }}>
                                  <span style={{ fontSize: '0.72rem', color: hasUnread ? '#dc2626' : '#2563eb', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
                                    Chat Conversation
                                  </span>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', display: 'block', marginTop: '0.1rem', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {getConversationTitle(conv)}
                                  </span>
                                </div>
                                {hasUnread && (
                                  <span style={{
                                    backgroundColor: '#ef4444',
                                    borderRadius: '50%',
                                    width: '10px',
                                    height: '10px',
                                    flexShrink: 0,
                                    marginTop: '0.25rem',
                                    boxShadow: '0 0 0 3px #fee2e2'
                                  }} />
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                                Participant: {getConversationParticipant(conv)}
                              </span>
                              {hasUnread && (
                                <span style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 900 }}>
                                  New message
                                </span>
                              )}
                              <span style={{
                                fontSize: '0.75rem',
                                color: hasUnread ? '#1e3a8a' : '#94a3b8',
                                fontWeight: hasUnread ? 700 : 500,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {getLastMessageText(conv)}
                              </span>
                            </div>
                          );
                        })}
                      </>
                      )}
                  </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Notifications Icon dropdown trigger */}
          {user && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowChats(false); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#475569',
                  position: 'relative',
                  padding: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                title="Notifications"
              >
                <Bell size={22} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #ffffff'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '40px',
                  width: '320px',
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15)',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '400px'
                }}>
                  {/* Dropdown Header */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid #e2e8f0',
                    backgroundColor: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                      Notifications ({unreadCount} unread)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={fetchNotifs}
                        disabled={loadingNotifs}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', padding: '0.2rem' }}
                        title="Refresh notifications"
                      >
                        <RefreshCw size={14} style={{ animation: loadingNotifs ? 'spin 1s linear infinite' : 'none' }} />
                      </button>
                      {notifications.length > 0 && (
                        <button
                          onClick={handleClearAllNotifs}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          Clear All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dropdown List */}
                  <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                        No notifications logs found.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.is_read) {
                              handleMarkAsRead(notif.id);
                            }
                          }}
                          style={{
                            padding: '0.85rem 1rem',
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: notif.is_read ? '#ffffff' : '#eff6ff',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            position: 'relative',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? '#ffffff' : '#eff6ff'}
                        >
                          {/* Unread indicator dot */}
                          {!notif.is_read && (
                            <span style={{
                              position: 'absolute',
                              left: '4px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: '#2563eb'
                            }} />
                          )}
                          <div style={{ flex: 1, textAlign: 'left', paddingLeft: '0.25rem' }}>
                            <p style={{
                              margin: 0,
                              fontSize: '0.8rem',
                              color: notif.is_read ? '#475569' : '#0f172a',
                              fontWeight: notif.is_read ? 500 : 700,
                              lineHeight: 1.35
                            }}>
                              {notif.message}
                            </p>
                            <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', display: 'inline-block' }}>
                              {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNotif(e, notif.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#94a3b8',
                              cursor: 'pointer',
                              padding: '0.2rem',
                              alignSelf: 'flex-start',
                              display: 'flex'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
                            title="Delete notification"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Capsule */}
          {user && (
            <div 
              onClick={handleOpenModal}
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
              title="Edit Profile"
              className="user-profile-trigger"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1.5px solid #2563eb'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }} className="user-text-wrapper">
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{user.name}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: user.role?.toLowerCase() === 'admin' ? '#ef4444' : user.role?.toLowerCase() === 'seller' ? '#10b981' : '#2563eb',
                  fontWeight: 700
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          )}

          {/* Logout Trigger */}
          <div style={{ position: 'relative' }}>
            {!showConfirmLogout ? (
              <button
                onClick={() => setShowConfirmLogout(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  color: '#ef4444',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#fef2f2';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <LogOut size={16} />
                <span className="logout-btn-text">Logout</span>
              </button>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                padding: '0.35rem 0.5rem',
                borderRadius: '0.5rem'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: 700, paddingRight: '0.25rem' }}>Logout?</span>
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '0.25rem',
                    padding: '0.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Confirm Logout"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    borderRadius: '0.25rem',
                    padding: '0.2rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* USER PROFILE MODAL */}
      {showProfileModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.75)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <span className="badge badge-approved" style={{ fontSize: '0.65rem' }}>Personal Settings</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#0f172a' }}>Update Profile</h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateProfile} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              
              {successMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#d1fae5',
                  border: '1px solid #10b981',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  color: '#065f46',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}>
                  <Check size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fca5a5',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  lineHeight: 1.4
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone / Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password (leave blank to keep unchanged)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Footer Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                marginTop: '1rem',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '1.25rem'
              }}>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '42px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: 2, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving changes...
                    </>
                  ) : (
                    'Save Profile'
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* CUSTOM CONFIRMATION MODAL OVERLAY */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.7)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                {confirmModal.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#475569', marginTop: '0.5rem', lineHeight: 1.5, marginBlockEnd: 0 }}>
                {confirmModal.message}
              </p>
            </div>
            <div style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', height: '36px' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="btn btn-primary"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444',
                  height: '36px'
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showChatReportModal && (activeChat || reportContext) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(11, 15, 25, 0.7)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <form
            onSubmit={handleSubmitChatReport}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '430px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{reportContext ? 'Report Request' : 'Report Chat'}</h4>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.35rem 0 0' }}>
                  Admin will review this {reportContext ? 'request' : 'chat'} and the latest context.
                </p>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
                Issue Type
                <select
                  className="form-control"
                  value={chatReportType}
                  onChange={(e) => setChatReportType(e.target.value)}
                >
                  <option value="chat_abuse">Abusive or inappropriate messages</option>
                  <option value="fraud_attempt">Fraud or payment request outside platform</option>
                  <option value="spam">Spam or repeated unwanted messages</option>
                  <option value="seller_buyer_dispute">Seller / buyer dispute</option>
                  <option value="other">Other issue</option>
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
                Details
                <textarea
                  className="form-control"
                  rows={4}
                  value={chatReportReason}
                  onChange={(e) => setChatReportReason(e.target.value)}
                  placeholder="Describe what happened..."
                  required
                />
              </label>
            </div>

            <div style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              <button
                type="button"
                onClick={() => {
                  setShowChatReportModal(false);
                  setReportContext(null);
                  setChatReportReason('');
                }}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.8rem', height: '36px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingChatReport}
                className="btn btn-primary"
                style={{
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444',
                  height: '36px'
                }}
              >
                {submittingChatReport ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}
      {/* PURCHASE REQUEST DETAIL WINDOW */}
      {false && activeRequest && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: 'min(620px, calc(100vw - 2rem))',
          maxHeight: 'min(640px, calc(100vh - 120px))',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0f172a', color: '#ffffff', gap: '1rem' }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.65rem', color: '#93c5fd', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
                Purchase Request
              </span>
              <strong style={{ fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                {activeRequest.listing_name || 'Listing'}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => {
                  setReportContext({
                    product_id: activeRequest.product_id,
                    reported_user_id: user?.role?.toLowerCase() === 'buyer' ? activeRequest.seller_id : activeRequest.buyer_id,
                    evidence: [
                      `Request status: ${activeRequest.status}`,
                      `Buyer message: ${activeRequest.buyer_message || ''}`,
                      `Seller response: ${activeRequest.seller_response_message || ''}`
                    ]
                  });
                  setChatReportType(String(activeRequest.status).toUpperCase() === 'REJECTED' ? 'seller_buyer_dispute' : 'other');
                  setShowChatReportModal(true);
                }}
                style={{
                  border: '1px solid rgba(248, 113, 113, 0.45)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#fecaca',
                  borderRadius: '0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}
              >
                <AlertCircle size={13} />
                Report
              </button>
              <button
                onClick={() => setActiveRequest(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: '#f8fafc' }}>
            <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.8rem', color: '#475569' }}>
              <div><strong style={{ color: '#0f172a' }}>Buyer:</strong> {activeRequest.buyer_name || 'Buyer'}</div>
              <div><strong style={{ color: '#0f172a' }}>Winning bid:</strong> ₹{activeRequest.winning_bid_amount}</div>
              <div><strong style={{ color: '#0f172a' }}>Status:</strong> {activeRequest.status}</div>
              <div><strong style={{ color: '#0f172a' }}>Created:</strong> {formatChatDateTime(activeRequest.created_at) || 'Just now'}</div>
            </div>

            <div style={{ alignSelf: user?.role?.toLowerCase() === 'buyer' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.85rem', borderBottomRightRadius: user?.role?.toLowerCase() === 'buyer' ? 0 : '0.85rem', borderBottomLeftRadius: user?.role?.toLowerCase() === 'buyer' ? '0.85rem' : 0, backgroundColor: user?.role?.toLowerCase() === 'buyer' ? '#2563eb' : '#ffffff', color: user?.role?.toLowerCase() === 'buyer' ? '#ffffff' : '#0f172a', border: user?.role?.toLowerCase() === 'buyer' ? 'none' : '1px solid #e2e8f0', lineHeight: 1.45, fontSize: '0.85rem' }}>
                {activeRequest.buyer_message}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block', textAlign: user?.role?.toLowerCase() === 'buyer' ? 'right' : 'left' }}>
                {formatChatDateTime(activeRequest.created_at)}
              </span>
            </div>

            {activeRequest.seller_response_message && (
              <div style={{ alignSelf: user?.role?.toLowerCase() === 'buyer' ? 'flex-start' : 'flex-end', maxWidth: '82%' }}>
                <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.85rem', borderBottomRightRadius: user?.role?.toLowerCase() === 'buyer' ? '0.85rem' : 0, borderBottomLeftRadius: user?.role?.toLowerCase() === 'buyer' ? 0 : '0.85rem', backgroundColor: user?.role?.toLowerCase() === 'buyer' ? '#ffffff' : '#2563eb', color: user?.role?.toLowerCase() === 'buyer' ? '#0f172a' : '#ffffff', border: user?.role?.toLowerCase() === 'buyer' ? '1px solid #e2e8f0' : 'none', lineHeight: 1.45, fontSize: '0.85rem' }}>
                  {activeRequest.seller_response_message}
                </div>
                <span style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block', textAlign: user?.role?.toLowerCase() === 'buyer' ? 'left' : 'right' }}>
                  {formatChatDateTime(activeRequest.responded_at || activeRequest.updated_at)}
                </span>
              </div>
            )}
          </div>

          {String(activeRequest.status || '').toUpperCase() === 'REJECTED' ? (
            <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #fecaca', backgroundColor: '#fef2f2', color: '#b91c1c', fontWeight: 800, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Lock size={16} />
              {user?.role?.toLowerCase() === 'buyer'
                ? 'Conversation is closed because the seller rejected this request.'
                : 'You rejected this request. Conversation is closed.'}
            </div>
          ) : (
            <div style={{ padding: '0.85rem 1rem', borderTop: '1px solid #fde68a', backgroundColor: '#fffbeb', color: '#92400e', fontWeight: 800, fontSize: '0.85rem' }}>
              Chat will open once the seller accepts this request.
            </div>
          )}
        </div>
      )}
      {/* FLOATING CHAT WINDOW CONTAINER */}
      {false && activeChat && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: 'min(620px, calc(100vw - 2rem))',
          height: 'min(640px, calc(100vh - 120px))',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{
            padding: '0.95rem 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#0f172a',
            color: '#ffffff'
          }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#93c5fd', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
                Chat Conversation
              </span>
              <strong style={{ fontSize: '0.95rem' }}>
                {getConversationTitle(activeChat)}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                onClick={() => setShowChatReportModal(true)}
                style={{
                  border: '1px solid rgba(248, 113, 113, 0.45)',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#fecaca',
                  borderRadius: '0.45rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.45rem',
                  fontSize: '0.7rem',
                  fontWeight: 800
                }}
                title="Report this chat"
              >
                <AlertCircle size={13} />
                Report
              </button>
              <button
                onClick={() => setActiveChat(null)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages list */}
          <div style={{
            flex: 1,
            padding: '1rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.8rem', color: '#475569' }}>
              <div><strong style={{ color: '#0f172a' }}>Listing:</strong> {getConversationTitle(activeChat)}</div>
              <div><strong style={{ color: '#0f172a' }}>Participant:</strong> {getConversationParticipant(activeChat)}</div>
              <div><strong style={{ color: '#0f172a' }}>Status:</strong> OPEN</div>
              <div><strong style={{ color: '#0f172a' }}>Updated:</strong> {formatChatDateTime(activeChat.updated_at || activeChat.created_at) || 'Just now'}</div>
            </div>
            {loadingMessages ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
              </div>
            ) : (!Array.isArray(messages) || messages.length === 0) ? (
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.8rem', padding: '2rem 1rem' }}>
                No messages yet. Send a message to start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = user && msg && (msg.sender_id === user.user_id || msg.sender_id === user.id);
                return (
                  <div 
                    key={msg?.id || index}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '0.75rem',
                      borderBottomRightRadius: isMe ? 0 : '0.75rem',
                      borderBottomLeftRadius: isMe ? '0.75rem' : 0,
                      backgroundColor: isMe ? '#2563eb' : '#ffffff',
                      color: isMe ? '#ffffff' : '#0f172a',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      border: isMe ? 'none' : '1px solid #e2e8f0',
                      wordBreak: 'break-word',
                      textAlign: 'left'
                    }}>
                      {msg?.message || ''}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>
                        {formatChatDateTime(msg?.created_at)}
                      </span>
                      {isMe && (
                        <span
                          title={msg?.is_read ? 'Read' : 'Sent'}
                          style={{
                            color: msg?.is_read ? '#2563eb' : '#94a3b8',
                            fontWeight: 900,
                            letterSpacing: '-0.08em'
                          }}
                        >
                          ✓✓
                        </span>
                      )}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form input bar */}
          <form 
            onSubmit={handleSendMessage}
            style={{
              padding: '0.75rem',
              borderTop: '1px solid #cbd5e1',
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: '#ffffff'
            }}
          >
            <input 
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '0.5rem 0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '9999px',
                fontSize: '0.85rem',
                outline: 'none',
                backgroundColor: '#f8fafc'
              }}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: newMessage.trim() ? '#2563eb' : '#eff6ff',
                color: newMessage.trim() ? '#ffffff' : '#94a3b8',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: newMessage.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Topbar;
