// socialSeed.ts
// Data loader and generator for Social media feed
import type { User, Post, Comment } from '../components/Social';

// 1. Archetype definitions
const ARCHETYPES = [
  'Geo-political Expert',
  'Anime/Otaku Expert',
  'Ahmadi Muslim Scholar',
  'Regional Indian Patriot',
  'Film/Media Critic',
  'China Specialist',
  'Agriculture/Development Expert',
  'Retired Global Official',
  'International Cooperation Advocate',
  'Asian Continentalist',
  'Futurist/Scenario Planner',
  'Neo-Indo-European Thinker',
  'Religious/Social Scholar',
];

// 1a. Word banks for each archetype
const ARCHETYPE_WORDS: Record<string, string[]> = {
  'Geo-political Expert': ['Geo', 'Political', 'Diplomat', 'Analyst', 'Strategy', 'Border', 'Policy', 'Global', 'Security', 'Alliance', 'Treaty', 'Region', 'Conflict', 'Zone'],
  'Anime/Otaku Expert': ['Anime', 'Otaku', 'Manga', 'Senpai', 'Kawaii', 'Cosplay', 'Shonen', 'Waifu', 'Neko', 'Otome', 'Mecha', 'Chibi', 'Sensei', 'Otaku'],
  'Ahmadi Muslim Scholar': ['Ahmadi', 'Muslim', 'Scholar', 'Imam', 'Faith', 'Community', 'Peace', 'Islam', 'Jamaat', 'Mirza', 'Qadian', 'Reform', 'Unity', 'Spiritual'],
  'Regional Indian Patriot': ['Patriot', 'Desh', 'Bharat', 'Swadeshi', 'Janata', 'Lok', 'Raj', 'Samaj', 'Unity', 'Pride', 'Heritage', 'Culture', 'India', 'Region'],
  'Film/Media Critic': ['Film', 'Media', 'Critic', 'Cinema', 'Review', 'Bollywood', 'Hollywood', 'Screen', 'Director', 'Actor', 'Script', 'Award', 'Festival', 'Lens'],
  'China Specialist': ['China', 'Mandarin', 'Beijing', 'Dragon', 'Silk', 'Wall', 'Dynasty', 'Trade', 'Party', 'Confucius', 'Han', 'Reform', 'Asia', 'Specialist'],
  'Agriculture/Development Expert': ['Agro', 'Farm', 'Harvest', 'Green', 'Crop', 'Soil', 'Irrigation', 'Yield', 'Village', 'Growth', 'Rural', 'Seed', 'Expert', 'Development'],
  'Retired Global Official': ['Retired', 'Official', 'Global', 'UN', 'Ambassador', 'Envoy', 'Diplomat', 'Peace', 'Mission', 'Council', 'Summit', 'Delegate', 'Veteran', 'Statesman'],
  'International Cooperation Advocate': ['Cooperation', 'Advocate', 'Global', 'Unity', 'Treaty', 'Forum', 'Summit', 'Peace', 'Bridge', 'Network', 'Partner', 'Alliance', 'World', 'International'],
  'Asian Continentalist': ['Asia', 'Continental', 'Silk', 'Route', 'Eurasia', 'Bridge', 'Trade', 'Unity', 'Culture', 'Dynasty', 'Growth', 'Future', 'Network', 'Asian'],
  'Futurist/Scenario Planner': ['Futurist', 'Scenario', 'Planner', 'Vision', 'Forecast', 'Trend', 'AI', 'Tech', '2030', 'NextGen', 'Simulation', 'Model', 'Change', 'Future'],
  'Neo-Indo-European Thinker': ['Neo', 'Indo', 'European', 'Thinker', 'Philosophy', 'Culture', 'Heritage', 'Bridge', 'Idea', 'Modern', 'Classic', 'Fusion', 'Scholar', 'Theory'],
  'Religious/Social Scholar': ['Religious', 'Social', 'Scholar', 'Faith', 'Community', 'Ethics', 'Morality', 'Unity', 'Tradition', 'Belief', 'Guide', 'Harmony', 'Spiritual', 'Society'],
};

// 2. Fake user generator (no images, 3-word names)
function generateFakeUsers(count: number): User[] {
  const users: User[] = [];
  for (let i = 0; i < count; i++) {
    const archetype = ARCHETYPES[Math.floor(Math.random() * ARCHETYPES.length)];
    const words = ARCHETYPE_WORDS[archetype];
    // Pick 3 random words for the display name
    const nameWords: string[] = [];
    while (nameWords.length < 3) {
      const w = words[Math.floor(Math.random() * words.length)];
      if (!nameWords.includes(w)) nameWords.push(w);
    }
    const displayName = nameWords.join(' ');
    users.push({
      id: `u${Math.floor(Math.random() * 10000000)}`,
      username: `user${Math.floor(Math.random() * 10000000)}`,
      displayName,
      avatar: '', // No image
      karma: Math.floor(Math.random() * 5000),
      reputation: Math.floor(Math.random() * 3000),
      followers: Math.floor(Math.random() * 2000),
      following: Math.floor(Math.random() * 1000),
      connections: Math.floor(Math.random() * 500),
      isAnonymous: false,
      isVerified: Math.random() > 0.8,
      bio: `Expertise: ${archetype}`,
      location: 'India',
      company: '',
      position: '',
      relationshipStatus: 'private',
    });
  }
  return users;
}

// 3. Factoid loader (placeholder: will be replaced with actual file reading in Node/server context)
// const FACTOID_FILES = [...];
import factoids from './factoids.json';

const SAMPLE_FACTOIDS = [
  { text: 'India TB Report 2024: Contribute to India\'s goal of eliminating TB by 2025.', topic: 'Gyan' },
  { text: 'Earliest Humans--42 lakh years old; Present Modern Human--50,000 years ago.', topic: 'History' },
  { text: '1st Survey General of Bengal: James Rennel: 1767', topic: 'ModernHistory' },
  { text: '1773 wale act ke chutiyaap ko rectify karne ke liye aaya tha, 1781 ka Amending Act.', topic: 'Polity' },
  { text: 'Biosphere ki structural and functional unit hoti hai--> Ecosystem.', topic: 'Environment' },
];

// 4. Post generator (no grouping, each factoid is a post)
function generatePosts(users: User[], factoids: { text: string; topic: string }[]): Post[] {
  const posts: Post[] = [];
  for (let i = 0; i < factoids.length; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    posts.push({
      id: `p${i}`,
      author: user,
      content: factoids[i].text,
      timestamp: new Date(Date.now() - Math.floor(Math.random() * 1000000000)),
      likes: Math.floor(Math.random() * 500),
      shares: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 20),
      karma: Math.floor(Math.random() * 100),
      isAnonymous: false,
      board: factoids[i].topic ? factoids[i].topic.toLowerCase() : 'general',
      tags: [factoids[i].topic || 'General'],
      isQuoteTweet: false,
      visibility: 'public',
      type: 'text',
    });
  }
  return posts;
}

// 6. Exported data
const users = generateFakeUsers(1000);
const posts = generatePosts(users, Array.isArray(factoids) && factoids.length > 0 ? factoids : SAMPLE_FACTOIDS);

export { users, posts }; 