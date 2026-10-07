import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getPopularVideos, getShorts, searchVideosFull, clearApiCache } from '../utils/api';
import { getVideoId, getGreeting, getThumb } from '../utils/helpers';
import { FiPlay, FiZap, FiHeart, FiMusic, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { HiOutlineFire } from 'react-icons/hi2';
import HeroSlider from '../components/HeroSlider';
import VideoCard from '../components/VideoCard';
import SkeletonGrid from '../components/SkeletonGrid';

export default function HomePage({ refreshTrigger }) {
  const { user, handlePlay, handleSave, setChannelId, setShortsModal } = useApp();
  const [popular, setPopular] = useState([]);
  const [shorts, setShorts] = useState([]);
  const [forYou, setForYou] = useState([]);
  const [musicVids, setMusicVids] = useState([]);
  const [heroVideos, setHeroVideos] = useState([]);
  const [pageToken, setPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [popularLoading, setPopularLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadedRef = useRef(false);
  const loadingMoreRef = useRef(false);
  const pageTokenRef = useRef(null);

  const loadContent = useCallback(async (forceRefresh = false) => {
    if (loadedRef.current && !forceRefresh) return;
    loadedRef.current = true;

    if (forceRefresh) clearApiCache();

    const u = user || {};
    setPopularLoading(true);
    setPopular([]);
    setHasMore(true);

    // Load first 50
    const pop1 = await getPopularVideos(u?.country || 'US', 50, '', '', !forceRefresh);
    if (pop1?.items && pop1.items.length) {
      setPopular(pop1.items);

      const heroItems = [...pop1.items]
        .filter(v => v.statistics?.viewCount)
        .sort((a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount))
        .slice(0, 5);
      setHeroVideos(heroItems.length ? heroItems : pop1.items.slice(0, 5));

      const nextToken1 = pop1.nextPageToken || null;
      setPageToken(nextToken1);
      pageTokenRef.current = nextToken1;
      setPopularLoading(false);

      // Remaining pages are loaded by the infinite-scroll handler on demand.

    } else {
      setPopularLoading(false);
      setHasMore(false);
    }

    // Load other sections
    const interest = u?.interests?.[Math.floor(Math.random() * (u?.interests?.length || 1))] || 'trending';
    const sh = await getShorts(interest + ' shorts', 24, u?.country || 'US');
    if (sh?.items) setShorts(sh.items);

    const fyQ = u?.interests?.[Math.floor(Math.random() * (u?.interests?.length || 1))] || 'popular';
    const fyData = await searchVideosFull(fyQ, 12);
    if (fyData?.videos) setForYou(fyData.videos);

    const mData = await getPopularVideos(u?.country || 'US', 12, '', '10', !forceRefresh);
    if (mData?.items) setMusicVids(mData.items);
  }, [user]);

  useEffect(() => {
    const timer = setTimeout(() => loadContent(), 0);
    return () => clearTimeout(timer);
  }, [loadContent]);

  useEffect(() => {
    if (refreshTrigger > 0) {
      loadedRef.current = false;
      loadContent(true);
    }
  }, [refreshTrigger, loadContent]);

  // FIXED Infinite scroll
  const loadMore = useCallback(async () => {
    const token = pageTokenRef.current;
    if (loadingMoreRef.current || !token) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    // Load 100 more (2 batches of 50)
    const data = await getPopularVideos(user?.country || 'US', 50, token);
    if (data?.items && data.items.length) {
      setPopular(prev => [...prev, ...data.items]);
      const nextToken = data.nextPageToken;
      if (nextToken) {
        const data2 = await getPopularVideos(user?.country || 'US', 50, nextToken);
        if (data2?.items && data2.items.length) {
          setPopular(prev => [...prev, ...data2.items]);
          const finalToken = data2.nextPageToken || null;
          setPageToken(finalToken);
          pageTokenRef.current = finalToken;
          if (!finalToken) setHasMore(false);
        } else {
          setPageToken(nextToken);
          pageTokenRef.current = nextToken;
        }
      } else {
        setPageToken(null);
        pageTokenRef.current = null;
        setHasMore(false);
      }
    } else {
      setPageToken(null);
      pageTokenRef.current = null;
      setHasMore(false);
    }

    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [user]);

  useEffect(() => {
    const handler = () => {
      if (loadingMoreRef.current || !pageTokenRef.current) return;
      const scrollPos = window.innerHeight + window.scrollY;
      const threshold = document.body.offsetHeight - 1000;
      if (scrollPos >= threshold) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [loadMore]);

  const scrollShorts = (dir) => {
    const el = document.getElementById('shortsRow');
    el?.scrollBy({ left: dir * 300, behavior: 'smooth' });
  };

  return (
    <>
      {heroVideos.length > 0 && (
        <HeroSlider videos={heroVideos} onPlay={handlePlay} onSave={handleSave} />
      )}

      <div className="mb-8 animate-slideUp">
        <h2 className="text-2xl sm:text-3xl font-black font-display">
          {getGreeting()}, <span className="text-gradient">{user?.name || 'Explorer'}</span>
        </h2>
        <p className="text-vf-gray text-sm mt-1">Fresh picks curated just for you</p>
      </div>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 font-display">
            <HiOutlineFire className="text-vf-red" size={24} /> Most Popular
          </h3>
          <span className="text-xs text-vf-gray">{popular.length} videos</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {popularLoading ? <SkeletonGrid count={8} /> :
            popular.map((v, i) => (
              <VideoCard key={`pop-${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
            ))
          }
        </div>
      </section>

      {shorts.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-5 font-display">
            <FiZap className="text-vf-red" size={22} /> Shorts
          </h3>
          <div className="relative group/s">
            <button onClick={() => scrollShorts(-1)}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-black/80 backdrop-blur hover:bg-vf-red rounded-full flex items-center justify-center transition-colors -ml-3 opacity-0 group-hover/s:opacity-100 border border-white/10">
              <FiChevronLeft size={20} />
            </button>
            <div id="shortsRow" className="hscroll flex gap-4 px-1 pb-2">
              {shorts.map((s, i) => (
                <div key={i} className="flex-shrink-0 w-[170px] sm:w-[190px] cursor-pointer group animate-cardIn"
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => setShortsModal({ shorts, startIndex: i })}>
                  <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-vf-card shadow-lg transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-red-900/30 group-hover:scale-[1.03]">
                    <img src={getThumb(s.snippet, 'high')}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 no-drag" loading="lazy" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-xs font-bold line-clamp-2 leading-tight">{s.snippet?.title}</p>
                      <p className="text-[10px] text-vf-gray mt-1 truncate">{s.snippet?.channelTitle}</p>
                    </div>
                    <span className="absolute top-2 left-2 px-2 py-1 gr-red rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-lg">
                      <FiZap size={9} /> Short
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center border border-white/30">
                        <FiPlay size={22} fill="white" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => scrollShorts(1)}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-black/80 backdrop-blur hover:bg-vf-red rounded-full flex items-center justify-center transition-colors -mr-3 opacity-0 group-hover/s:opacity-100 border border-white/10">
              <FiChevronRight size={20} />
            </button>
          </div>
        </section>
      )}

      {forYou.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-5 font-display">
            <FiHeart className="text-vf-red" size={22} /> Recommended For You
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {forYou.map((v, i) => (
              <VideoCard key={`fy-${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
            ))}
          </div>
        </section>
      )}

      {musicVids.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xl sm:text-2xl font-bold flex items-center gap-2 mb-5 font-display">
            <FiMusic className="text-vf-red" size={22} /> Music Hits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {musicVids.map((v, i) => (
              <VideoCard key={`mu-${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
            ))}
          </div>
        </section>
      )}

      {loadingMore && (
        <div className="flex justify-center py-10">
          <div className="flex items-center gap-3 text-vf-gray">
            <div className="w-6 h-6 rounded-full border-2 border-vf-border animate-spin" style={{ borderTopColor: '#e50914' }} />
            <span className="text-sm">Loading 100 more videos...</span>
          </div>
        </div>
      )}

      {!hasMore && popular.length > 0 && !loadingMore && (
        <div className="text-center py-8 text-vf-gray text-sm">
          You've reached the end • {popular.length} videos loaded
        </div>
      )}
    </>
  );
}