export interface ReviewItem {
  id: string;
  author: string;
  meta: string;
  isLocalGuide?: boolean;
  rating: number;
  timeAgo: string;
  avatarText?: string;
  avatarImage?: string;
  avatarBg?: string;
  content: string;
  initialLikes: number;
  isInitiallyHearted?: boolean;
  categoryTag: string;
  verified?: boolean;
}

export const REVIEWS_DATA: ReviewItem[] = [
  {
    id: 'review-aakanksha-singh',
    author: 'Aakanksha Singh',
    meta: '11 reviews',
    rating: 5,
    timeAgo: '3 months ago',
    avatarText: 'A',
    avatarBg: 'bg-[#D81B60]',
    content:
      'I’ve absolutely loved everything Jyoti & Sakshi have made for me over the years, and most recently for my two-year-old as well ❤️ Despite sharing only measurements and requirements over the phone, they’ve managed to get the fit, style, and perfection every single time!',
    initialLikes: 1,
    isInitiallyHearted: true,
    categoryTag: 'Custom Fit & Kidswear',
    verified: true,
  },
  {
    id: 'review-nikita-lalwani',
    author: 'Nikita Lalwani',
    meta: 'Local Guide · 25 reviews · 37 photos',
    isLocalGuide: true,
    rating: 5,
    timeAgo: '3 months ago',
    avatarText: 'N',
    avatarBg: 'bg-[#00897B]',
    content:
      'Had a wonderful experience with this boutique every time I visit. I’ve purchased dresses and also got outfits stitched here, and the quality has always been great. Whether it’s Indian, Western, or Indo-Western styles, they have a really nice and versatile collection. The designs are trendy, and the fitting is always on point.',
    initialLikes: 2,
    isInitiallyHearted: false,
    categoryTag: 'Indian & Indo-Western Outfits',
    verified: true,
  },
  {
    id: 'review-gehna-ahuja',
    author: 'Gehna Ahuja',
    meta: '1 review',
    rating: 5,
    timeAgo: '3 months ago',
    avatarImage: '/images/avatars/gehna.jpg',
    avatarBg: 'bg-[#E5D7CC]',
    content:
      'Great quality, beautiful designs, and comfortable fabrics. Highly recommended!',
    initialLikes: 1,
    isInitiallyHearted: false,
    categoryTag: 'Fabric Quality & Comfort',
    verified: true,
  },
  {
    id: 'review-khushi-khan',
    author: 'Khushi Khan',
    meta: '1 review',
    rating: 5,
    timeAgo: '3 months ago',
    avatarText: 'K',
    avatarBg: 'bg-[#546E7A]',
    content:
      'Beautiful collection, amazing customer service! Completely satisfied',
    initialLikes: 1,
    isInitiallyHearted: false,
    categoryTag: 'Customer Service & Collection',
    verified: true,
  },
  {
    id: 'review-chitra-otwani',
    author: 'Chitra Otwani',
    meta: '10 reviews · 2 photos',
    rating: 5,
    timeAgo: '3 months ago',
    avatarText: 'C',
    avatarBg: 'bg-[#5C6BC0]',
    content: 'Good experience all the time I have visited ..',
    initialLikes: 1,
    isInitiallyHearted: false,
    categoryTag: 'Boutique Visit Experience',
    verified: true,
  },
  {
    id: 'review-aditi-chandel',
    author: 'Aditi Chandel',
    meta: '2 reviews',
    rating: 5,
    timeAgo: '2 years ago',
    avatarText: 'A',
    avatarBg: 'bg-[#00ACC1]',
    content:
      'Could not be more happier with what I’ve found 1.5 years ago. I’ve great experience with chic Wadrobe store. Both Jyoti & Sakshi are humble , talented and way more understanding when it comes to their clients need.',
    initialLikes: 3,
    isInitiallyHearted: false,
    categoryTag: 'Personal Consultation & Trust',
    verified: true,
  },
  {
    id: 'review-simran-kaur',
    author: 'Simran Kaur',
    meta: 'Local Guide · 18 reviews · 4 photos',
    isLocalGuide: true,
    rating: 4,
    timeAgo: '1 month ago',
    avatarText: 'S',
    avatarBg: 'bg-[#D97706]',
    content:
      'Superb tailoring and thoughtful craftsmanship. Delivered just in time for our family celebration with exact custom sizing and neat seams.',
    initialLikes: 2,
    isInitiallyHearted: false,
    categoryTag: 'Custom Sizing & Delivery',
    verified: true,
  },
  {
    id: 'review-priyanka-deshmukh',
    author: 'Priyanka Deshmukh',
    meta: '7 reviews · 2 photos',
    rating: 4,
    timeAgo: '4 months ago',
    avatarText: 'P',
    avatarBg: 'bg-[#BE185D]',
    content:
      'Loved the silhouette, breathable cotton fabrics, and tailored finish. Sakshi was very helpful in helping me select colors that match.',
    initialLikes: 1,
    isInitiallyHearted: false,
    categoryTag: 'Textiles & Styling Advice',
    verified: true,
  },
];

export const RATING_SUMMARY = {
  average: 4.3,
  totalReviews: 148,
  distribution: [
    { stars: 5, percentage: 76, count: 112 },
    { stars: 4, percentage: 16, count: 24 },
    { stars: 3, percentage: 6, count: 9 },
    { stars: 2, percentage: 2, count: 3 },
    { stars: 1, percentage: 0, count: 0 },
  ],
  highlights: [
    { label: 'Bespoke Fitting & Tailoring', score: '4.9' },
    { label: 'Jyoti & Sakshi Design Consult', score: '5.0' },
    { label: 'Fabric Softness & Quality', score: '4.8' },
    { label: 'Delivery Timeliness', score: '4.6' },
  ],
};
