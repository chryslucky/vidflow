import localforage from 'localforage';
localforage.config({ name:'VidFlow', storeName:'vidflow_data' });
const KEYS={USER:'vf_user_v3',PLAYLISTS:'vf_playlists_v3',BG_SETTINGS:'vf_bg_settings',WATCHED:'vf_watched',VIDEO_STATES:'vf_video_states',SAVED:'vf_saved_videos_v1',BG_IMAGES:'vf_bg_images'};
export function getUser(){try{const d=localStorage.getItem(KEYS.USER);return d?JSON.parse(d):null;}catch{return null;}}
export function saveUser(user){try{localStorage.setItem(KEYS.USER,JSON.stringify(user));}catch{}}
export function getPlaylists(){try{const d=localStorage.getItem(KEYS.PLAYLISTS);return d?JSON.parse(d):[];}catch{return[];}}
export function savePlaylists(pl){try{localStorage.setItem(KEYS.PLAYLISTS,JSON.stringify(pl));}catch{}}
export function getBgSettings(){try{const d=localStorage.getItem(KEYS.BG_SETTINGS);return d?JSON.parse(d):{type:'none',value:null,slideshow:false,interval:8};}catch{return{type:'none',value:null,slideshow:false,interval:8};}}
export function saveBgSettings(settings){try{localStorage.setItem(KEYS.BG_SETTINGS,JSON.stringify(settings));}catch{}}
export function getVideoStates(){try{const d=localStorage.getItem(KEYS.VIDEO_STATES);return d?JSON.parse(d):{};}catch{return{};}}
export function saveVideoState(videoId,time){try{const states=getVideoStates();states[videoId]={time,updated:Date.now()};const entries=Object.entries(states).sort((a,b)=>b[1].updated-a[1].updated).slice(0,100);localStorage.setItem(KEYS.VIDEO_STATES,JSON.stringify(Object.fromEntries(entries)));}catch{}}
export function getVideoState(videoId){return getVideoStates()[videoId]?.time||0;}
export function getWatched(){try{return parseInt(localStorage.getItem(KEYS.WATCHED)||'0',10);}catch{return 0;}}
export function incWatched(){const n=getWatched()+1;try{localStorage.setItem(KEYS.WATCHED,String(n));}catch{}return n;}
export async function getBgImages(){try{return(await localforage.getItem(KEYS.BG_IMAGES))||[];}catch{return[];}}
export async function saveBgImage(imageData){try{const imgs=await getBgImages();imgs.push({id:Date.now(),data:imageData});await localforage.setItem(KEYS.BG_IMAGES,imgs);return imgs;}catch{return[];}}
export async function removeBgImage(id){try{const imgs=await getBgImages();const filtered=imgs.filter(i=>i.id!==id);await localforage.setItem(KEYS.BG_IMAGES,filtered);return filtered;}catch{return[];}}
export async function clearBgImages(){try{await localforage.removeItem(KEYS.BG_IMAGES);}catch{}}
export async function getSavedVideos(){try{return(await localforage.getItem(KEYS.SAVED))||[];}catch{return[];}}
export async function saveSavedVideo(video){try{const list=await getSavedVideos();if(list.some(v=>v.videoId===video.videoId))return list;const updated=[{...video,savedAt:Date.now()},...list].slice(0,500);await localforage.setItem(KEYS.SAVED,updated);return updated;}catch{return[];}}
export async function removeSavedVideo(videoId){try{const list=await getSavedVideos();const updated=list.filter(v=>v.videoId!==videoId);await localforage.setItem(KEYS.SAVED,updated);return updated;}catch{return[];}}

export const getDownloaded = getSavedVideos;
export const saveDownloaded = saveSavedVideo;
export const removeDownloaded = removeSavedVideo;
