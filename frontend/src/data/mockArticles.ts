/**
 * mockArticles.ts
 * ────────────────────────────────────────────────────────────────────────────
 * Static seed data that mirrors the Laravel DatabaseSeeder.
 *
 * Usage:
 *   - Development skeleton / Storybook stories
 *   - Fallback when the API is unavailable
 *   - Unit-test fixtures
 *
 * Import:
 *   import { mockArticles, getByCategory, getFeatured, getBreaking, getTrending } from '@/data/mockArticles';
 */

import { Article, Category } from '../types';

// ── Categories ────────────────────────────────────────────────────────────────

export const mockCategories: Category[] = [
  { id: 1, name: 'Politics',      slug: 'politics',      color: '#1a1a2e', is_active: true, order: 1 },
  { id: 2, name: 'Sports',        slug: 'sports',        color: '#16213e', is_active: true, order: 2 },
  { id: 3, name: 'Technology',    slug: 'technology',    color: '#0f3460', is_active: true, order: 3 },
  { id: 4, name: 'Business',      slug: 'business',      color: '#533483', is_active: true, order: 4 },
  { id: 5, name: 'Entertainment', slug: 'entertainment', color: '#e94560', is_active: true, order: 5 },
  { id: 6, name: 'Health',        slug: 'health',        color: '#05c46b', is_active: true, order: 6 },
  { id: 7, name: 'Science',       slug: 'science',       color: '#0fbcf9', is_active: true, order: 7 },
  { id: 8, name: 'World News',    slug: 'world-news',    color: '#bb0011', is_active: true, order: 8 },
  { id: 9, name: 'Local News',    slug: 'local-news',    color: '#f8b739', is_active: true, order: 9 },
];

const catMap: Record<string, Category> = Object.fromEntries(
  mockCategories.map((c) => [c.slug, c])
);

const author = {
  id:     1,
  name:   'Admin User',
  avatar: 'https://avatars.githubusercontent.com/u/183214278?v=4',
};

// ── Raw article data ──────────────────────────────────────────────────────────

type RawArticle = Omit<Article, 'id' | 'category' | 'author'> & {
  category_slug: string;
};

