import { useState, useEffect, useRef, useCallback } from 'react';
import { getProductById, getProductBids, placeBid as placeBidApi } from '../api/productApi';
import { useAuth } from './useAuth';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/api/ws/auction';

export const useAuctionSocket = (productId) => {
  const { user, token } = useAuth();
  
  const [isConnected, setIsConnected] = useState(false);
  const [auctionStatus, setAuctionStatus] = useState('pending'); // pending, approved, rejected, live, ended
  const [currentHighestBid, setCurrentHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState('');
  const [highestBidderId, setHighestBidderId] = useState('');
  const [bidHistory, setBidHistory] = useState([]);
  const [timer, setTimer] = useState(120);
  const [winner, setWinner] = useState(null);
  const [error, setError] = useState(null);

  const socketRef = useRef(null);

  // Load initial product details and bid history from REST APIs
  const syncAuctionData = useCallback(async (silent = false) => {
    try {
      if (!silent) setError(null);
      const product = await getProductById(productId);
      setAuctionStatus(product.status || 'pending');
      const bids = await getProductBids(productId);
      const bidList = Array.isArray(bids) ? bids : [];
      const latestBid = bidList[0];

      setCurrentHighestBid(product.current_bid || latestBid?.amount || 0);
      setHighestBidder(product.highest_bidder_name || latestBid?.bidder_name || latestBid?.bidderName || '');
      setHighestBidderId(product.highest_bidder_id || latestBid?.bidder_id || latestBid?.bidderId || '');
      setWinner(product.winner_name || null);
      setBidHistory(bidList);
    } catch (err) {
      if (!silent) {
        console.error('Failed to load initial auction parameters:', err);
        setError(err.response?.data?.detail || err.response?.data?.message || 'Failed to retrieve listing parameters.');
      }
    }
  }, [productId]);

  useEffect(() => {
    syncAuctionData();
  }, [syncAuctionData]);

  useEffect(() => {
    if (!productId) return undefined;
    const interval = setInterval(() => {
      syncAuctionData(true);
    }, 1000);
    return () => clearInterval(interval);
  }, [productId, syncAuctionData]);

  // Connect to real WebSocket
  const connect = useCallback(() => {
    setError(null);
    try {
      const tokenQuery = token ? `?token=${token}` : '';
      const wsUrl = `${WS_BASE_URL}/${productId}${tokenQuery}`;
      console.log(`[WS] Connecting to: ${wsUrl}`);
      
      const socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
        console.log('[WS] Connected to auction websocket channel.');
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          console.log('[WS] Received socket event:', payload);

          const eventName = payload.event || payload.type;
          const data = payload.data || payload;

          switch (eventName) {
            case 'auction_cancelled':
              setAuctionStatus('cancelled');
              setTimer(0);
              setError(data.reason || 'Auction was cancelled by an administrator.');
              break;

            case 'state':
              // Sync complete product state
              if (data.status) setAuctionStatus(data.status);
              if (data.current_bid !== undefined) setCurrentHighestBid(data.current_bid);
              if (data.highest_bidder_name) setHighestBidder(data.highest_bidder_name);
              if (data.highest_bidder_id) setHighestBidderId(data.highest_bidder_id);
              if (data.timer !== undefined) setTimer(data.timer);
              if (data.winner_name) setWinner(data.winner_name);
              if (data.bids) setBidHistory(data.bids);
              break;

            case 'auction_started':
              setAuctionStatus('live');
              setTimer(120);
              break;

            case 'timer_tick':
              if (data.time_left !== undefined) {
                setTimer(data.time_left);
              } else if (data.timer !== undefined) {
                setTimer(data.timer);
              }
              break;

            case 'new_bid':
              // Update bid params dynamically
              setCurrentHighestBid(data.amount);
              setHighestBidder(data.bidderName || data.bidder_name);
              setHighestBidderId(data.bidderId || data.bidder_id);
              if (data.time_left !== undefined) {
                setTimer(data.time_left);
              } else {
                setTimer(120); // Fallback reset
              }
              
              // Append bid to logs
              const newBid = {
                id: data.id || 'b_' + Date.now(),
                bidderName: data.bidderName || data.bidder_name,
                amount: data.amount,
                time: data.time || new Date().toLocaleTimeString()
              };
              setBidHistory(prev => {
                if (prev.some(b => b.amount === data.amount)) return prev;
                return [newBid, ...prev];
              });
              break;

            case 'auction_ended':
              setAuctionStatus('ended');
              setTimer(0);
              if (data.winnerName || data.winner_name) {
                setWinner(data.winnerName || data.winner_name);
              } else if (data.highest_bidder_name) {
                setWinner(data.highest_bidder_name);
              }
              break;

            default:
              console.log('[WS] Unknown websocket event:', eventName);
          }
        } catch (err) {
          console.error('[WS] Failed to parse message packet:', err);
        }
      };

      socket.onerror = (err) => {
        console.error('[WS] Error in socket channel connection:', err);
        setError('WebSocket synchronization error. Bids might be delayed.');
      };

      socket.onclose = (closeEvent) => {
        setIsConnected(false);
        console.warn(`[WS] Connection closed: Code ${closeEvent.code}.`);
      };

    } catch (err) {
      console.error('[WS] Failed to instantiate socket channel connection:', err);
      setError('Connection to live auction socket channel failed.');
    }
  }, [productId, token]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Place a bid via REST POST request
  const placeBid = async (amount) => {
    try {
      setError(null);
      // Validate locally first
      if (auctionStatus !== 'live') {
        throw new Error('Auction is not live');
      }

      const res = await placeBidApi(productId, amount);
      
      // Update local states immediately to keep UI ultra responsive
      setCurrentHighestBid(amount);
      if (user) {
        setHighestBidder(user.name);
        setHighestBidderId(user.user_id);
      }
      setTimer(120);

      return res;
    } catch (err) {
      const rawDetail = err.response?.data?.detail;
      const msg = typeof rawDetail === 'string'
        ? rawDetail
        : (rawDetail?.message || err.response?.data?.message || err.message || 'Failed to place bid.');
      setError(msg);
      const wrapped = new Error(msg);
      wrapped.status = err.response?.status;
      wrapped.data = err.response?.data;
      throw wrapped;
    }
  };

  return {
    isConnected,
    auctionStatus,
    currentHighestBid,
    highestBidder,
    highestBidderId,
    bidHistory,
    timer,
    winner,
    error,
    placeBid,
    reconnect: connect,
    disconnect
  };
};

export default useAuctionSocket;
