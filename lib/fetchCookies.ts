export function getCookies(): Record<string, string> {
    const pairs = document.cookie.split(';');
    const cookies: Record<string, string> = {};
  
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      const cookieName = pair[0].trim();
      const cookieValue = decodeURIComponent(pair.slice(1).join('='));
      cookies[cookieName] = cookieValue;
    }
  
    return cookies;
  }