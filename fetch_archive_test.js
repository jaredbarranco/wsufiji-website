const cheerio = require('cheerio');

async function testFetch(facetState = '') {
  // 1. Define the URLs
  const entryUrl = 'https://phigamarchives.historyit.com/search-interfaces/search/history/0/0/1/1/1';
  const targetBaseUrl = 'https://phigamarchives.historyit.com/search-interfaces/results/history/0/';

  // 2. Step 1: Fetch the HTML page to initialize the session
  const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  const pageResponse = await fetch(entryUrl, {
    headers: { 'User-Agent': userAgent }
  });

  // 3. Extract the Cookies
  const rawCookies = pageResponse.headers.get('set-cookie');
  
  // 4. Extract the CSRF Tokens using cheerio
  const html = await pageResponse.text();
  const $ = cheerio.load(html);
  const csrfToken = $('input[name="_csrfToken"]').val();
  const fieldsToken = $('input[name="_Token[fields]"]').val();

  // 5. Check if we got what we needed
  if (!csrfToken || !rawCookies) {
    throw new Error('Failed to extract tokens from target site');
  }

  // 6. Step 2: Fetch the actual JSON data
  const params = new URLSearchParams({
    '_csrfToken': csrfToken,
    '_Token[fields]': fieldsToken,
    'facetState': facetState,
    'ob': 'score',
    'o': 'desc',
    'ps': '24',
    'hideControlsOnLoad': '1'
  });

  const apiResponse = await fetch(`${targetBaseUrl}?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Cookie': rawCookies,
      'User-Agent': userAgent,
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': entryUrl
    }
  });

  // 7. Return the result
  const data = await apiResponse.text();
  return data;
}

if (require.main === module) {
  const facetState = process.argv[2] || '';
  testFetch(facetState).then(result => console.log(result)).catch(console.error);
}