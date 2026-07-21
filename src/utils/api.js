import axios from 'axios';

const API_KEY = 'AIzaSyCJ8Zyto23dvlM0o9IK8TmUrFBvKPinDz8';
const BASE = 'https://www.googleapis.com/youtube/v3';

const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

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
    console.warn(`YT API [${endpoint}]:`, err?.response?.data?.error?.message || err.message);
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

export async function searchVideos(query, maxResults = 20, pageToken = '', useCache = true) {
  const params = {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults,
    order: 'relevance',
  };
  if (pageToken) params.pageToken = pageToken;
  return ytApi('search', params, useCache);
}

export async function getPopularVideos(regionCode = 'US', maxResults = 50, pageToken = '', categoryId = '', useCache = true) {
  const params = {
    part: 'snippet,statistics,contentDetails',
    chart: 'mostPopular',
    regionCode,
    maxResults,
  };
  if (pageToken) params.pageToken = pageToken;
  if (categoryId) params.videoCategoryId = categoryId;
  return ytApi('videos', params, useCache);
}

export async function getShorts(query = 'trending shorts', maxResults = 24, regionCode = 'US', pageToken = '') {
  const params = {
    part: 'snippet',
    q: query,
    type: 'video',
    videoDuration: 'short',
    maxResults,
    order: 'viewCount',
    regionCode,
  };
  if (pageToken) params.pageToken = pageToken;
  return ytApi('search', params);
}

export async function getChannelInfo(channelId) {
  return ytApi('channels', {
    part: 'snippet,statistics,brandingSettings',
    id: channelId,
  });
}

export async function getChannelVideos(channelId, maxResults = 12) {
  return ytApi('search', {
    part: 'snippet',
    channelId,
    type: 'video',
    order: 'date',
    maxResults,
  });
}

export async function getSuggestions(query) {
  return ytApi('search', {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: 7,
  });
}