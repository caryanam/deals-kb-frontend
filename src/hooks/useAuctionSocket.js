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
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(0); // mirror of timer for stable tick closure
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
    if (!productId || isConnected) return undefined;
    const interval = setInterval(() => {
      syncAuctionData(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [productId, isConnected, syncAuctionData]);

  const parseDiffInSeconds = (end, start) => {
    if (!end) return 0;
    try {
      const endTime = typeof end === 'number' 
        ? (end > 10000000000 ? end : end * 1000) 
        : new Date(end).getTime();
      const startTime = start 
        ? (typeof start === 'number' ? (start > 10000000000 ? start : start * 1000) : new Date(start).getTime()) 
        : Date.now();
      return Math.max(0, Math.round((endTime - startTime) / 1000));
    } catch (e) {
      console.warn("Failed to parse timer diff:", e);
      return 0;
    }
  };

  // When timer hits zero, retry syncing with backend every 2s until auction status is updated
  useEffect(() => {
    if (timer > 0 || auctionStatus !== 'live') return undefined;

    // Run immediately
    syncAuctionData(true);

    // Set retry interval
    const interval = setInterval(() => {
      syncAuctionData(true);
    }, 2000);

    return () => clearInterval(interval);
  }, [timer, auctionStatus, syncAuctionData]);

  // Local real-time smooth timer decrement — runs once on mount, never restarts
  useEffect(() => {
    const tick = setInterval(() => {
      setTimer((prev) => {
        const next = prev > 0 ? prev - 1 : 0;
        timerRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, []); // deliberately empty — tick is a stable clock, never restarted

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
              if (data.winner_name) setWinner(data.winner_name);
              if (data.bids) setBidHistory(data.bids);
              // Timer: prefer time_left, then derive from auction_end - server_time, then fall back to legacy timer field
              if (data.time_left !== undefined) {
                setTimer(Math.max(0, Math.round(data.time_left)));
              } else if (data.auction_end && data.server_time) {
                setTimer(parseDiffInSeconds(data.auction_end, data.server_time));
              } else if (data.timer !== undefined) {
                setTimer(Math.max(0, Math.round(data.timer)));
              }
              break;

            case 'auction_started':
              setAuctionStatus('live');
              // Trust backend for the starting timer — never assume 120
              if (data.time_left !== undefined) {
                setTimer(Math.max(0, Math.round(data.time_left)));
              } else if (data.auction_end && data.server_time) {
                setTimer(parseDiffInSeconds(data.auction_end, data.server_time));
              } else if (data.duration !== undefined) {
                setTimer(Math.max(0, Math.round(data.duration)));
              }
              // If none provided, keep current timer as-is — do NOT reset to 120
              break;

            case 'timer_tick':
              // Always trust backend authoritative time
              if (data.time_left !== undefined) {
                setTimer(Math.max(0, Math.round(data.time_left)));
              } else if (data.auction_end && data.server_time) {
                setTimer(parseDiffInSeconds(data.auction_end, data.server_time));
              } else if (data.timer !== undefined) {
                setTimer(Math.max(0, Math.round(data.timer)));
              }
              break;

            case 'new_bid': {
              // Update bid params dynamically
              const bidAmount = data.current_bid !== undefined 
                ? data.current_bid 
                : (data.bid?.amount !== undefined ? data.bid.amount : (data.amount || 0));

              const bidderName = data.highest_bidder_name 
                || data.bid?.bidder_name 
                || data.bidderName 
                || data.bidder_name 
                || '';

              const bidderId = data.highest_bidder_id 
                || data.bid?.bidder_id 
                || data.bidderId 
                || data.bidder_id 
                || '';

              setCurrentHighestBid(bidAmount);
              setHighestBidder(bidderName);
              setHighestBidderId(bidderId);

              // Timer: only update if backend explicitly sends a new time — NEVER reset to 120
              if (data.time_left !== undefined) {
                setTimer(Math.max(0, Math.round(data.time_left)));
              } else if (data.auction_end && data.server_time) {
                setTimer(parseDiffInSeconds(data.auction_end, data.server_time));
              }

              // Append bid to logs
              const newBid = {
                id: data.bid?.bid_id || data.bid?.id || data.id || 'b_' + Date.now(),
                bidder_name: bidderName,
                bidderName: bidderName,
                amount: bidAmount,
                created_at: data.bid?.created_at || new Date().toISOString(),
                time: data.bid?.created_at 
                  ? new Date(data.bid.created_at).toLocaleTimeString() 
                  : (data.time || new Date().toLocaleTimeString())
              };
              setBidHistory(prev => {
                if (prev.some(b => b.amount === newBid.amount && (b.bidder_name === newBid.bidder_name || b.bidderName === newBid.bidderName))) return prev;
                return [newBid, ...prev];
              });
              break;
            }

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

      // Update local bid state immediately for responsiveness
      // Do NOT touch the timer here — the backend's new_bid / timer_tick WS event will correct it
      setCurrentHighestBid(amount);
      if (user) {
        setHighestBidder(user.name);
        setHighestBidderId(user.user_id);
      }

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
