import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User, Check, X, Phone, Lock, Mail, AlertCircle, Loader2, Bell, Trash2, CheckCircle2, RefreshCw, MessageSquare, Send, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Notifications states
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // Chat feature states
  const [showChats, setShowChats] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [respondingRequestId, setRespondingRequestId] = useState('');
  const [showChatReportModal, setShowChatReportModal] = useState(false);
  const [chatReportType, setChatReportType] = useState('chat_abuse');
  const [chatReportReason, setChatReportReason] = useState('');
  const [submittingChatReport, setSubmittingChatReport] = useState(false);
  const [reportContext, setReportContext] = useState(null);

  const queryClient = useQueryClient();

  // Notifications query
  const { data: notificationsData = [], isFetching: loadingNotifs } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications,
    enabled: !!user
  });
  const notifications = Array.isArray(notificationsData) ? notificationsData : [];

  // Conversations query
  const { data: conversationsData = [], isLoading: loadingConversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    enabled: !!user && ['buyer', 'seller', 'dealer'].includes(user.role?.toLowerCase())
  });
  const conversations = Array.isArray(conversationsData) 
    ? conversationsData 
    : (conversationsData?.conversations || conversationsData?.data || []);

  // Chat Requests query
  const { data: chatRequestsData = [], isLoading: loadingChatRequests } = useQuery({
    queryKey: ['chatRequests', user?.role],
    queryFn: () => user.role?.toLowerCase() === 'buyer' ? getBuyerChatRequests() : getSellerChatRequests(),
    enabled: !!user && ['buyer', 'seller', 'dealer'].includes(user.role?.toLowerCase())
  });
  const chatRequests = Array.isArray(chatRequestsData)
    ? chatRequestsData
    : (chatRequestsData?.requests || chatRequestsData?.data || []);

  const loadingChats = loadingConversations || loadingChatRequests;

  // Active Chat Messages query
  const activeChatId = activeChat ? (activeChat.conversation_id || activeChat.id) : null;
  const { data: messagesData = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', activeChatId],
    queryFn: () => getMessages(activeChatId),
    enabled: !!activeChatId
  });
  const messages = Array.isArray(messagesData) ? messagesData : (messagesData?.messages || messagesData?.data || []);

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

  // Mutation operations
  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification marked as read');
    },
    onError: (err) => {
      console.error('Failed to mark notification read:', err);
      toast.error('Failed to mark notification as read');
    }
  });

  const deleteNotifMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification cleared successfully');
    },
    onError: (err) => {
      console.error('Failed to delete notification:', err);
      toast.error('Failed to delete notification.');
    }
  });

  const clearAllNotifsMutation = useMutation({
    mutationFn: clearAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications cleared');
    },
    onError: (err) => {
      console.error('Failed to clear notifications:', err);
      toast.error('Failed to clear notifications.');
    }
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, action }) => respondToChatRequest(requestId, action),
    onSuccess: async (result, variables) => {
      toast.success(variables.action === 'accept' ? 'Request accepted. Chat is now open.' : 'Request rejected. Buyer has been notified.');
      queryClient.invalidateQueries({ queryKey: ['chatRequests'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      if (variables.action === 'accept') {
        const chatId = result?.conversation_id || result?.conversation?.conversation_id;
        if (chatId) {
          const data = await queryClient.fetchQuery({
            queryKey: ['conversations'],
            queryFn: getConversations
          });
          const list = Array.isArray(data) ? data : (data?.conversations || data?.data || []);
          const found = list.find(c => (c.id || c.conversation_id) === chatId);
          if (found) {
            handleOpenChat(found);
          } else {
            localStorage.setItem('open_chat_id', chatId);
            window.dispatchEvent(new CustomEvent('dealskb:open-chat', { detail: { chatId } }));
          }
        }
      }
    },
    onError: (err) => {
      console.error("Failed to respond to request:", err);
      toast.error(err.response?.data?.detail || err.response?.data?.message || 'Failed to respond to request.');
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: ({ cid, text }) => sendMessage(cid, text),
    onSuccess: (sent, variables) => {
      queryClient.setQueryData(['messages', variables.cid], (prev) => {
        const list = Array.isArray(prev) ? prev : (prev?.messages || prev?.data || []);
        return [...list, {
          id: sent.id || 'm_' + Date.now(),
          sender_id: user.user_id || user.id,
          sender_name: user.name,
          message: variables.text,
          is_read: false,
          created_at: new Date().toISOString()
        }];
      });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.cid] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (err) => {
      console.error("Failed to send message:", err);
      toast.error("Failed to send message.");
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = (id) => {
    markReadMutation.mutate(id);
  };

  const handleDeleteNotif = (e, id) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      title: 'Clear Notification',
      message: 'Are you sure you want to clear this notification?',
      onConfirm: async () => {
        deleteNotifMutation.mutate(id);
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
        clearAllNotifsMutation.mutate();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const fetchNotifs = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const fetchChats = () => {
    queryClient.invalidateQueries({ queryKey: ['conversations'] });
    queryClient.invalidateQueries({ queryKey: ['chatRequests'] });
  };

  const handleRespondToRequest = (e, requestId, action) => {
    e.stopPropagation();
    respondMutation.mutate({ requestId, action });
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
    const cid = conv.conversation_id || conv.id;
    try {
      await markConversationRead(cid);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', cid] });
    } catch (err) {
      console.error("Failed to open conversation channel:", err);
    }
  };

  const openAcceptedRequestChat = async (req) => {
    const chatId = req?.conversation_id || req?.conversation?.conversation_id;
    if (!chatId) {
      toast.error('Chat opens once the seller accepts your request.');
      return;
    }
    try {
      const data = await queryClient.fetchQuery({
        queryKey: ['conversations'],
        queryFn: getConversations
      });
      const list = Array.isArray(data) ? data : (data?.conversations || data?.data || []);
      const found = list.find(c => (c.id || c.conversation_id) === chatId);
      if (found) {
        handleOpenChat(found);
      } else {
        localStorage.setItem('open_chat_id', chatId);
        window.dispatchEvent(new CustomEvent('dealskb:open-chat', { detail: { chatId } }));
      }
    } catch (err) {
      console.error("Failed to open accepted request chat:", err);
      toast.error("Failed to open chat.");
    }
  };

  const handleOpenAcceptedRequestChat = (e, req) => {
    e.stopPropagation();
    openAcceptedRequestChat(req);
  };

  const handleOpenRequest = (req) => {
    const status = String(req?.status || '').toUpperCase();
    if (status === 'ACCEPTED') {
      openAcceptedRequestChat(req);
      return;
    }
    setActiveChat(null);
    setActiveRequest(req);
    setShowChats(true);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    const cid = activeChat.conversation_id || activeChat.id;
    const text = newMessage.trim();
    setNewMessage('');
    sendMessageMutation.mutate({ cid, text });
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

  // External chat triggering without polling.
  useEffect(() => {
    const checkExternalChatOpen = async (event) => {
      const openRequestId = event?.detail?.requestId || localStorage.getItem('open_chat_request_id');
      if (openRequestId) {
        localStorage.removeItem('open_chat_request_id');
        try {
          const requestsData = await queryClient.fetchQuery({
            queryKey: ['chatRequests', user?.role],
            queryFn: () => user.role?.toLowerCase() === 'buyer' ? getBuyerChatRequests() : getSellerChatRequests()
          });
          const requestsList = Array.isArray(requestsData) ? requestsData : (requestsData?.requests || requestsData?.data || []);
          const foundRequest = requestsList.find((request) => request?.request_id === openRequestId);
          if (foundRequest) {
            setActiveChat(null);
            setActiveRequest(foundRequest);
            setShowChats(true);
            return;
          }
        } catch (err) {
          console.error('Failed to auto-open chat request:', err);
        }
      }

      const openChatId = event?.detail?.chatId || localStorage.getItem('open_chat_id');
      if (openChatId) {
        localStorage.removeItem('open_chat_id');
        try {
          const data = await queryClient.fetchQuery({
            queryKey: ['conversations'],
            queryFn: getConversations
          });
          const list = Array.isArray(data) ? data : (data?.conversations || data?.data || []);
          const found = list.find(c => (c.id || c.conversation_id) === openChatId);
          if (found) {
            setActiveRequest(null);
            setActiveChat(found);
            setShowChats(true);
            await markConversationRead(openChatId);
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['messages', openChatId] });
          }
        } catch (err) {
          console.error("Failed to auto-open conversation:", err);
        }
      }
    };

    checkExternalChatOpen();
    const handleStorage = (event) => {
      if (event.key === 'open_chat_id') {
        checkExternalChatOpen({ detail: { chatId: event.newValue } });
      }
      if (event.key === 'open_chat_request_id') {
        checkExternalChatOpen({ detail: { requestId: event.newValue } });
      }
    };
    window.addEventListener('dealskb:open-chat', checkExternalChatOpen);
    window.addEventListener('dealskb:open-chat-request', checkExternalChatOpen);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('dealskb:open-chat', checkExternalChatOpen);
      window.removeEventListener('dealskb:open-chat-request', checkExternalChatOpen);
      window.removeEventListener('storage', handleStorage);
    };
  }, [queryClient, user?.role]);

  const unreadChatsCount = Array.isArray(conversations) ? conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) : 0;
  const pendingRequestCount = Array.isArray(chatRequests)
    ? chatRequests.filter(r => r.status === 'PENDING' && user?.role?.toLowerCase() !== 'buyer').length
    : 0;
  const chatBadgeCount = unreadChatsCount + pendingRequestCount;

  const formatChatDateTime = (value) => {
    if (!value) return '';
    try {
      let d = new Date(value);
      if (isNaN(d.getTime())) return '';

      // Auto-detect double timezone conversion
      const now = new Date();
      if (d.getTime() > now.getTime() + 60000) {
        // Strip timezone designator to force parsing as local time
        const cleanValue = String(value).replace('Z', '').replace(/\+\d{2}:\d{2}$/, '').replace(/-\d{2}:\d{2}$/, '');
        const localDate = new Date(cleanValue);
        if (!isNaN(localDate.getTime())) {
          d = localDate;
        }
      }

      return d.toLocaleString([], {
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
      <header className="dashboard-topbar" style={{
        height: '70px',
        backgroundColor: '#FAF6EA',
        borderBottom: '1px solid #D8CFC1',
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
              color: '#8B8278',
              display: 'none', // Hidden on desktop
            }}
            className="mobile-toggle"
          >
            <Menu size={24} />
          </button>
          <h2 className="dashboard-topbar-title" style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#1F1A1D' }}>
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
                  color: '#8B8278',
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
                  backgroundColor: '#FAF6EA',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15)',
                  border: '1px solid #D8CFC1',
                  overflow: 'hidden',
                  zIndex: 9000,
                  display: 'flex',
                  flexDirection: 'column',
                  height: 'calc(100vh - 110px)',
                  maxHeight: '680px'
                }}>
                  {activeRequest && (
                    <>
                      <div style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F1A1D', color: '#ffffff', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                          <button
                            type="button"
                            onClick={() => setActiveRequest(null)}
                            style={{ background: 'none', border: 'none', color: '#D8CFC1', cursor: 'pointer', display: 'flex', padding: '0.15rem' }}
                            title="Back to chats"
                          >
                            <ArrowLeft size={20} />
                          </button>
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '0.65rem', color: '#D8CFC1', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
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
                            style={{ background: 'none', border: 'none', color: '#8B8278', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: '#FAF6EA' }}>
                        <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #D8CFC1', backgroundColor: '#FAF6EA', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.8rem', color: '#8B8278' }}>
                          <div><strong style={{ color: '#1F1A1D' }}>Buyer:</strong> {activeRequest.buyer_name || 'Buyer'}</div>
                          <div><strong style={{ color: '#1F1A1D' }}>Winning bid:</strong> â‚¹{activeRequest.winning_bid_amount}</div>
                          <div><strong style={{ color: '#1F1A1D' }}>Status:</strong> {activeRequest.status}</div>
                          <div><strong style={{ color: '#1F1A1D' }}>Created:</strong> {formatChatDateTime(activeRequest.created_at) || 'Just now'}</div>
                        </div>

                        <div style={{ alignSelf: user?.role?.toLowerCase() === 'buyer' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
                          <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.85rem', borderBottomRightRadius: user?.role?.toLowerCase() === 'buyer' ? 0 : '0.85rem', borderBottomLeftRadius: user?.role?.toLowerCase() === 'buyer' ? '0.85rem' : 0, backgroundColor: user?.role?.toLowerCase() === 'buyer' ? '#6B1B71' : '#ffffff', color: user?.role?.toLowerCase() === 'buyer' ? '#ffffff' : '#1F1A1D', border: user?.role?.toLowerCase() === 'buyer' ? 'none' : '1px solid #D8CFC1', lineHeight: 1.45, fontSize: '0.85rem' }}>
                            {activeRequest.buyer_message}
                          </div>
                          <span style={{ fontSize: '0.65rem', color: '#8B8278', marginTop: '0.25rem', display: 'block', textAlign: user?.role?.toLowerCase() === 'buyer' ? 'right' : 'left' }}>
                            {formatChatDateTime(activeRequest.created_at)}
                          </span>
                        </div>

                        {activeRequest.seller_response_message && (
                          <div style={{ alignSelf: user?.role?.toLowerCase() === 'buyer' ? 'flex-start' : 'flex-end', maxWidth: '82%' }}>
                            <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.85rem', borderBottomRightRadius: user?.role?.toLowerCase() === 'buyer' ? '0.85rem' : 0, borderBottomLeftRadius: user?.role?.toLowerCase() === 'buyer' ? 0 : '0.85rem', backgroundColor: user?.role?.toLowerCase() === 'buyer' ? '#ffffff' : '#6B1B71', color: user?.role?.toLowerCase() === 'buyer' ? '#1F1A1D' : '#ffffff', border: user?.role?.toLowerCase() === 'buyer' ? '1px solid #D8CFC1' : 'none', lineHeight: 1.45, fontSize: '0.85rem' }}>
                              {activeRequest.seller_response_message}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: '#8B8278', marginTop: '0.25rem', display: 'block', textAlign: user?.role?.toLowerCase() === 'buyer' ? 'left' : 'right' }}>
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
                      <div style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F1A1D', color: '#ffffff', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                          <button
                            type="button"
                            onClick={() => setActiveChat(null)}
                            style={{ background: 'none', border: 'none', color: '#D8CFC1', cursor: 'pointer', display: 'flex', padding: '0.15rem' }}
                            title="Back to chats"
                          >
                            <ArrowLeft size={20} />
                          </button>
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: '0.65rem', color: '#D8CFC1', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
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
                            style={{ background: 'none', border: 'none', color: '#8B8278', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>

                      <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: '#FAF6EA' }}>
                        <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #D8CFC1', backgroundColor: '#FAF6EA', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.8rem', color: '#8B8278' }}>
                          <div><strong style={{ color: '#1F1A1D' }}>Listing:</strong> {getConversationTitle(activeChat)}</div>
                          <div><strong style={{ color: '#1F1A1D' }}>Participant:</strong> {getConversationParticipant(activeChat)}</div>
                          <div><strong style={{ color: '#1F1A1D' }}>Status:</strong> OPEN</div>
                          <div><strong style={{ color: '#1F1A1D' }}>Updated:</strong> {formatChatDateTime(activeChat.updated_at || activeChat.created_at) || 'Just now'}</div>
                        </div>
                        {loadingMessages ? (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#6B1B71' }} />
                          </div>
                        ) : (!Array.isArray(messages) || messages.length === 0) ? (
                          <div style={{ textAlign: 'center', color: '#8B8278', fontSize: '0.8rem', padding: '2rem 1rem' }}>
                            No messages yet. Send a message to start the conversation!
                          </div>
                        ) : (
                          messages.map((msg, index) => {
                            const isMe = user && msg && (msg.sender_id === user.user_id || msg.sender_id === user.id);
                            return (
                              <div key={msg?.id || index} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                <div style={{ padding: '0.65rem 0.85rem', borderRadius: '0.75rem', borderBottomRightRadius: isMe ? 0 : '0.75rem', borderBottomLeftRadius: isMe ? '0.75rem' : 0, backgroundColor: isMe ? '#6B1B71' : '#ffffff', color: isMe ? '#ffffff' : '#1F1A1D', fontSize: '0.85rem', fontWeight: 500, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)', border: isMe ? 'none' : '1px solid #D8CFC1', wordBreak: 'break-word', textAlign: 'left' }}>
                                  {msg?.message || ''}
                                </div>
                                <span style={{ fontSize: '0.6rem', color: '#8B8278', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                  <span>{formatChatDateTime(msg?.created_at)}</span>
                                  {isMe && <span title={msg?.is_read ? 'Read' : 'Sent'} style={{ color: msg?.is_read ? '#6B1B71' : '#8B8278', fontWeight: 900, letterSpacing: '-0.08em' }}>{"\u2713\u2713"}</span>}
                                </span>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      <form onSubmit={handleSendMessage} style={{ padding: '0.75rem', borderTop: '1px solid #cbd5e1', display: 'flex', gap: '0.5rem', backgroundColor: '#FAF6EA' }}>
                        <input type="text" placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} style={{ flex: 1, padding: '0.5rem 0.85rem', border: '1px solid #cbd5e1', borderRadius: '9999px', fontSize: '0.85rem', outline: 'none', backgroundColor: '#FAF6EA' }} />
                        <input type="submit" style={{ display: 'none' }} />
                        <button type="button" onClick={handleSendMessage} disabled={!newMessage.trim()} style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: newMessage.trim() ? '#6B1B71' : '#F5ECDD', color: newMessage.trim() ? '#ffffff' : '#8B8278', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newMessage.trim() ? 'pointer' : 'default', transition: 'all 0.15s ease', padding: 0 }}>
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
                    borderBottom: '1px solid #D8CFC1',
                    backgroundColor: '#FAF6EA',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <span style={{ fontSize: '1rem', fontWeight: 900, color: '#1F1A1D', display: 'block' }}>
                        Chats & Conversations
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#8B8278', fontWeight: 700 }}>
                        Purchase requests and active chats
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={fetchChats}
                        disabled={loadingChats}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278', display: 'flex', padding: '0.35rem' }}
                        title="Refresh chats"
                      >
                        <RefreshCw size={16} style={{ animation: loadingChats ? 'spin 1s linear infinite' : 'none' }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowChats(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278', display: 'flex', padding: '0.35rem' }}
                        title="Close chats"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Chat List */}
                  <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {(!Array.isArray(conversations) || conversations.length === 0) && (!Array.isArray(chatRequests) || chatRequests.length === 0) ? (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#8B8278', fontSize: '0.85rem' }}>
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
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1F1A1D', display: 'block', marginTop: '0.15rem', textDecoration: 'underline' }}>{req.listing_name}</span>
                                  </div>
                                  <span style={{ fontSize: '0.65rem', color: statusColor, fontWeight: 900, border: `1px solid ${borderColor}`, borderRadius: '999px', padding: '0.15rem 0.45rem', flexShrink: 0 }}>
                                    {status || 'PENDING'}
                                  </span>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>
                                  Buyer: {req.buyer_name} | Bid: â‚¹{req.winning_bid_amount}
                                </span>
                                <span style={{
                                  fontSize: '0.75rem',
                                  color: '#4a1a50',
                                  lineHeight: 1.45,
                                  display: 'block',
                                  whiteSpace: 'normal'
                                }}>
                                  {req.buyer_message}
                                </span>
                                {req.seller_response_message && (
                                  <span style={{
                                    fontSize: '0.75rem',
                                    color: '#8B8278',
                                    lineHeight: 1.45,
                                    display: 'block',
                                    whiteSpace: 'normal'
                                  }}>
                                    {req.seller_response_message}
                                  </span>
                                )}
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                                          backgroundColor: '#FAF6EA',
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
                                        backgroundColor: '#6B1B71',
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
                                      backgroundColor: '#FAF6EA',
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
                              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1F1A1D', textDecoration: 'underline' }}>{req.listing_name}</span>
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
                                  color: '#8B8278',
                                  lineHeight: 1.35,
                                  display: 'block',
                                  whiteSpace: 'normal'
                                }}>
                                  {req.seller_response_message}
                                </span>
                              )}
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '0.1rem' }}>
                                {req.status === 'ACCEPTED' && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleOpenAcceptedRequestChat(e, req)}
                                    style={{
                                      flex: 1,
                                      border: 'none',
                                      borderRadius: '0.45rem',
                                      padding: '0.45rem',
                                      backgroundColor: '#6B1B71',
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
                                    backgroundColor: '#FAF6EA',
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
                                borderBottom: hasUnread ? '1px solid #D8CFC1' : '1px solid #f1f5f9',
                                backgroundColor: hasUnread ? '#F5ECDD' : '#ffffff',
                                cursor: 'pointer',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.3rem',
                                position: 'relative',
                                transition: 'background-color 0.15s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF6EA'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = hasUnread ? '#F5ECDD' : '#ffffff'}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                                <div style={{ minWidth: 0 }}>
                                  <span style={{ fontSize: '0.72rem', color: hasUnread ? '#dc2626' : '#6B1B71', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
                                    Chat Conversation
                                  </span>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#1F1A1D', display: 'block', marginTop: '0.1rem', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                              <span style={{ fontSize: '0.75rem', color: '#8B8278', fontWeight: 600 }}>
                                Participant: {getConversationParticipant(conv)}
                              </span>
                              {hasUnread && (
                                <span style={{ fontSize: '0.68rem', color: '#dc2626', fontWeight: 900 }}>
                                  New message
                                </span>
                              )}
                              <span style={{
                                fontSize: '0.75rem',
                                color: hasUnread ? '#1e3a8a' : '#8B8278',
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
                  color: '#8B8278',
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
                    top: '-5px',
                    right: '-7px',
                    minWidth: '22px',
                    height: '22px',
                    padding: '0 0.38rem',
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ef4444 55%, #b91c1c 100%)',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    borderRadius: '999px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #fffaf2',
                    boxShadow: '0 8px 18px rgba(239, 68, 68, 0.28)',
                    letterSpacing: '0'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
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
                  backgroundColor: '#FAF6EA',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.15)',
                  border: '1px solid #D8CFC1',
                  overflow: 'hidden',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: '400px'
                }}>
                  {/* Dropdown Header */}
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderBottom: '1px solid #D8CFC1',
                    backgroundColor: '#FAF6EA',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1F1A1D' }}>
                      Notifications ({unreadCount} unread)
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        onClick={fetchNotifs}
                        disabled={loadingNotifs}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278', display: 'flex', padding: '0.2rem' }}
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
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#8B8278', fontSize: '0.8rem' }}>
                        No notifications logs found.
                      </div>
                    ) : (
                      notifications.map((notif, idx) => (
                        <div
                          key={notif.notif_id || idx}
                          onClick={() => {
                            setSelectedNotification(notif);
                            if (!notif.is_read) {
                              handleMarkAsRead(notif.notif_id);
                            }
                          }}
                          style={{
                            padding: '0.85rem 1rem',
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: notif.is_read ? '#ffffff' : '#F5ECDD',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: '0.75rem',
                            position: 'relative',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FAF6EA'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? '#ffffff' : '#F5ECDD'}
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
                              backgroundColor: '#6B1B71'
                            }} />
                          )}
                          <div style={{ flex: 1, textAlign: 'left', paddingLeft: '0.25rem' }}>
                            <p style={{
                              margin: 0,
                              fontSize: '0.8rem',
                              color: notif.is_read ? '#8B8278' : '#1F1A1D',
                              fontWeight: notif.is_read ? 500 : 700,
                              lineHeight: 1.35
                            }}>
                              {notif.message}
                            </p>
                            <span style={{ fontSize: '0.65rem', color: '#8B8278', marginTop: '0.25rem', display: 'inline-block' }}>
                              {notif.created_at ? new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteNotif(e, notif.notif_id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#8B8278',
                              cursor: 'pointer',
                              padding: '0.2rem',
                              alignSelf: 'flex-start',
                              display: 'flex'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = '#8B8278'}
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
                backgroundColor: '#F5ECDD',
                color: '#6B1B71',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                border: '1.5px solid #6B1B71'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }} className="user-text-wrapper">
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1F1A1D' }}>{user.name}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  color: user.role?.toLowerCase() === 'admin' ? '#ef4444' : user.role?.toLowerCase() === 'seller' ? '#10b981' : '#6B1B71',
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
                  border: '1px solid #D8CFC1',
                  backgroundColor: '#FAF6EA',
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
                  e.currentTarget.style.borderColor = '#D8CFC1';
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
                    backgroundColor: '#FAF6EA',
                    color: '#8B8278',
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
            backgroundColor: '#FAF6EA',
            borderRadius: '1.25rem',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid #D8CFC1',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF6EA'
            }}>
              <div>
                <span className="badge badge-approved" style={{ fontSize: '0.62rem', padding: '0.15rem 0.45rem' }}>Personal Settings</span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.15rem 0 0 0', color: '#1F1A1D' }}>Update Profile</h3>
              </div>
              <button 
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateProfile} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              
              {successMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: '#d1fae5',
                  border: '1px solid #10b981',
                  padding: '0.6rem 0.75rem',
                  borderRadius: '0.5rem',
                  color: '#065f46',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  <Check size={14} />
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
                  padding: '0.6rem 0.75rem',
                  borderRadius: '0.5rem',
                  color: '#b91c1c',
                  fontSize: '0.8rem',
                  lineHeight: 1.4
                }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Name */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem', fontWeight: 700 }}>Full Name *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: '2.3rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.82rem', height: '36px' }}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem', fontWeight: 700 }}>Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '2.3rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.82rem', height: '36px' }}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem', fontWeight: 700 }}>Phone / Mobile Number</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={{ paddingLeft: '2.3rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.82rem', height: '36px' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem', fontWeight: 700 }}>New Password (leave blank to keep unchanged)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ paddingLeft: '2.3rem', paddingRight: '2.3rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.82rem', height: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278', padding: 0, display: 'flex', alignItems: 'center' }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.2rem', fontWeight: 700 }}>Confirm New Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#8B8278' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ paddingLeft: '2.3rem', paddingRight: '2.3rem', paddingTop: '0.45rem', paddingBottom: '0.45rem', fontSize: '0.82rem', height: '36px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278', padding: 0, display: 'flex', alignItems: 'center' }}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Footer Buttons */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                marginTop: '0.75rem',
                borderTop: '1px solid #D8CFC1',
                paddingTop: '1rem'
              }}>
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="btn btn-secondary"
                  style={{ flex: 1, height: '36px', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ flex: 2, height: '36px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Saving...
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
            backgroundColor: '#FAF6EA',
            borderRadius: '1rem',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
            border: '1px solid #D8CFC1',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '1.25rem 1.5rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1F1A1D' }}>
                {confirmModal.title}
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#8B8278', marginTop: '0.5rem', lineHeight: 1.5, marginBlockEnd: 0 }}>
                {confirmModal.message}
              </p>
            </div>
            <div style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: '#FAF6EA',
              borderTop: '1px solid #D8CFC1',
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
              backgroundColor: '#FAF6EA',
              borderRadius: '1rem',
              width: '100%',
              maxWidth: '430px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
              border: '1px solid #D8CFC1',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#1F1A1D' }}>{reportContext ? 'Report Request' : 'Report Chat'}</h4>
                <p style={{ fontSize: '0.85rem', color: '#8B8278', margin: '0.35rem 0 0' }}>
                  Admin will review this {reportContext ? 'request' : 'chat'} and the latest context.
                </p>
              </div>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#4a1a50' }}>
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

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 800, color: '#4a1a50' }}>
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
              backgroundColor: '#FAF6EA',
              borderTop: '1px solid #D8CFC1',
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
          backgroundColor: '#FAF6EA',
          borderRadius: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <div style={{ padding: '0.95rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1F1A1D', color: '#ffffff', gap: '1rem' }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ fontSize: '0.65rem', color: '#D8CFC1', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
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
                style={{ background: 'none', border: 'none', color: '#8B8278', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8B8278'}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem', backgroundColor: '#FAF6EA' }}>
            <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #D8CFC1', backgroundColor: '#FAF6EA', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.8rem', color: '#8B8278' }}>
              <div><strong style={{ color: '#1F1A1D' }}>Buyer:</strong> {activeRequest.buyer_name || 'Buyer'}</div>
              <div><strong style={{ color: '#1F1A1D' }}>Winning bid:</strong> â‚¹{activeRequest.winning_bid_amount}</div>
              <div><strong style={{ color: '#1F1A1D' }}>Status:</strong> {activeRequest.status}</div>
              <div><strong style={{ color: '#1F1A1D' }}>Created:</strong> {formatChatDateTime(activeRequest.created_at) || 'Just now'}</div>
            </div>

            <div style={{ alignSelf: user?.role?.toLowerCase() === 'buyer' ? 'flex-end' : 'flex-start', maxWidth: '82%' }}>
              <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.85rem', borderBottomRightRadius: user?.role?.toLowerCase() === 'buyer' ? 0 : '0.85rem', borderBottomLeftRadius: user?.role?.toLowerCase() === 'buyer' ? '0.85rem' : 0, backgroundColor: user?.role?.toLowerCase() === 'buyer' ? '#6B1B71' : '#ffffff', color: user?.role?.toLowerCase() === 'buyer' ? '#ffffff' : '#1F1A1D', border: user?.role?.toLowerCase() === 'buyer' ? 'none' : '1px solid #D8CFC1', lineHeight: 1.45, fontSize: '0.85rem' }}>
                {activeRequest.buyer_message}
              </div>
              <span style={{ fontSize: '0.65rem', color: '#8B8278', marginTop: '0.25rem', display: 'block', textAlign: user?.role?.toLowerCase() === 'buyer' ? 'right' : 'left' }}>
                {formatChatDateTime(activeRequest.created_at)}
              </span>
            </div>

            {activeRequest.seller_response_message && (
              <div style={{ alignSelf: user?.role?.toLowerCase() === 'buyer' ? 'flex-start' : 'flex-end', maxWidth: '82%' }}>
                <div style={{ padding: '0.75rem 0.9rem', borderRadius: '0.85rem', borderBottomRightRadius: user?.role?.toLowerCase() === 'buyer' ? '0.85rem' : 0, borderBottomLeftRadius: user?.role?.toLowerCase() === 'buyer' ? 0 : '0.85rem', backgroundColor: user?.role?.toLowerCase() === 'buyer' ? '#ffffff' : '#6B1B71', color: user?.role?.toLowerCase() === 'buyer' ? '#1F1A1D' : '#ffffff', border: user?.role?.toLowerCase() === 'buyer' ? '1px solid #D8CFC1' : 'none', lineHeight: 1.45, fontSize: '0.85rem' }}>
                  {activeRequest.seller_response_message}
                </div>
                <span style={{ fontSize: '0.65rem', color: '#8B8278', marginTop: '0.25rem', display: 'block', textAlign: user?.role?.toLowerCase() === 'buyer' ? 'left' : 'right' }}>
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
          backgroundColor: '#FAF6EA',
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
            backgroundColor: '#1F1A1D',
            color: '#ffffff'
          }}>
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginRight: '1rem' }}>
              <span style={{ fontSize: '0.65rem', color: '#D8CFC1', fontWeight: 900, textTransform: 'uppercase', display: 'block' }}>
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
                style={{ background: 'none', border: 'none', color: '#8B8278', cursor: 'pointer', display: 'flex', padding: '0.2rem' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#8B8278'}
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
            backgroundColor: '#FAF6EA'
          }}>
            <div style={{ padding: '0.85rem 1rem', borderRadius: '0.75rem', border: '1px solid #D8CFC1', backgroundColor: '#FAF6EA', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '0.65rem', fontSize: '0.8rem', color: '#8B8278' }}>
              <div><strong style={{ color: '#1F1A1D' }}>Listing:</strong> {getConversationTitle(activeChat)}</div>
              <div><strong style={{ color: '#1F1A1D' }}>Participant:</strong> {getConversationParticipant(activeChat)}</div>
              <div><strong style={{ color: '#1F1A1D' }}>Status:</strong> OPEN</div>
              <div><strong style={{ color: '#1F1A1D' }}>Updated:</strong> {formatChatDateTime(activeChat.updated_at || activeChat.created_at) || 'Just now'}</div>
            </div>
            {loadingMessages ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: '#6B1B71' }} />
              </div>
            ) : (!Array.isArray(messages) || messages.length === 0) ? (
              <div style={{ textAlign: 'center', color: '#8B8278', fontSize: '0.8rem', padding: '2rem 1rem' }}>
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
                      backgroundColor: isMe ? '#6B1B71' : '#ffffff',
                      color: isMe ? '#ffffff' : '#1F1A1D',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      border: isMe ? 'none' : '1px solid #D8CFC1',
                      wordBreak: 'break-word',
                      textAlign: 'left'
                    }}>
                      {msg?.message || ''}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#8B8278', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>
                        {formatChatDateTime(msg?.created_at)}
                      </span>
                      {isMe && (
                        <span
                          title={msg?.is_read ? 'Read' : 'Sent'}
                          style={{
                            color: msg?.is_read ? '#6B1B71' : '#8B8278',
                            fontWeight: 900,
                            letterSpacing: '-0.08em'
                          }}
                        >
                          \u2713\u2713
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
              backgroundColor: '#FAF6EA'
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
                backgroundColor: '#FAF6EA'
              }}
            />
            <input type="submit" style={{ display: 'none' }} />
            <button 
              type="button"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: newMessage.trim() ? '#6B1B71' : '#F5ECDD',
                color: newMessage.trim() ? '#ffffff' : '#8B8278',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: newMessage.trim() ? 'pointer' : 'default',
                transition: 'all 0.15s ease',
                padding: 0
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {selectedNotification && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(31, 26, 29, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '480px',
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            border: '1px solid #D8CFC1',
            boxShadow: 'var(--shadow-premium)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FAF6EA'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#1F1A1D', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={18} style={{ color: '#6B1B71' }} /> Notification Details
              </h3>
              <button
                onClick={() => setSelectedNotification(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8B8278', display: 'flex', padding: 0 }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#F5ECDD',
                  color: '#6B1B71',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Bell size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '1rem', fontWeight: 800, color: '#1F1A1D' }}>
                    {selectedNotification.title || 'Platform Alert'}
                  </h4>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#4a1a50', lineHeight: 1.5, whiteSpace: 'pre-wrap', textAlign: 'left' }}>
                    {selectedNotification.message}
                  </p>
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '0.5rem',
                fontSize: '0.75rem',
                color: '#8B8278',
                paddingTop: '0.75rem',
                borderTop: '1px solid #f1f5f9'
              }}>
                <span>Received: {selectedNotification.created_at ? new Date(selectedNotification.created_at).toLocaleString() : 'Just now'}</span>
                <span style={{
                  backgroundColor: '#f1f5f9',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontWeight: 700,
                  color: '#8B8278'
                }}>
                  {selectedNotification.type || 'system'}
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#FAF6EA',
              borderTop: '1px solid #D8CFC1',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem'
            }}>
              {selectedNotification.product_id && (
                <button
                  onClick={() => {
                    navigate(`/buyer/listings/${selectedNotification.product_id}`);
                    setSelectedNotification(null);
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
                >
                  View Related Product
                </button>
              )}
              <button
                onClick={() => setSelectedNotification(null)}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 700 }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;


