import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
  playlistId: string;
  playerId: string;
  storageKey: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
  className?: string;
  opacity?: number;
}

const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  playlistId,
  playerId,
  storageKey,
  width = '100%',
  height = '100%',
  style = {},
  className = '',
  opacity = 0.92,
}) => {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayer = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;
    let lastState: any = null;
    let lastPlayback = localStorage.getItem(storageKey);
    let startIndex = 0;
    let startTime = 0;
    if (lastPlayback) {
      try {
        const parsed = JSON.parse(lastPlayback);
        startIndex = parsed.index || 0;
        startTime = parsed.time || 0;
      } catch {}
    }

    function onPlayerReady(event: any) {
      if (startIndex > 0) {
        event.target.playVideoAt(startIndex);
      }
      if (startTime > 0) {
        event.target.seekTo(startTime, true);
      }
      event.target.setVolume(80);
      event.target.playVideo();
    }

    function onPlayerStateChange(event: any) {
      lastState = event.data;
      // Save playback position every 5 seconds
      if (event.data === (window as any).YT?.PlayerState.PLAYING) {
        const interval = setInterval(() => {
          if (!ytPlayer.current || ytPlayer.current.getPlayerState() !== (window as any).YT?.PlayerState.PLAYING) {
            clearInterval(interval);
            return;
          }
          const idx = ytPlayer.current.getPlaylistIndex();
          const time = ytPlayer.current.getCurrentTime();
          localStorage.setItem(storageKey, JSON.stringify({ index: idx, time }));
        }, 5000);
      }
    }

    function onPlayerError(event: any) {
      // On error, skip to next video
      if (ytPlayer.current && ytPlayer.current.nextVideo) {
        ytPlayer.current.nextVideo();
      }
    }

    function loadPlayer() {
      if (!(window as any).YT || !(window as any).YT.Player) return;
      ytPlayer.current = new (window as any).YT.Player(playerId, {
        height,
        width,
        playerVars: {
          listType: 'playlist',
          list: playlistId,
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
          transparent: 1,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    }

    // Load YouTube IFrame API if not present
    if (!(window as any).YT || !(window as any).YT.Player) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
      (window as any).onYouTubeIframeAPIReady = () => {
        if (isMounted) loadPlayer();
      };
    } else {
      loadPlayer();
    }

    return () => {
      isMounted = false;
      if (ytPlayer.current && ytPlayer.current.destroy) {
        ytPlayer.current.destroy();
      }
    };
  }, [playlistId, playerId, storageKey, width, height]);

  return (
    <div
      ref={playerRef}
      id={playerId}
      className={className}
      style={{ width, height, opacity, borderRadius: 8, overflow: 'hidden', ...style }}
    />
  );
};

export default YouTubePlayer; 