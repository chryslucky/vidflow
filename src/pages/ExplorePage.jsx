import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExplorePage() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/search/trending%20worldwide', { replace: true });
  }, [navigate]);
  return null;
}