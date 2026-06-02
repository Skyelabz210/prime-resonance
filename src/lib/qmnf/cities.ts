// Offline city gazetteer — ~250 major world cities with coordinates and
// standard (non-DST) UTC offset. Lets the birth form fill latitude,
// longitude, and timezone from a name search without any network call.
//
// Offsets are STANDARD time; users born during daylight-saving should add
// 1h (the form lets them adjust). Astrological house cusps need the true
// local clock offset, so we surface the standard value and let the user
// tweak — better than forcing a guess about historical DST rules.

export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  /** Standard UTC offset in hours. */
  tz: number;
}

// Curated for global coverage + the most-searched birth locations.
// Sorted roughly by region. Not exhaustive — a "nearest major city" set.
export const CITIES: readonly City[] = [
  // North America
  { name: "New York", country: "USA", lat: 40.7128, lon: -74.006, tz: -5 },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lon: -118.2437, tz: -8 },
  { name: "Chicago", country: "USA", lat: 41.8781, lon: -87.6298, tz: -6 },
  { name: "Houston", country: "USA", lat: 29.7604, lon: -95.3698, tz: -6 },
  { name: "Phoenix", country: "USA", lat: 33.4484, lon: -112.074, tz: -7 },
  { name: "Philadelphia", country: "USA", lat: 39.9526, lon: -75.1652, tz: -5 },
  { name: "San Antonio", country: "USA", lat: 29.4241, lon: -98.4936, tz: -6 },
  { name: "San Diego", country: "USA", lat: 32.7157, lon: -117.1611, tz: -8 },
  { name: "Dallas", country: "USA", lat: 32.7767, lon: -96.797, tz: -6 },
  { name: "San Jose", country: "USA", lat: 37.3382, lon: -121.8863, tz: -8 },
  { name: "Austin", country: "USA", lat: 30.2672, lon: -97.7431, tz: -6 },
  { name: "San Francisco", country: "USA", lat: 37.7749, lon: -122.4194, tz: -8 },
  { name: "Seattle", country: "USA", lat: 47.6062, lon: -122.3321, tz: -8 },
  { name: "Denver", country: "USA", lat: 39.7392, lon: -104.9903, tz: -7 },
  { name: "Boston", country: "USA", lat: 42.3601, lon: -71.0589, tz: -5 },
  { name: "Atlanta", country: "USA", lat: 33.749, lon: -84.388, tz: -5 },
  { name: "Miami", country: "USA", lat: 25.7617, lon: -80.1918, tz: -5 },
  { name: "Detroit", country: "USA", lat: 42.3314, lon: -83.0458, tz: -5 },
  { name: "Minneapolis", country: "USA", lat: 44.9778, lon: -93.265, tz: -6 },
  { name: "New Orleans", country: "USA", lat: 29.9511, lon: -90.0715, tz: -6 },
  { name: "Las Vegas", country: "USA", lat: 36.1699, lon: -115.1398, tz: -8 },
  { name: "Portland", country: "USA", lat: 45.5152, lon: -122.6784, tz: -8 },
  { name: "Honolulu", country: "USA", lat: 21.3069, lon: -157.8583, tz: -10 },
  { name: "Anchorage", country: "USA", lat: 61.2181, lon: -149.9003, tz: -9 },
  { name: "Washington DC", country: "USA", lat: 38.9072, lon: -77.0369, tz: -5 },
  { name: "Toronto", country: "Canada", lat: 43.6532, lon: -79.3832, tz: -5 },
  { name: "Montreal", country: "Canada", lat: 45.5017, lon: -73.5673, tz: -5 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lon: -123.1207, tz: -8 },
  { name: "Calgary", country: "Canada", lat: 51.0447, lon: -114.0719, tz: -7 },
  { name: "Ottawa", country: "Canada", lat: 45.4215, lon: -75.6972, tz: -5 },
  { name: "Mexico City", country: "Mexico", lat: 19.4326, lon: -99.1332, tz: -6 },
  { name: "Guadalajara", country: "Mexico", lat: 20.6597, lon: -103.3496, tz: -6 },
  { name: "Monterrey", country: "Mexico", lat: 25.6866, lon: -100.3161, tz: -6 },
  { name: "Tijuana", country: "Mexico", lat: 32.5149, lon: -117.0382, tz: -8 },
  { name: "Havana", country: "Cuba", lat: 23.1136, lon: -82.3666, tz: -5 },
  { name: "Guatemala City", country: "Guatemala", lat: 14.6349, lon: -90.5069, tz: -6 },
  { name: "San Juan", country: "Puerto Rico", lat: 18.4655, lon: -66.1057, tz: -4 },
  { name: "Santo Domingo", country: "Dominican Republic", lat: 18.4861, lon: -69.9312, tz: -4 },
  // South America
  { name: "São Paulo", country: "Brazil", lat: -23.5505, lon: -46.6333, tz: -3 },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lon: -43.1729, tz: -3 },
  { name: "Brasília", country: "Brazil", lat: -15.7939, lon: -47.8828, tz: -3 },
  { name: "Salvador", country: "Brazil", lat: -12.9777, lon: -38.5016, tz: -3 },
  { name: "Buenos Aires", country: "Argentina", lat: -34.6037, lon: -58.3816, tz: -3 },
  { name: "Córdoba", country: "Argentina", lat: -31.4201, lon: -64.1888, tz: -3 },
  { name: "Lima", country: "Peru", lat: -12.0464, lon: -77.0428, tz: -5 },
  { name: "Bogotá", country: "Colombia", lat: 4.711, lon: -74.0721, tz: -5 },
  { name: "Medellín", country: "Colombia", lat: 6.2442, lon: -75.5812, tz: -5 },
  { name: "Santiago", country: "Chile", lat: -33.4489, lon: -70.6693, tz: -4 },
  { name: "Caracas", country: "Venezuela", lat: 10.4806, lon: -66.9036, tz: -4 },
  { name: "Quito", country: "Ecuador", lat: -0.1807, lon: -78.4678, tz: -5 },
  { name: "La Paz", country: "Bolivia", lat: -16.4897, lon: -68.1193, tz: -4 },
  { name: "Montevideo", country: "Uruguay", lat: -34.9011, lon: -56.1645, tz: -3 },
  { name: "Asunción", country: "Paraguay", lat: -25.2637, lon: -57.5759, tz: -4 },
  // Europe
  { name: "London", country: "UK", lat: 51.5074, lon: -0.1278, tz: 0 },
  { name: "Manchester", country: "UK", lat: 53.4808, lon: -2.2426, tz: 0 },
  { name: "Birmingham", country: "UK", lat: 52.4862, lon: -1.8904, tz: 0 },
  { name: "Glasgow", country: "UK", lat: 55.8642, lon: -4.2518, tz: 0 },
  { name: "Dublin", country: "Ireland", lat: 53.3498, lon: -6.2603, tz: 0 },
  { name: "Paris", country: "France", lat: 48.8566, lon: 2.3522, tz: 1 },
  { name: "Marseille", country: "France", lat: 43.2965, lon: 5.3698, tz: 1 },
  { name: "Lyon", country: "France", lat: 45.764, lon: 4.8357, tz: 1 },
  { name: "Madrid", country: "Spain", lat: 40.4168, lon: -3.7038, tz: 1 },
  { name: "Barcelona", country: "Spain", lat: 41.3851, lon: 2.1734, tz: 1 },
  { name: "Valencia", country: "Spain", lat: 39.4699, lon: -0.3763, tz: 1 },
  { name: "Lisbon", country: "Portugal", lat: 38.7223, lon: -9.1393, tz: 0 },
  { name: "Porto", country: "Portugal", lat: 41.1579, lon: -8.6291, tz: 0 },
  { name: "Berlin", country: "Germany", lat: 52.52, lon: 13.405, tz: 1 },
  { name: "Munich", country: "Germany", lat: 48.1351, lon: 11.582, tz: 1 },
  { name: "Hamburg", country: "Germany", lat: 53.5511, lon: 9.9937, tz: 1 },
  { name: "Frankfurt", country: "Germany", lat: 50.1109, lon: 8.6821, tz: 1 },
  { name: "Cologne", country: "Germany", lat: 50.9375, lon: 6.9603, tz: 1 },
  { name: "Rome", country: "Italy", lat: 41.9028, lon: 12.4964, tz: 1 },
  { name: "Milan", country: "Italy", lat: 45.4642, lon: 9.19, tz: 1 },
  { name: "Naples", country: "Italy", lat: 40.8518, lon: 14.2681, tz: 1 },
  { name: "Turin", country: "Italy", lat: 45.0703, lon: 7.6869, tz: 1 },
  { name: "Amsterdam", country: "Netherlands", lat: 52.3676, lon: 4.9041, tz: 1 },
  { name: "Rotterdam", country: "Netherlands", lat: 51.9244, lon: 4.4777, tz: 1 },
  { name: "Brussels", country: "Belgium", lat: 50.8503, lon: 4.3517, tz: 1 },
  { name: "Vienna", country: "Austria", lat: 48.2082, lon: 16.3738, tz: 1 },
  { name: "Zurich", country: "Switzerland", lat: 47.3769, lon: 8.5417, tz: 1 },
  { name: "Geneva", country: "Switzerland", lat: 46.2044, lon: 6.1432, tz: 1 },
  { name: "Stockholm", country: "Sweden", lat: 59.3293, lon: 18.0686, tz: 1 },
  { name: "Oslo", country: "Norway", lat: 59.9139, lon: 10.7522, tz: 1 },
  { name: "Copenhagen", country: "Denmark", lat: 55.6761, lon: 12.5683, tz: 1 },
  { name: "Helsinki", country: "Finland", lat: 60.1699, lon: 24.9384, tz: 2 },
  { name: "Warsaw", country: "Poland", lat: 52.2297, lon: 21.0122, tz: 1 },
  { name: "Kraków", country: "Poland", lat: 50.0647, lon: 19.945, tz: 1 },
  { name: "Prague", country: "Czechia", lat: 50.0755, lon: 14.4378, tz: 1 },
  { name: "Budapest", country: "Hungary", lat: 47.4979, lon: 19.0402, tz: 1 },
  { name: "Bucharest", country: "Romania", lat: 44.4268, lon: 26.1025, tz: 2 },
  { name: "Athens", country: "Greece", lat: 37.9838, lon: 23.7275, tz: 2 },
  { name: "Sofia", country: "Bulgaria", lat: 42.6977, lon: 23.3219, tz: 2 },
  { name: "Belgrade", country: "Serbia", lat: 44.7866, lon: 20.4489, tz: 1 },
  { name: "Zagreb", country: "Croatia", lat: 45.815, lon: 15.9819, tz: 1 },
  { name: "Kyiv", country: "Ukraine", lat: 50.4501, lon: 30.5234, tz: 2 },
  { name: "Moscow", country: "Russia", lat: 55.7558, lon: 37.6173, tz: 3 },
  { name: "Saint Petersburg", country: "Russia", lat: 59.9311, lon: 30.3609, tz: 3 },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lon: 28.9784, tz: 3 },
  { name: "Ankara", country: "Turkey", lat: 39.9334, lon: 32.8597, tz: 3 },
  { name: "Reykjavik", country: "Iceland", lat: 64.1466, lon: -21.9426, tz: 0 },
  // Middle East
  { name: "Dubai", country: "UAE", lat: 25.2048, lon: 55.2708, tz: 4 },
  { name: "Abu Dhabi", country: "UAE", lat: 24.4539, lon: 54.3773, tz: 4 },
  { name: "Riyadh", country: "Saudi Arabia", lat: 24.7136, lon: 46.6753, tz: 3 },
  { name: "Jeddah", country: "Saudi Arabia", lat: 21.4858, lon: 39.1925, tz: 3 },
  { name: "Tel Aviv", country: "Israel", lat: 32.0853, lon: 34.7818, tz: 2 },
  { name: "Jerusalem", country: "Israel", lat: 31.7683, lon: 35.2137, tz: 2 },
  { name: "Tehran", country: "Iran", lat: 35.6892, lon: 51.389, tz: 3.5 },
  { name: "Baghdad", country: "Iraq", lat: 33.3152, lon: 44.3661, tz: 3 },
  { name: "Beirut", country: "Lebanon", lat: 33.8938, lon: 35.5018, tz: 2 },
  { name: "Amman", country: "Jordan", lat: 31.9454, lon: 35.9284, tz: 2 },
  { name: "Doha", country: "Qatar", lat: 25.2854, lon: 51.531, tz: 3 },
  { name: "Kuwait City", country: "Kuwait", lat: 29.3759, lon: 47.9774, tz: 3 },
  // Africa
  { name: "Cairo", country: "Egypt", lat: 30.0444, lon: 31.2357, tz: 2 },
  { name: "Alexandria", country: "Egypt", lat: 31.2001, lon: 29.9187, tz: 2 },
  { name: "Lagos", country: "Nigeria", lat: 6.5244, lon: 3.3792, tz: 1 },
  { name: "Abuja", country: "Nigeria", lat: 9.0765, lon: 7.3986, tz: 1 },
  { name: "Kinshasa", country: "DR Congo", lat: -4.4419, lon: 15.2663, tz: 1 },
  { name: "Johannesburg", country: "South Africa", lat: -26.2041, lon: 28.0473, tz: 2 },
  { name: "Cape Town", country: "South Africa", lat: -33.9249, lon: 18.4241, tz: 2 },
  { name: "Durban", country: "South Africa", lat: -29.8587, lon: 31.0218, tz: 2 },
  { name: "Nairobi", country: "Kenya", lat: -1.2921, lon: 36.8219, tz: 3 },
  { name: "Addis Ababa", country: "Ethiopia", lat: 9.03, lon: 38.74, tz: 3 },
  { name: "Accra", country: "Ghana", lat: 5.6037, lon: -0.187, tz: 0 },
  { name: "Casablanca", country: "Morocco", lat: 33.5731, lon: -7.5898, tz: 1 },
  { name: "Marrakesh", country: "Morocco", lat: 31.6295, lon: -7.9811, tz: 1 },
  { name: "Tunis", country: "Tunisia", lat: 36.8065, lon: 10.1815, tz: 1 },
  { name: "Algiers", country: "Algeria", lat: 36.7372, lon: 3.0865, tz: 1 },
  { name: "Dakar", country: "Senegal", lat: 14.7167, lon: -17.4677, tz: 0 },
  { name: "Dar es Salaam", country: "Tanzania", lat: -6.7924, lon: 39.2083, tz: 3 },
  { name: "Khartoum", country: "Sudan", lat: 15.5007, lon: 32.5599, tz: 2 },
  { name: "Harare", country: "Zimbabwe", lat: -17.8252, lon: 31.0335, tz: 2 },
  { name: "Luanda", country: "Angola", lat: -8.839, lon: 13.2894, tz: 1 },
  // South Asia
  { name: "Mumbai", country: "India", lat: 19.076, lon: 72.8777, tz: 5.5 },
  { name: "Delhi", country: "India", lat: 28.7041, lon: 77.1025, tz: 5.5 },
  { name: "Bangalore", country: "India", lat: 12.9716, lon: 77.5946, tz: 5.5 },
  { name: "Hyderabad", country: "India", lat: 17.385, lon: 78.4867, tz: 5.5 },
  { name: "Chennai", country: "India", lat: 13.0827, lon: 80.2707, tz: 5.5 },
  { name: "Kolkata", country: "India", lat: 22.5726, lon: 88.3639, tz: 5.5 },
  { name: "Pune", country: "India", lat: 18.5204, lon: 73.8567, tz: 5.5 },
  { name: "Ahmedabad", country: "India", lat: 23.0225, lon: 72.5714, tz: 5.5 },
  { name: "Jaipur", country: "India", lat: 26.9124, lon: 75.7873, tz: 5.5 },
  { name: "Karachi", country: "Pakistan", lat: 24.8607, lon: 67.0011, tz: 5 },
  { name: "Lahore", country: "Pakistan", lat: 31.5204, lon: 74.3587, tz: 5 },
  { name: "Islamabad", country: "Pakistan", lat: 33.6844, lon: 73.0479, tz: 5 },
  { name: "Dhaka", country: "Bangladesh", lat: 23.8103, lon: 90.4125, tz: 6 },
  { name: "Kathmandu", country: "Nepal", lat: 27.7172, lon: 85.324, tz: 5.75 },
  { name: "Colombo", country: "Sri Lanka", lat: 6.9271, lon: 79.8612, tz: 5.5 },
  { name: "Kabul", country: "Afghanistan", lat: 34.5553, lon: 69.2075, tz: 4.5 },
  // East + Southeast Asia
  { name: "Tokyo", country: "Japan", lat: 35.6762, lon: 139.6503, tz: 9 },
  { name: "Osaka", country: "Japan", lat: 34.6937, lon: 135.5023, tz: 9 },
  { name: "Yokohama", country: "Japan", lat: 35.4437, lon: 139.638, tz: 9 },
  { name: "Nagoya", country: "Japan", lat: 35.1815, lon: 136.9066, tz: 9 },
  { name: "Sapporo", country: "Japan", lat: 43.0618, lon: 141.3545, tz: 9 },
  { name: "Seoul", country: "South Korea", lat: 37.5665, lon: 126.978, tz: 9 },
  { name: "Busan", country: "South Korea", lat: 35.1796, lon: 129.0756, tz: 9 },
  { name: "Beijing", country: "China", lat: 39.9042, lon: 116.4074, tz: 8 },
  { name: "Shanghai", country: "China", lat: 31.2304, lon: 121.4737, tz: 8 },
  { name: "Guangzhou", country: "China", lat: 23.1291, lon: 113.2644, tz: 8 },
  { name: "Shenzhen", country: "China", lat: 22.5431, lon: 114.0579, tz: 8 },
  { name: "Chengdu", country: "China", lat: 30.5728, lon: 104.0668, tz: 8 },
  { name: "Hong Kong", country: "China", lat: 22.3193, lon: 114.1694, tz: 8 },
  { name: "Taipei", country: "Taiwan", lat: 25.033, lon: 121.5654, tz: 8 },
  { name: "Bangkok", country: "Thailand", lat: 13.7563, lon: 100.5018, tz: 7 },
  { name: "Singapore", country: "Singapore", lat: 1.3521, lon: 103.8198, tz: 8 },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lon: 101.6869, tz: 8 },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lon: 106.8456, tz: 7 },
  { name: "Surabaya", country: "Indonesia", lat: -7.2575, lon: 112.7521, tz: 7 },
  { name: "Bali (Denpasar)", country: "Indonesia", lat: -8.6705, lon: 115.2126, tz: 8 },
  { name: "Manila", country: "Philippines", lat: 14.5995, lon: 120.9842, tz: 8 },
  { name: "Ho Chi Minh City", country: "Vietnam", lat: 10.8231, lon: 106.6297, tz: 7 },
  { name: "Hanoi", country: "Vietnam", lat: 21.0285, lon: 105.8542, tz: 7 },
  { name: "Yangon", country: "Myanmar", lat: 16.8409, lon: 96.1735, tz: 6.5 },
  { name: "Phnom Penh", country: "Cambodia", lat: 11.5564, lon: 104.9282, tz: 7 },
  { name: "Almaty", country: "Kazakhstan", lat: 43.222, lon: 76.8512, tz: 6 },
  { name: "Tashkent", country: "Uzbekistan", lat: 41.2995, lon: 69.2401, tz: 5 },
  // Oceania
  { name: "Sydney", country: "Australia", lat: -33.8688, lon: 151.2093, tz: 10 },
  { name: "Melbourne", country: "Australia", lat: -37.8136, lon: 144.9631, tz: 10 },
  { name: "Brisbane", country: "Australia", lat: -27.4698, lon: 153.0251, tz: 10 },
  { name: "Perth", country: "Australia", lat: -31.9505, lon: 115.8605, tz: 8 },
  { name: "Adelaide", country: "Australia", lat: -34.9285, lon: 138.6007, tz: 9.5 },
  { name: "Auckland", country: "New Zealand", lat: -36.8485, lon: 174.7633, tz: 12 },
  { name: "Wellington", country: "New Zealand", lat: -41.2865, lon: 174.7762, tz: 12 },
];

/** Case-insensitive substring search over name + country, ranked by
 *  prefix match then population proxy (input order). Returns up to `limit`. */
export function searchCities(query: string, limit = 8): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const starts: City[] = [];
  const contains: City[] = [];
  for (const c of CITIES) {
    const name = c.name.toLowerCase();
    if (name.startsWith(q)) starts.push(c);
    else if (name.includes(q) || c.country.toLowerCase().includes(q)) contains.push(c);
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}
