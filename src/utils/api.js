import axios from 'axios';

const BASE = '/api/youtube';
const SUPPORTED_REGIONS = new Set(['DZ','AR','AU','AT','AZ','BH','BD','BY','BE','BO','BA','BR','BG','KH','CA','CL','CO','CR','HR','CY','CZ','DK','DO','EC','EG','SV','EE','FI','FR','GE','DE','GH','GR','GT','HN','HK','HU','IS','IN','ID','IQ','IE','IL','IT','JM','JP','JO','KZ','KE','KW','LV','LB','LY','LI','LT','LU','MY','MT','MX','ME','MA','NP','NL','NZ','NI','NG','MK','NO','OM','PK','PA','PG','PY','PE','PH','PL','PT','PR','QA','RO','RU','SA','SN','RS','SG','SK','SI','ZA','KR','ES','LK','SE','CH','TW','TZ','TH','TN','TR','UG','UA','AE','GB','US','UY','VE','VN','YE','ZW']);
const REGION_FALLBACK = { RW:'UG', BI:'UG', CD:'UG', MG:'ZA', CM:'NG', CI:'GH', ET:'KE' };
const cache = new Map();
const CACHE_TTL = 120000;
function getSafeRegion(region) { if (!region) return 'US'; const upper = region.toUpperCase(); return SUPPORTED_REGIONS.has(upper) ? upper : (REGION_FALLBACK[upper] || 'US'); }
export function clearApiCache() { cache.clear(); }
export async function ytApi(endpoint, params = {}, useCache = true) {
  const cacheKey = `${endpoint}:${JSON.stringify(params)}`;
  if (useCache && cache.has(cacheKey)) { const cached = cache.get(cacheKey); if (Date.now() - cached.time < CACHE_TTL) return cached.data; cache.delete(cacheKey); }
  try {
    const res = await axios.get(BASE, { params: { endpoint, ...params }, timeout: 15000 });
    if (res.data) cache.set(cacheKey, { data: res.data, time: Date.now() });
    return res.data || null;
  } catch (err) {
    const message = err?.response?.data?.error || err.message || 'YouTube request failed';
    console.warn(`YT API [${endpoint}]:`, message);
    if (params.regionCode && params.regionCode !== 'US' && /region/i.test(String(message))) {
      try { const retry = await axios.get(BASE, { params: { endpoint, ...params, regionCode: 'US' }, timeout: 15000 }); if (retry.data) return retry.data; } catch {}
    }
    return null;
  }
}
export async function getVideoDetails(ids) { if (!ids?.length) return []; const results=[]; for(let i=0;i<ids.length;i+=50){const data=await ytApi('videos',{part:'snippet,statistics,contentDetails',id:ids.slice(i,i+50).join(',')}); if(data?.items) results.push(...data.items);} return results; }
export async function searchVideos(query,maxResults=25,pageToken='',useCache=true){if(!query?.trim())return null;const p={part:'snippet',q:query.trim(),type:'video',maxResults:Math.min(maxResults,50),order:'relevance',safeSearch:'none'};if(pageToken)p.pageToken=pageToken;return ytApi('search',p,useCache);}
export async function searchVideosFull(query,maxResults=25,pageToken=''){const data=await searchVideos(query,maxResults,pageToken);if(!data?.items?.length)return{videos:[],nextPageToken:null};const ids=data.items.map(i=>i.id?.videoId).filter(Boolean);const details=await getVideoDetails(ids);const map=new Map(details.map(d=>[d.id,d]));return{videos:ids.map(id=>map.get(id)).filter(Boolean),nextPageToken:data.nextPageToken||null};}
export async function searchShorts(query,maxResults=15,pageToken=''){if(!query?.trim())return{items:[]};const p={part:'snippet',q:`${query.trim()} #shorts`,type:'video',videoDuration:'short',maxResults:Math.min(maxResults,50),order:'relevance',safeSearch:'none'};if(pageToken)p.pageToken=pageToken;return ytApi('search',p);}
export async function searchChannels(query,maxResults=5){if(!query?.trim())return{items:[]};return ytApi('search',{part:'snippet',q:query.trim(),type:'channel',maxResults});}
export async function getPopularVideos(regionCode='US',maxResults=50,pageToken='',categoryId='',useCache=true){const p={part:'snippet,statistics,contentDetails',chart:'mostPopular',regionCode:getSafeRegion(regionCode),maxResults:Math.min(maxResults,50)};if(pageToken)p.pageToken=pageToken;if(categoryId)p.videoCategoryId=categoryId;return ytApi('videos',p,useCache);}
export async function getShorts(query='trending shorts',maxResults=24,regionCode='US',pageToken=''){const p={part:'snippet',q:query,type:'video',videoDuration:'short',maxResults,order:'viewCount',regionCode:getSafeRegion(regionCode)};if(pageToken)p.pageToken=pageToken;return ytApi('search',p);}
export async function getChannelInfo(channelId){if(!channelId)return null;return ytApi('channels',{part:'snippet,statistics,brandingSettings',id:channelId});}
export async function getChannelVideos(channelId,maxResults=12){if(!channelId)return null;return ytApi('search',{part:'snippet',channelId,type:'video',order:'date',maxResults});}
export async function getSuggestions(query){if(!query?.trim())return{items:[]};return ytApi('search',{part:'snippet',q:query.trim(),type:'video',maxResults:7});}
