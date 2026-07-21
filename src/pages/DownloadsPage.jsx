import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import DownloadsView from '../components/DownloadsView';

export default function DownloadsPage() {
  const navigate = useNavigate();
  const { handlePlay } = useApp();
  return <DownloadsView onBack={() => navigate('/')} onPlay={handlePlay} />;
}