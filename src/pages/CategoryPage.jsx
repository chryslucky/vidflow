import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getPopularVideos, searchVideosFull } from '../utils/api';
import { getVideoId } from '../utils/helpers';
import VideoCard from '../components/VideoCard';
import SkeletonGrid from '../components/SkeletonGrid';
import HeroSlider from '../components/HeroSlider';
import { HiOutlineFire } from 'react-icons/hi2';

const CATEGORY_MAP = {
  music: { id: '10', label: 'Music' },
  gaming: { id: '20', label: 'Gaming' },
  news: { id: '25', label: 'News' },
  sports: { id: '17', label: 'Sports' },
  education: { id: '27', label: 'Education' },
  entertainment: { id: '24', label: 'Entertainment' },
  science: { id: '28', label: 'Science' },
  comedy: { id: '23', label: 'Comedy' },
  travel: { id: '19', label: 'Travel' },
  food: { id: '26', label: 'Food' },
  fitness: { id: '17', label: 'Fitness' },
  tech: { id: '28', label: 'Technology' },
};

export default function CategoryPage() {
  const { category } = useParams();
  const { user, handlePlay, handleSave, setChannelId } = useApp();
  const [videos, setVideos] = useState([]);
  const [heroVideos, setHeroVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageToken, setPageToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loadedRef = useRef('');
  const loadingMoreRef = useRef(false);
  const pageTokenRef = useRef(null);
  const categoryRef = useRef(category);

  const cat = CATEGORY_MAP[category];

  const loadContent = useCallback(async () => {
    if (loadedRef.current === category) return;
    loadedRef.current = category;
    categoryRef.current = category;

    setLoading(true);
    setVideos([]);
    setHeroVideos([]);
    setHasMore(true);
    pageTokenRef.current = null;

    let allVideos = [];
    let nextToken = null;

    if (category === 'trending' || category === 'all') {
      const pop1 = await getPopularVideos(user?.country || 'US', 50);
      if (pop1?.items && pop1.items.length) {
        allVideos = pop1.items;
        nextToken = pop1.nextPageToken;
        setVideos(allVideos);
        setLoading(false);

      } else {
        setLoading(false);
      }
    } else if (category === 'recently') {
      const result = await searchVideosFull('new today trending', 30);
      if (result?.videos) {
        allVideos = result.videos;
        setVideos(allVideos);
      }
      setLoading(false);
    } else if (cat) {
      const data = await getPopularVideos(user?.country || 'US', 50, '', cat.id);
      if (data?.items && data.items.length) {
        allVideos = data.items;
        nextToken = data.nextPageToken;
        setVideos(allVideos);
        setLoading(false);

      } else {
        // Fallback: search by category name
        const result = await searchVideosFull(category, 30);
        if (result?.videos) {
          allVideos = result.videos;
          setVideos(allVideos);
        }
        setLoading(false);
      }
    } else {
      const result = await searchVideosFull(category, 30);
      if (result?.videos) {
        allVideos = result.videos;
        setVideos(allVideos);
      }
      setLoading(false);
    }

    const heroItems = [...allVideos]
      .filter(v => v.statistics?.viewCount)
      .sort((a, b) => parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount))
      .slice(0, 5);
    setHeroVideos(heroItems.length ? heroItems : allVideos.slice(0, 5));

    setPageToken(nextToken || null);
    pageTokenRef.current = nextToken || null;
    if (!nextToken) setHasMore(false);
  }, [category, user, cat]);

  useEffect(() => {
    loadContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadContent]);

  const loadMore = useCallback(async () => {
    const token = pageTokenRef.current;
    if (loadingMoreRef.current || !token) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);

    let data;
    if (category === 'trending' || category === 'all') {
      data = await getPopularVideos(user?.country || 'US', 50, token);
    } else if (cat) {
      data = await getPopularVideos(user?.country || 'US', 50, token, cat.id);
    }

    if (data?.items && data.items.length) {
      setVideos(prev => [...prev, ...data.items]);
      const finalToken = data.nextPageToken || null;
      setPageToken(finalToken);
      pageTokenRef.current = finalToken;
      if (!finalToken) setHasMore(false);
    } else {
      setPageToken(null);
      pageTokenRef.current = null;
      setHasMore(false);
    }

    loadingMoreRef.current = false;
    setLoadingMore(false);
  }, [category, user, cat]);

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

  const title = cat?.label || (category.charAt(0).toUpperCase() + category.slice(1));

  return (
    <div>
      {heroVideos.length > 0 && (
        <HeroSlider videos={heroVideos} onPlay={handlePlay} onSave={handleSave} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl sm:text-3xl font-black flex items-center gap-2 font-display">
          <HiOutlineFire className="text-vf-red" size={26} /> {title}
        </h3>
        <span className="text-xs text-vf-gray">{videos.length} videos</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? <SkeletonGrid count={12} /> :
          videos.map((v, i) => (
            <VideoCard key={`cat-${getVideoId(v)}-${i}`} video={v} index={i} onPlay={handlePlay} onChannel={setChannelId} onSave={handleSave} />
          ))
        }
      </div>

      {loadingMore && (
        <div className="flex justify-center py-10">
          <div className="flex items-center gap-3 text-vf-gray">
            <div className="w-6 h-6 rounded-full border-2 border-vf-border animate-spin" style={{ borderTopColor: '#e50914' }} />
            <span className="text-sm">Loading more...</span>
          </div>
        </div>
      )}

      {!hasMore && videos.length > 0 && !loadingMore && (
        <div className="text-center py-8 text-vf-gray text-sm">
          End of results • {videos.length} videos loaded
        </div>
      )}
    </div>
  );
}