const raw: RawArticle[] = [

  // ── WORLD NEWS ─────────────────────────────────────────────────────────────

  {
    title:          'US-Iran Tensions Escalate Following Military Strikes',
    subtitle:       'Global leaders call for restraint as fears of wider regional conflict grow',
    slug:           'us-iran-tensions-escalate-following-military-strikes',
    excerpt:        'Tensions between the United States and Iran intensified following a series of military strikes, prompting urgent diplomatic efforts.',
    content:        '<h2>Rising Regional Tensions</h2><p>International attention remains focused on the Middle East following recent military developments.</p><p>World leaders urged restraint while diplomatic efforts continue.</p><h2>Global Response</h2><p>Energy markets reacted sharply amid concerns over regional stability.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1OFmz4fbiNDUO4h9CI2hkR3hqFunAwGoQ1El_Jfx1Z-XSWQBDzIQ4Z9o&s=10',
    category_slug:  'world-news',
    tags:           ['usa', 'iran', 'middle-east', 'world'],
    views_count:    45800,
    read_time:      5,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-15T08:00:00Z',
  },
  {
    title:          'UN Calls Emergency Meeting Over Regional Conflict',
    subtitle:       'Security Council members seek diplomatic solutions',
    slug:           'un-calls-emergency-meeting-over-regional-conflict',
    excerpt:        'The United Nations has convened an emergency meeting to address growing concerns over regional instability.',
    content:        '<h2>Emergency Session</h2><p>UN officials gathered to discuss recent developments affecting international security.</p><p>Member states emphasized diplomacy and conflict prevention.</p>',
    featured_image: 'https://global.unitednations.entermediadb.net/assets/mediadb/services/module/asset/downloads/preset/Collections/Graphics%20Library/28-02-2026-SC-Iran-UNP.jpg/image1170x530cropped.jpg',
    category_slug:  'world-news',
    tags:           ['un', 'diplomacy', 'security', 'world'],
    views_count:    32100,
    read_time:      4,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    false,
    status:         'published',
    published_at:   '2025-01-14T10:30:00Z',
  },
  {
    title:          'European Leaders Discuss New Security Measures',
    subtitle:       'Summit focuses on defense cooperation and stability',
    slug:           'european-leaders-discuss-new-security-measures',
    excerpt:        'European leaders met to discuss strengthening regional security and defense partnerships.',
    content:        '<h2>Security Summit</h2><p>Officials reviewed emerging threats and regional challenges.</p><p>Several proposals for enhanced cooperation were introduced.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFOqDAGSlBS5vHZyYCKdc0-3OtSPz_XUpAgIM2GuuSxvVlmG-1F9EMAt-c&s=10',
    category_slug:  'world-news',
    tags:           ['europe', 'security', 'politics', 'world'],
    views_count:    27600,
    read_time:      4,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-13T09:00:00Z',
  },
  {
    title:          'China Expands Global Trade Partnerships',
    subtitle:       'New agreements strengthen economic ties across continents',
    slug:           'china-expands-global-trade-partnerships',
    excerpt:        'China announced several new trade partnerships aimed at boosting international commerce.',
    content:        '<h2>Trade Expansion</h2><p>Economic officials highlighted new opportunities for investment and infrastructure development.</p>',
    featured_image: 'https://v2-prod-umbraco.hinrichfoundation.com/media/facb51zf/global-trade-dominance-us-eu-china-2000-vs-2024.jpg',
    category_slug:  'world-news',
    tags:           ['china', 'trade', 'economy', 'world'],
    views_count:    29100,
    read_time:      4,
    is_breaking:    false,
    is_trending:    false,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-12T11:00:00Z',
  },
  {
    title:          'Middle East Peace Talks Resume in Geneva',
    subtitle:       'Diplomatic representatives return to negotiation table',
    slug:           'middle-east-peace-talks-resume-in-geneva',
    excerpt:        'Peace talks resumed in Geneva as negotiators seek long-term regional stability.',
    content:        '<h2>Negotiations Continue</h2><p>Delegations from multiple countries resumed discussions under international supervision.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5Da7e_PnP1P3qof-vKhl9wcCUBPSIK8CqyDTfIqn2jgNvAap5y_RFU8pi&s=10',
    category_slug:  'world-news',
    tags:           ['peace', 'geneva', 'middle-east', 'world'],
    views_count:    41300,
    read_time:      5,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-11T07:00:00Z',
  },
  {
    title:          'NATO Announces Joint Military Exercises',
    subtitle:       'Member nations coordinate large-scale training operations',
    slug:           'nato-announces-joint-military-exercises',
    excerpt:        'NATO has announced new military exercises involving thousands of personnel.',
    content:        '<h2>Joint Operations</h2><p>The exercises aim to improve readiness and coordination among allied forces.</p>',
    featured_image: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?w=800&auto=format&fit=crop',
    category_slug:  'world-news',
    tags:           ['nato', 'military', 'defense', 'world'],
    views_count:    33700,
    read_time:      3,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    false,
    status:         'published',
    published_at:   '2025-01-10T08:30:00Z',
  },
  {
    title:          'Global Leaders Meet for Climate Summit',
    subtitle:       'New environmental commitments announced',
    slug:           'global-leaders-meet-for-climate-summit',
    excerpt:        'World leaders gathered to discuss climate change and sustainable development goals.',
    content:        '<h2>Climate Action</h2><p>Participants outlined strategies to reduce emissions and accelerate renewable energy adoption.</p>',
    featured_image: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&auto=format&fit=crop',
    category_slug:  'world-news',
    tags:           ['climate', 'environment', 'summit', 'world'],
    views_count:    28900,
    read_time:      5,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-09T09:00:00Z',
  },
  {
    title:          'New Sanctions Impact International Markets',
    subtitle:       'Investors monitor economic consequences',
    slug:           'new-sanctions-impact-international-markets',
    excerpt:        'Fresh sanctions have triggered reactions across global financial markets.',
    content:        '<h2>Market Reaction</h2><p>Analysts reported increased volatility in several sectors.</p>',
    featured_image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop',
    category_slug:  'world-news',
    tags:           ['sanctions', 'markets', 'economy', 'world'],
    views_count:    35200,
    read_time:      4,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    false,
    status:         'published',
    published_at:   '2025-01-08T12:00:00Z',
  },
  {
    title:          'Historic Peace Agreement Signed',
    subtitle:       'Negotiators reach breakthrough after years of talks',
    slug:           'historic-peace-agreement-signed',
    excerpt:        'A historic peace agreement has been signed, ending years of political tensions.',
    content:        '<h2>Breakthrough Achievement</h2><p>Leaders celebrated the agreement as a major step toward lasting stability.</p>',
    featured_image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop',
    category_slug:  'world-news',
    tags:           ['peace', 'agreement', 'diplomacy', 'world'],
    views_count:    49200,
    read_time:      6,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-07T06:00:00Z',
  },
  {
    title:          'World Leaders Address Emerging Challenges',
    subtitle:       'Forum highlights technology, security, and sustainability',
    slug:           'world-leaders-address-emerging-challenges',
    excerpt:        'Global leaders gathered to discuss the challenges shaping the future of international relations.',
    content:        '<h2>Global Priorities</h2><p>Discussions focused on technology, climate, security, and economic resilience.</p>',
    featured_image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop',
    category_slug:  'world-news',
    tags:           ['leaders', 'global', 'politics', 'world'],
    views_count:    40100,
    read_time:      5,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-06T10:00:00Z',
  },

  // ── SPORTS ─────────────────────────────────────────────────────────────────

  {
  title:          'Egypt hold Belgium in Seattle',
  subtitle:       'Emam Ashour’s first international goal had Egypt on course for a maiden FIFA World Cup win, only for Romelu Lukaku’s arrival to help Belgium rescue a point.',
  slug:           'egypt-hold-belgium-in-seattle',
  excerpt:        'Egypt came close to securing their first-ever FIFA World Cup victory before Belgium fought back for a draw in their Group G opener.',
  content:        `
    <h2>Egypt Impress in World Cup Opener</h2>
    <p>Egypt produced a spirited performance against Belgium in their FIFA World Cup 2026 Group G opener at Seattle Stadium. Emam Ashour gave the Pharaohs the lead in the 19th minute with his first international goal after a brilliant move involving Mohamed Salah.</p>

    <h2>Belgium Respond Through Lukaku Impact</h2>
    <p>Belgium struggled to break down Egypt's defense for much of the match. However, substitute Romelu Lukaku made an immediate impact after coming on in the second half. Just twenty seconds after entering the field, his dangerous run and presence in the box forced an own goal from Mohamed Hany, leveling the score at 1-1.</p>

    <h2>Historic Performance for Egypt</h2>
    <p>The result marked a significant milestone for Egypt, who extended their total time leading in FIFA World Cup matches beyond their previous record. While they narrowly missed out on a historic first World Cup win, the draw earned them a valuable point against one of Europe's strongest teams.</p>

    <h2>Player of the Match</h2>
    <p>Emam Ashour was named Superior Player of the Match after scoring Egypt's opening goal and delivering an outstanding midfield performance.</p>

    <h2>Group G Standings</h2>
    <p>Following the draw, both Belgium and Egypt sit on one point, while Iran and New Zealand are yet to play their opening fixture.</p>
  `,
  featured_image: 'https://digitalhub.fifa.com/transform/050e446d-75cd-456c-b5ac-7f16a5133a34/Belgium-v-Egypt-Group-G-FIFA-World-Cup-2026?focuspoint=0.52,0.64&io=transform:fill,width:768&quality=75',
  category_slug:  'sports',
  tags:           ['football', 'fifa-world-cup', 'egypt', 'belgium', 'sports'],
  views_count:    38750,
  read_time:      5,
  is_breaking:    true,
  is_trending:    true,
  is_featured:    true,
  status:         'published',
  published_at:   '2026-06-16T00:00:00Z',
},
{
  title:          'France and Argentina take top billing',
  subtitle:       'Argentina begin their World Cup title defence while France, Norway, Iraq, Austria and Jordan all feature on an action-packed Matchday 6.',
  slug:           'france-and-argentina-take-top-billing',
  excerpt:        'Matchday 6 of the FIFA World Cup 2026 features four exciting fixtures, highlighted by defending champions Argentina and 2022 finalists France.',
  content:        `
    <h2>Matchday 6 Overview</h2>
    <p>Matchday 6 of the FIFA World Cup 2026 brings four intriguing encounters as some of the tournament's biggest names enter the competition. Defending champions Argentina begin their title defence, while France, runners-up in Qatar 2022, start their campaign against Senegal.</p>

    <h2>France Face Familiar Challenge</h2>
    <p>France open their Group I campaign against Senegal at New York New Jersey Stadium. The fixture revives memories of Senegal's famous victory over Les Bleus in the opening match of the 2002 FIFA World Cup.</p>

    <h2>Iraq Return After Four Decades</h2>
    <p>Iraq make their first FIFA World Cup appearance in 40 years when they face Norway at Boston Stadium. Norway, led by Erling Haaland, return to the tournament for the first time since 1998, with Haaland set to make his World Cup debut.</p>

    <h2>Argentina Launch Title Defence</h2>
    <p>Lionel Messi and Argentina begin their quest to retain the FIFA World Cup trophy against Algeria in Group J at Kansas City Stadium. Algeria are appearing in their first World Cup match in 12 years and will look to challenge the reigning champions.</p>

    <h2>Austria Meet Debutants Jordan</h2>
    <p>The day's final match sees Austria return to the FIFA World Cup after a 28-year absence. They face Jordan, who are making their historic debut at the global finals after reaching the AFC Asian Cup 2023 final.</p>

    <h2>Match Schedule</h2>
    <ul>
      <li>France vs Senegal — 15:00 (Local Time)</li>
      <li>Iraq vs Norway — 18:00 (Local Time)</li>
      <li>Argentina vs Algeria — 20:00 (Local Time)</li>
      <li>Austria vs Jordan — 21:00 (Local Time)</li>
    </ul>
  `,
  featured_image: 'https://digitalhub.fifa.com/transform/3cf9c384-c761-41af-b5ea-f2da42bb0eae/RE-FRAME-FIFA-World-Cup-2026-Portraits?focuspoint=0.28,0.31&io=transform:fill,height:800,width:1366&quality=75',
  category_slug:  'sports',
  tags:           ['football', 'fifa-world-cup', 'argentina', 'france', 'world-cup-2026'],
  views_count:    41200,
  read_time:      4,
  is_breaking:    false,
  is_trending:    true,
  is_featured:    true,
  status:         'published',
  published_at:   '2026-06-15T12:00:00Z',
},
  {
    title:          'FIFA World Cup Delivers Thrilling Upset',
    subtitle:       'Underdog nation shocks tournament favorites',
    slug:           'fifa-world-cup-delivers-thrilling-upset',
    excerpt:        'One of the biggest surprises in World Cup history unfolded as an underdog team defeated a tournament favorite.',
    content:        '<h2>Historic Upset</h2><p>Fans witnessed a dramatic result as the underdogs secured a memorable victory.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFxk71_uHDxr5QeGZLSzIpGmuOCNHkO3ftfgOg3WatLP7Q0v8MEm602tI&s=10',
    category_slug:  'sports',
    tags:           ['football', 'world-cup', 'sports'],
    views_count:    52400,
    read_time:      4,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-15T15:00:00Z',
  },
  {
    title:          'Egypt Eyes Strong World Cup Campaign',
    subtitle:       'Coaching staff confident ahead of qualifiers',
    slug:           'egypt-eyes-strong-world-cup-campaign',
    excerpt:        'Egypt is preparing for an important World Cup qualification campaign with renewed optimism.',
    content:        '<h2>Road To Qualification</h2><p>The national team has intensified preparations ahead of crucial matches.</p>',
    featured_image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop',
    category_slug:  'sports',
    tags:           ['egypt', 'football', 'world-cup'],
    views_count:    41800,
    read_time:      4,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-14T14:00:00Z',
  },
  {
    title:          'Champions League Final Breaks Viewership Records',
    subtitle:       'Millions tune in to watch European football showdown',
    slug:           'champions-league-final-breaks-viewership-records',
    excerpt:        'The Champions League final attracted record audiences across global broadcasting platforms.',
    content:        '<h2>Record Audience</h2><p>The final generated massive engagement worldwide.</p>',
    featured_image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop',
    category_slug:  'sports',
    tags:           ['champions-league', 'football', 'sports'],
    views_count:    46700,
    read_time:      4,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-13T16:00:00Z',
  },
  {
    title:          'Historic Comeback Stuns Football Fans',
    subtitle:       'Team overturns huge deficit in dramatic fashion',
    slug:           'historic-comeback-stuns-football-fans',
    excerpt:        'Supporters witnessed an unforgettable comeback during a thrilling football encounter.',
    content:        "<h2>Incredible Turnaround</h2><p>The team recovered from a difficult position to secure victory.</p>",
    featured_image: 'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=800&auto=format&fit=crop',
    category_slug:  'sports',
    tags:           ['football', 'comeback', 'sports'],
    views_count:    48600,
    read_time:      4,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-12T17:00:00Z',
  },
  {
    title:          'Tennis Champion Claims Grand Slam Title',
    subtitle:       "Victory cements place among sport's elite",
    slug:           'tennis-champion-claims-grand-slam-title',
    excerpt:        'A dominant performance secured another Grand Slam trophy for the world-renowned champion.',
    content:        '<h2>Grand Slam Success</h2><p>The champion controlled the match from start to finish.</p>',
    featured_image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&auto=format&fit=crop',
    category_slug:  'sports',
    tags:           ['tennis', 'grand-slam', 'sports'],
    views_count:    31200,
    read_time:      3,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-11T11:00:00Z',
  },
  {
    title:          'New Record Set at International Marathon',
    subtitle:       'Elite runners produce historic performances',
    slug:           'new-record-set-at-international-marathon',
    excerpt:        'A new course record was established during a major international marathon event.',
    content:        '<h2>Historic Achievement</h2><p>Thousands participated while elite athletes delivered remarkable results.</p>',
    featured_image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&auto=format&fit=crop',
    category_slug:  'sports',
    tags:           ['marathon', 'athletics', 'sports'],
    views_count:    28300,
    read_time:      3,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-10T09:00:00Z',
  },

  // ── TECHNOLOGY ─────────────────────────────────────────────────────────────

  {
    title:          'AI Investments Reach Record Levels',
    subtitle:       'Global funding for artificial intelligence startups surges',
    slug:           'ai-investments-reach-record-levels',
    excerpt:        'Investments in artificial intelligence companies have reached record highs as businesses race to adopt AI-powered solutions across industries.',
    content:        '<h2>AI Investment Boom</h2><p>Global investors have poured billions of dollars into artificial intelligence startups over the past year.</p><h2>Future Outlook</h2><p>Experts expect investment activity to remain strong.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAhPouvBsP_e0U-MjvonEXVcDDf5WVpm-MC0LmYhkkslSNdj3sZS6z9DI&s=10',
    category_slug:  'technology',
    tags:           ['ai', 'technology', 'investment', 'innovation'],
    views_count:    25480,
    read_time:      5,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-15T07:00:00Z',
  },
  {
    title:          'New Robotics Breakthrough Announced',
    subtitle:       'Researchers unveil advanced autonomous systems',
    slug:           'new-robotics-breakthrough-announced',
    excerpt:        'Scientists have introduced a new generation of robots capable of performing complex tasks with greater accuracy.',
    content:        '<h2>Robotics Innovation</h2><p>A team of engineers has announced a breakthrough in robotics technology.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRblE3PU5cGIlzT8LsL1pQVjUw4ZbDPQT6aFRSIzA1qInZPmuWwqUCqLFZY&s=10',
    category_slug:  'technology',
    tags:           ['robotics', 'automation', 'technology'],
    views_count:    18340,
    read_time:      4,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-14T08:00:00Z',
  },
  {
    title:          'Cybersecurity Firms Warn of Rising Threats',
    subtitle:       'Organizations urged to strengthen digital defenses',
    slug:           'cybersecurity-firms-warn-of-rising-threats',
    excerpt:        'Cybersecurity experts have warned of increasing cyberattacks targeting businesses and government institutions worldwide.',
    content:        '<h2>Growing Risks</h2><p>Security analysts report a significant rise in ransomware and phishing campaigns.</p>',
    featured_image: 'https://www.commercialriskonline.com/wp-content/uploads/2023/11/Cyber-risk_2265273495.jpg',
    category_slug:  'technology',
    tags:           ['cybersecurity', 'technology', 'security'],
    views_count:    14790,
    read_time:      4,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    false,
    status:         'published',
    published_at:   '2025-01-13T10:00:00Z',
  },
  {
    title:          'Researchers Develop Advanced AI Model',
    subtitle:       'New system demonstrates improved reasoning abilities',
    slug:           'researchers-develop-advanced-ai-model',
    excerpt:        'A team of researchers has introduced an advanced AI model capable of handling more complex tasks with higher accuracy.',
    content:        '<h2>AI Research Progress</h2><p>The newly developed artificial intelligence model has demonstrated significant improvements in reasoning and problem-solving.</p>',
    featured_image: 'https://images.unsplash.com/photo-1675557009875-436f2fda4c22?w=800&auto=format&fit=crop',
    category_slug:  'technology',
    tags:           ['ai', 'research', 'technology'],
    views_count:    22870,
    read_time:      5,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-12T07:30:00Z',
  },

  // ── BUSINESS ───────────────────────────────────────────────────────────────

  {
    title:          'Global Markets Rally on Economic Optimism',
    subtitle:       'Investors respond positively to stronger growth forecasts',
    slug:           'global-markets-rally-on-economic-optimism',
    excerpt:        'Global stock markets moved higher as investors reacted to encouraging economic data and improved growth expectations.',
    content:        '<h2>Market Momentum</h2><p>Major stock indices posted gains after new economic reports indicated stronger-than-expected growth.</p>',
    featured_image: 'https://www.reuters.com/resizer/v2/5E5JV7PS2BKAVEWKYN4PWFD4HY.jpg?auth=b3bf5c7c81c969cc60d5a2b21760fff32b5f2801d7511862647d9e23d0bccd9f&width=1920&quality=80',
    category_slug:  'business',
    tags:           ['markets', 'economy', 'stocks', 'business'],
    views_count:    21450,
    read_time:      4,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-15T06:00:00Z',
  },
  {
    title:          'Investors Focus on Emerging Markets',
    subtitle:       'Capital flows increase toward developing economies',
    slug:           'investors-focus-on-emerging-markets',
    excerpt:        'Investors are showing renewed interest in emerging markets as growth opportunities attract global capital.',
    content:        '<h2>Emerging Opportunities</h2><p>Investment funds have increased exposure to developing economies amid expectations of stronger long-term growth.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg1y-x5ly14BTFOiuwl6VXcM8V0uGuUWnGftVr7DuwSigWuvdP0e5szhmk&s=10',
    category_slug:  'business',
    tags:           ['investment', 'markets', 'business', 'economy'],
    views_count:    19340,
    read_time:      4,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-13T08:00:00Z',
  },
  {
    title:          'Major Bank Announces Expansion Strategy',
    subtitle:       'New branches and digital services planned',
    slug:           'major-bank-announces-expansion-strategy',
    excerpt:        "One of the world's leading banks has unveiled an ambitious expansion plan focused on digital transformation.",
    content:        '<h2>Expansion Plans</h2><p>The bank announced plans to open new branches while increasing investment in online banking services.</p>',
    featured_image: 'https://media.nbcboston.com/2026/04/GettyImages-1251812399.jpg?quality=85&strip=all&resize=320%2C180',
    category_slug:  'business',
    tags:           ['banking', 'finance', 'business'],
    views_count:    14230,
    read_time:      3,
    is_breaking:    false,
    is_trending:    false,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-11T10:00:00Z',
  },

  // ── HEALTH ─────────────────────────────────────────────────────────────────

  {
    title:          'WHO Launches New Global Health Initiative',
    subtitle:       'Program aims to improve healthcare access worldwide',
    slug:           'who-launches-new-global-health-initiative',
    excerpt:        'The World Health Organization has announced a new initiative designed to expand healthcare access and strengthen medical systems globally.',
    content:        '<h2>Global Health Effort</h2><p>The World Health Organization unveiled a comprehensive health initiative focused on improving access to medical services.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSPW-AzrC1Jphzsi_IMlUD5CAqtAGLIHvX1pXHzxJtrEASkDE-vKIrC80&s=10',
    category_slug:  'health',
    tags:           ['health', 'who', 'global-health', 'medicine'],
    views_count:    21740,
    read_time:      5,
    is_breaking:    true,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-15T09:00:00Z',
  },
  {
    title:          'Medical Researchers Announce Breakthrough',
    subtitle:       'Scientists report promising new findings',
    slug:           'medical-researchers-announce-breakthrough',
    excerpt:        'Researchers have revealed a major medical breakthrough that could improve treatment options for patients worldwide.',
    content:        '<h2>Scientific Progress</h2><p>Medical researchers announced encouraging results from a new study.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtQWpQkBvKqbRgxsP78_QQ6393OIRRkci5JxipgVmZyYT8NJE4PpZzknyY&s=10',
    category_slug:  'health',
    tags:           ['research', 'medicine', 'health'],
    views_count:    18450,
    read_time:      4,
    is_breaking:    false,
    is_trending:    true,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-14T11:00:00Z',
  },
  {
    title:          'Healthcare Technology Improves Patient Outcomes',
    subtitle:       'Digital tools transform modern medical care',
    slug:           'healthcare-technology-improves-patient-outcomes',
    excerpt:        'Healthcare providers are increasingly using digital technologies to improve patient care and clinical efficiency.',
    content:        '<h2>Digital Healthcare</h2><p>Hospitals and clinics are adopting advanced digital tools that help physicians make faster and more accurate decisions.</p>',
    featured_image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPn-ImoC2Yd6vmK0sM5SBRrFXXd_z34xM0Bdw8LyN2Uw&s=10',
    category_slug:  'health',
    tags:           ['healthcare', 'technology', 'health'],
    views_count:    15210,
    read_time:      4,
    is_breaking:    false,
    is_trending:    false,
    is_featured:    true,
    status:         'published',
    published_at:   '2025-01-12T10:00:00Z',
  },
];

// ── Build full Article objects ─────────────────────────────────────────────────

export const mockArticles: Article[] = raw.map((a, index) => ({
  ...a,
  id:       index + 1,
  category: catMap[a.category_slug],
  author,
  created_at: a.published_at,
}));

// ── Helper selectors ──────────────────────────────────────────────────────────

export const getBreaking   = (): Article[] => mockArticles.filter((a) => a.is_breaking).slice(0, 5);
export const getTrending   = (): Article[] => mockArticles.filter((a) => a.is_trending).sort((a, b) => b.views_count - a.views_count).slice(0, 5);
export const getFeatured   = (): Article[] => mockArticles.filter((a) => a.is_featured).slice(0, 5);
export const getByCategory = (slug: string): Article[] => mockArticles.filter((a) => a.category?.slug === slug);
export const getLatest     = (n = 12): Article[] => [...mockArticles].sort((a, b) => new Date(b.published_at!).getTime() - new Date(a.published_at!).getTime()).slice(0, n);
