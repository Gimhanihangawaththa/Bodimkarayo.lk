export const dashboardStats = [
  { label: 'Total Users', value: '12,450', trend: '+8.5% this month' },
  { label: 'Total Properties', value: '3,240', trend: '+3.2% this month' },
  { label: 'Active Listings', value: '1,920', trend: '+5.0% this week' },
  { label: 'Roommate Posts', value: '740', trend: '+7.1% this week' },
  { label: 'Reported Issues', value: '39', trend: '-4.3% this week' },
  { label: 'Verified Users', value: '8,920', trend: '72% verified' },
]

export const usersSeed = [
  {
    id: 'u-001',
    name: 'Devoryn',
    email: 'devoryn@gmail.com',
    verified: true,
    status: 'Active',
    complaints: 0,
    listings: 2,
    reviews: 6,
  },
  {
    id: 'u-002',
    name: 'Sarah K.',
    email: 'sarah@gmail.com',
    verified: true,
    status: 'Active',
    complaints: 1,
    listings: 1,
    reviews: 3,
  },
  {
    id: 'u-003',
    name: 'Alex M.',
    email: 'alex@gmail.com',
    verified: false,
    status: 'Suspended',
    complaints: 5,
    listings: 4,
    reviews: 12,
  },
]

export const propertiesSeed = [
  {
    id: 'p-001',
    title: 'Colombo 05 Annex Room',
    owner: 'Nimal',
    status: 'Pending',
    location: 'Colombo 05',
    price: 45000,
    flagged: false,
  },
  {
    id: 'p-002',
    title: 'Kandy Girls Hostel',
    owner: 'Amali',
    status: 'Approved',
    location: 'Kandy',
    price: 38000,
    flagged: false,
  },
  {
    id: 'p-003',
    title: 'Fake Luxury Apartment',
    owner: 'Unknown',
    status: 'Rejected',
    location: 'Negombo',
    price: 90000,
    flagged: true,
  },
]

export const roommatesSeed = [
  {
    id: 'r-001',
    title: 'Looking for 2 female roommates',
    gender: 'Female',
    lifestyle: 'Non-smoker',
    studentFriendly: true,
    trendScore: 88,
    status: 'Active',
  },
  {
    id: 'r-002',
    title: 'Shared room near UoM',
    gender: 'Any',
    lifestyle: 'Quiet',
    studentFriendly: true,
    trendScore: 91,
    status: 'Active',
  },
  {
    id: 'r-003',
    title: 'Late-night party house',
    gender: 'Male',
    lifestyle: 'Nightlife',
    studentFriendly: false,
    trendScore: 34,
    status: 'Flagged',
  },
]

export const reportsSeed = [
  {
    id: 'rep-001',
    targetType: 'User',
    target: 'u-003',
    reason: 'Scam messages',
    status: 'Pending',
  },
  {
    id: 'rep-002',
    targetType: 'Property',
    target: 'p-003',
    reason: 'Fake images',
    status: 'Under Review',
  },
  {
    id: 'rep-003',
    targetType: 'User',
    target: 'u-002',
    reason: 'Abusive language',
    status: 'Resolved',
  },
]

export const reviewsSeed = [
  {
    id: 'rv-001',
    landlord: 'Nimal',
    rating: 4.7,
    comment: 'Clean and safe place.',
    status: 'Visible',
  },
  {
    id: 'rv-002',
    landlord: 'Unknown',
    rating: 1.2,
    comment: 'Looks fake and misleading.',
    status: 'Flagged',
  },
  {
    id: 'rv-003',
    landlord: 'Amali',
    rating: 2.3,
    comment: 'Too expensive for facilities.',
    status: 'Visible',
  },
]

export const analyticsSeed = {
  topLocations: ['Colombo 05', 'Kandy', 'Nugegoda', 'Maharagama'],
  activeUsers: ['Devoryn', 'Sarah K.', 'Janith', 'Chamodi'],
  demandTrends: ['Colombo +24%', 'Kandy +18%', 'Galle +12%'],
  matchRate: '68%',
}

export const settingsSeed = {
  propertyTypes: ['Annex', 'Boarding', 'Hostel', 'Apartment'],
  filters: ['Vegetarian', 'Pets Allowed', 'Parking', 'WiFi'],
  rules: ['No fake listings', 'No harassment', 'No spam reviews'],
}
