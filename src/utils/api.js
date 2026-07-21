import axios from 'axios';

const API_KEY = 'AIzaSyCJ8Zyto23dvlM0o9IK8TmUrFBvKPinDz8';
const BASE = 'https://www.googleapis.com/youtube/v3';

// YouTube mostPopular chart supported regions
const SUPPORTED_REGIONS = new Set([
  'DZ','AR','AU','AT','AZ','BH','BD','BY','BE','BO','BA','BR','BG','KH','CA','CL',
  'CO','CR','HR','CY','CZ','DK','DO','EC','EG','SV','EE','FI','FR','GE','DE','GH',
  'GR','GT','HN','HK','HU','IS','IN','ID','IQ','IE','IL','IT','JM','JP','JO','KZ',
  'KE','KW','LV','LB','LY','LI','LT','LU','MY','MT','MX','ME','MA','NP','NL','NZ',
  'NI','NG','MK','NO','OM','PK','PA','PG','PY','PE','PH','PL','PT','PR','QA','RO',
  'RU','SA','SN','RS','SG','SK','SI','ZA','KR','ES','LK','SE','CH','TW','TZ','TH',
  'TN','TR','UG','UA','AE','GB','US','UY','VE','VN','YE','ZW'
]);

// Fallback region if user's region isn't supported
const REGION_FALLBACK = {
  'RW': 'UG', // Rwanda -> Uganda
  'BI': 'UG', // Burundi -> Uganda
  'CD': 'UG', // DR Congo -> Uganda
  'MG': 'ZA', // Madagascar -> South Africa
  'CM': 'NG', // Cameroon -> Nigeria
  'CI': 'GH', // Ivory Coast -> Ghana
  'ET': 'KE', // Ethiopia -> Kenya
};

function getSafeRegion(region) {
  if (!region) return 'US';
  const upper = region.toUpperCase();
  if (SUPPORTED_REGIONS.has(upper)) return upper;
  if (REGION_FALLBACK[upper]) return REGION_FALLBACK[upper];
  return 'US';
}

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export function clearApiCache() { cache.clear(); }

export async function ytApi(endpoint, params = {}, useCache = true) {
  params.key = API_KEY;
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;

  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (Date.now() - cached.time < CACHE_TTL) return cached.data;
  }

  try {
    const res = await axios.get(`${BASE}/${endpoint}`, { params, timeout: 15000 });
    if (res.data) {
      cache.set(cacheKey, { data: res.data, time: Date.now() });
      return res.data;
    }
    return null;
  } catch (err) {
    const errMsg = err?.response?.data?.error?.message || err.message;
    console.warn(`YT API [${endpoint}]:`, errMsg);
    
    // Auto-retry with US region if region-related error
    if (params.regionCode && params.regionCode !== 'US' && errMsg.toLowerCase().includes('region')) {
      console.log('Retrying with US region...');
      const retryParams = { ...params, regionCode: 'US' };
      try {
        const retry = await axios.get(`${BASE}/${endpoint}`, { params: retryParams, timeout: 15000 });
        if (retry.data) {
          cache.set(cacheKey, { data: retry.data, time: Date.now() });
          return retry.data;
        }
      } catch (retryErr) {
        console.warn('Retry also failed:', retryErr.message);
      }
    }
    return null;
  }
}

export async function getVideoDetails(ids) {
  if (!ids || !ids.length) return [];
  const results = [];
  for (let i = 0; i < ids.length; i += 50) {
    const chunk = ids.slice(i, i + 50);
    const data = await ytApi('videos', {
      part: 'snippet,statistics,contentDetails',
      id: chunk.join(','),
    });
    if (data?.items) results.push(...data.items);
  }
  return results;
}

export async function searchVideos(query, maxResults = 25, pageToken = '', useCache = true) {
  if (!query || !query.trim()) return null;
  const params = {
    part: 'snippet',
    q: query.trim(),
    type: 'video',
    maxResults: Math.min(maxResults, 50),
    order: 'relevance',
    safeSearch: 'none',
  };
  if (pageToken) params.pageToken = pageToken;
  return ytApi('search', params, useCache);
}

export async function searchVideosFull(query, maxResults = 25, pageToken = '') {
  const searchData = await searchVideos(query, maxResults, pageToken, false);
  if (!searchData?.items?.length) return { videos: [], nextPageToken: null };

  const ids = searchData.items.map(i => i.id?.videoId).filter(Boolean);
  if (!ids.length) return { videos: [], nextPageToken: searchData.nextPageToken };

  const details = await getVideoDetails(ids);
  const detailsMap = new Map(details.map(d => [d.id, d]));
  const ordered = ids.map(id => detailsMap.get(id)).filter(Boolean);

  return {
    videos: ordered,
    nextPageToken: searchData.nextPageToken || null
  };
}

export async function searchShorts(query, maxResults = 15, pageToken = '') {
  if (!query || !query.trim()) return { items: [] };
  const params = {
    part: 'snippet',
    q: query.trim() + ' #shorts',
    type: 'video',
    videoDuration: 'short',
    maxResults: Math.min(maxResults, 50),
    order: 'relevance',
    safeSearch: 'none',
  };
  if (pageToken) params.pageToken = pageToken;
  return ytApi('search', params, false);
}

export async function searchChannels(query, maxResults = 5) {
  if (!query || !query.trim()) return { items: [] };
  return ytApi('search', {
    part: 'snippet',
    q: query.trim(),
    type: 'channel',
    maxResults,
  }, false);
}

export async function getPopularVideos(regionCode = 'US', maxResults = 50, pageToken = '', categoryId = '', useCache = true) {
  const safeRegion = getSafeRegion(regionCode);
  const params = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode: safeRegion,
    maxResults,
  };
  if (pageToken) params.pageToken = pageToken;
  if (categoryId) params.videoCategoryId = categoryId;
  return ytApi('videos', params, useCache);
}

export async function getShorts(query = 'trending shorts', maxResults = 24, regionCode = 'US', pageToken = '') {
  const safeRegion = getSafeRegion(regionCode);
  const params = {
    part: 'snippet',
    q: query,
    type: 'video',
    videoDuration: 'short',
    maxResults,
    order: 'viewCount',
    regionCode: safeRegion,
  };
  if (pageToken) params.pageToken = pageToken;
  return ytApi('search', params);
}

export async function getChannelInfo(channelId) {
  if (!channelId) return null;
  return ytApi('channels', {
    part: 'snippet,statistics,brandingSettings',
    id: channelId,
  });
}

export async function getChannelVideos(channelId, maxResults = 12) {
  if (!channelId) return null;
  return ytApi('search', {
    part: 'snippet',
    channelId,
    type: 'video',
    order: 'date',
    maxResults,
  });
}

export async function getSuggestions(query) {
  if (!query || !query.trim()) return { items: [] };
  return ytApi('search', {
    part: 'snippet',
    q: query.trim(),
    type: 'video',
    maxResults: 7,
  });
}