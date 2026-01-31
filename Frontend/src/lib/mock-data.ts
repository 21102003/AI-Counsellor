export interface University {
  id: string;
  name: string;
  location: string;
  country: string;
  flag: string;
  matchScore: number;
  tuition: number;
  acceptanceRate: number;
  type: 'Safe' | 'Target' | 'Dream';
  tags: string[];
  aiInsight: string;
}

export const universities: University[] = [
  {
    id: "1",
    name: "Stanford University",
    location: "Stanford, CA",
    country: "USA",
    flag: "🇺🇸",
    matchScore: 92,
    tuition: 58000,
    acceptanceRate: 4,
    type: 'Dream',
    tags: ["Top Tier", "Silicon Valley", "Research"],
    aiInsight: "Excellent fit for your CS Major. Note: This university requires a WES evaluation and a high GRE score."
  },
  {
    id: "2",
    name: "New York University",
    location: "New York, NY",
    country: "USA",
    flag: "🇺🇸",
    matchScore: 85,
    tuition: 52000,
    acceptanceRate: 12,
    type: 'Target',
    tags: ["Urban", "Global", "Networking"],
    aiInsight: "Strong alignment with your career goals in FinTech. Consider the Tandon School of Engineering."
  },
  {
    id: "3",
    name: "University of Toronto",
    location: "Toronto, ON",
    country: "Canada",
    flag: "🇨🇦",
    matchScore: 88,
    tuition: 45000,
    acceptanceRate: 43,
    type: 'Target',
    tags: ["Diverse", "Research Heavy", "High ROI"],
    aiInsight: "Great value for money. Your research experience makes you a strong candidate for their AI lab."
  },
  {
    id: "4",
    name: "Arizona State University",
    location: "Tempe, AZ",
    country: "USA",
    flag: "🇺🇸",
    matchScore: 95,
    tuition: 32000,
    acceptanceRate: 88,
    type: 'Safe',
    tags: ["Innovation", "Large Campus", "Affordable"],
    aiInsight: "Highly likely admission. Their 'Silicon Desert' ecosystem is growing rapidly."
  },
  {
    id: "5",
    name: "ETH Zurich",
    location: "Zurich",
    country: "Switzerland",
    flag: "🇨🇭",
    matchScore: 78,
    tuition: 2000,
    acceptanceRate: 27,
    type: 'Dream',
    tags: ["Prestigious", "Low Tuition", "Technical"],
    aiInsight: "Extremely competitive tuition. Focus on your mathematical foundations in your application."
  },
  {
    id: "6",
    name: "Technical University of Munich",
    location: "Munich",
    country: "Germany",
    flag: "🇩🇪",
    matchScore: 82,
    tuition: 0,
    acceptanceRate: 35,
    type: 'Target',
    tags: ["No Tuition", "Engineering", "Industry"],
    aiInsight: "Zero tuition for internationals. Excellent connections to German automotive giants."
  }
];
