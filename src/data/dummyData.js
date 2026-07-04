// Dummy data store for DealsKB C2C Vehicle Auction Platform

export const initialUsers = [
  { id: 'u1', name: 'John Doe', email: 'john@buyer.com', role: 'Buyer', status: 'Active', created_at: '2026-01-15' },
  { id: 'u2', name: 'Jane Smith', email: 'jane@seller.com', role: 'Seller', status: 'Active', created_at: '2026-02-10' },
  { id: 'u3', name: 'Admin Master', email: 'admin@dealskb.com', role: 'Admin', status: 'Active', created_at: '2025-12-01' },
  { id: 'u4', name: 'Bob Johnson', email: 'bob@buyer.com', role: 'Buyer', status: 'Active', created_at: '2026-03-01' },
  { id: 'u5', name: 'Alice Williams', email: 'alice@seller.com', role: 'Seller', status: 'Suspended', created_at: '2026-03-12' }
];

export const initialListings = [
  {
    id: 'L1',
    title: '2021 Tesla Model 3 Long Range',
    make: 'Tesla',
    model: 'Model 3',
    year: 2021,
    fuelType: 'Electric',
    transmission: 'Automatic',
    kilometers: 28000,
    expectedPrice: 38000,
    ownership: '1st Owner',
    insurance: 'Comprehensive until Dec 2026',
    accidental: 'Non-Accidental',
    description: 'Immaculate condition Tesla Model 3 Long Range with Autopilot. Single owner, garage kept, full service history. Dual motor AWD.',
    status: 'Live', // Pending Approval, Approved, Rejected, Live, Ended
    sellerId: 'u2',
    sellerName: 'Jane Smith',
    images: [
      'https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=600&auto=format&fit=crop&q=60'
    ],
    video: null,
    submittedDate: '2026-06-28',
    rejectionReason: null,
    auctionId: 'A1'
  },
  {
    id: 'L2',
    title: '2019 BMW M4 Competition',
    make: 'BMW',
    model: 'M4',
    year: 2019,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kilometers: 42000,
    expectedPrice: 55000,
    ownership: '2nd Owner',
    insurance: 'Third Party till Oct 2026',
    accidental: 'Non-Accidental',
    description: 'BMW M4 Competition in Yas Marina Blue. Carbon fiber roof, HUD, Harman Kardon sound system. Brand new tires installed recently.',
    status: 'Approved',
    sellerId: 'u2',
    sellerName: 'Jane Smith',
    images: [
      'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&auto=format&fit=crop&q=60'
    ],
    video: null,
    submittedDate: '2026-06-29',
    rejectionReason: null,
    auctionId: null
  },
  {
    id: 'L3',
    title: '2018 Ford Mustang GT Premium',
    make: 'Ford',
    model: 'Mustang GT',
    year: 2018,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kilometers: 35000,
    expectedPrice: 32000,
    ownership: '1st Owner',
    insurance: 'Comprehensive until Aug 2026',
    accidental: 'Non-Accidental',
    description: '5.0L V8 Manual Ford Mustang GT. Active valve exhaust, digital dash, heated/cooled seats. Sounds incredible and drives like a dream.',
    status: 'Pending Approval',
    sellerId: 'u5',
    sellerName: 'Alice Williams',
    images: [
      'https://images.unsplash.com/photo-1611245801318-562c64727c38?w=600&auto=format&fit=crop&q=60'
    ],
    video: null,
    submittedDate: '2026-06-30',
    rejectionReason: null,
    auctionId: null
  },
  {
    id: 'L4',
    title: '2020 Porsche 911 Carrera S',
    make: 'Porsche',
    model: '911 Carrera S',
    year: 2020,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    kilometers: 15000,
    expectedPrice: 98000,
    ownership: '1st Owner',
    insurance: 'Comprehensive until Jan 2027',
    accidental: 'Non-Accidental',
    description: 'Stunning Chalk Gray Porsche 911 S. Sport Chrono package, rear-axle steering, sunroof, upgraded Bose surround sound.',
    status: 'Ended',
    sellerId: 'u2',
    sellerName: 'Jane Smith',
    images: [
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=600&auto=format&fit=crop&q=60'
    ],
    video: null,
    submittedDate: '2026-06-25',
    rejectionReason: null,
    auctionId: 'A2'
  },
  {
    id: 'L5',
    title: '2017 Honda Civic Type R',
    make: 'Honda',
    model: 'Civic Type R',
    year: 2017,
    fuelType: 'Petrol',
    transmission: 'Manual',
    kilometers: 68000,
    expectedPrice: 24500,
    ownership: '3rd Owner',
    insurance: 'Expired',
    accidental: 'Accidental',
    description: 'Honda Civic Type R (FK8). Championship White. Has minor repair on front bumper (non-structural, fully fixed, insurance claimed). Modified exhaust.',
    status: 'Rejected',
    sellerId: 'u2',
    sellerName: 'Jane Smith',
    images: [
      'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&auto=format&fit=crop&q=60'
    ],
    video: null,
    submittedDate: '2026-06-26',
    rejectionReason: 'Minor structural damage reported, missing current active insurance policy details.',
    auctionId: null
  }
];

export const initialAuctions = [
  {
    id: 'A1',
    listingId: 'L1',
    status: 'Live', // Waiting, Live, Ended
    duration: 120, // 2 minutes
    startPrice: 35000,
    currentBid: 36500,
    highestBidderId: 'u1',
    highestBidderName: 'John Doe',
    bids: [
      { id: 'b1', bidderName: 'Bob Johnson', amount: 35500, time: '10:15:30 AM' },
      { id: 'b2', bidderName: 'John Doe', amount: 36500, time: '10:15:45 AM' }
    ],
    winnerId: null,
    endTime: null
  },
  {
    id: 'A2',
    listingId: 'L4',
    status: 'Ended',
    duration: 120,
    startPrice: 95000,
    currentBid: 99000,
    highestBidderId: 'u1',
    highestBidderName: 'John Doe',
    bids: [
      { id: 'b3', bidderName: 'Bob Johnson', amount: 96000, time: '09:00:10 AM' },
      { id: 'b4', bidderName: 'John Doe', amount: 99000, time: '09:00:28 AM' }
    ],
    winnerId: 'u1',
    winnerName: 'John Doe',
    endTime: '2026-06-25 09:00:30'
  }
];

export const initialNotifications = [
  { id: 'n1', userId: 'u1', message: 'The Tesla Model 3 auction is now live!', read: false, time: '5 mins ago' },
  { id: 'n2', userId: 'u1', message: 'Congratulations! You won the Porsche 911 Carrera S auction!', read: true, time: '5 days ago' },
  { id: 'n3', userId: 'u2', message: 'Your listing "2017 Honda Civic Type R" was rejected by Admin.', read: false, time: '4 days ago' },
  { id: 'n4', userId: 'u2', message: 'Your listing "2019 BMW M4" has been approved and is ready to schedule.', read: true, time: '1 day ago' }
];

// Helper database store with localStorage persistence for sessions
const getLocalData = (key, defaultVal) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultVal;
};

const setLocalData = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getListings = () => getLocalData('dkb_listings', initialListings);
export const saveListings = (listings) => setLocalData('dkb_listings', listings);

export const getAuctions = () => getLocalData('dkb_auctions', initialAuctions);
export const saveAuctions = (auctions) => setLocalData('dkb_auctions', auctions);

export const getUsers = () => getLocalData('dkb_users', initialUsers);
export const saveUsers = (users) => setLocalData('dkb_users', users);

export const getNotifications = () => getLocalData('dkb_notifications', initialNotifications);
export const saveNotifications = (notifications) => setLocalData('dkb_notifications', notifications);
