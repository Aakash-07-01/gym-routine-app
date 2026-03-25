import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MonitorPlay as YoutubeIcon, AlertCircle } from 'lucide-react';
import useGymStore from '../store/gymStore';

export default function YoutubeModal({ exerciseName, isOpen, onClose }) {
    const { settings, youtubeCache, cacheYoutubeResults } = useGymStore();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState(null);
    const [quotaExceeded, setQuotaExceeded] = useState(false);

    useEffect(() => {
        if (!isOpen || !exerciseName) {
            setSelectedVideoId(null);
            setVideos([]);
            return;
        }

        const fetchVideos = async () => {
            const cacheKey = exerciseName.toLowerCase();
            const cachedData = youtubeCache[cacheKey];

            // 7-day expiry check
            if (cachedData) {
                const ageDays = (new Date() - new Date(cachedData.cachedAt)) / (1000 * 60 * 60 * 24);
                if (ageDays < 7) {
                    setVideos(cachedData.videos);
                    if (cachedData.videos.length > 0) setSelectedVideoId(cachedData.videos[0].videoId);
                    return;
                }
            }

            const apiKey = settings.youtubeApiKey;
            if (!apiKey) {
                setError("YouTube API Key is missing. Please add it in Settings.");
                setQuotaExceeded(true);
                return;
            }

            setLoading(true);
            setError(null);
            setQuotaExceeded(false);

            try {
                const query = encodeURIComponent(`${exerciseName} proper form tutorial`);
                const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${query}&type=video&key=${apiKey}`);
                const data = await response.json();

                if (response.ok && data.items) {
                    const fetchedVideos = data.items.map(item => ({
                        videoId: item.id.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails.high.url,
                        channel: item.snippet.channelTitle,
                    }));

                    setVideos(fetchedVideos);
                    if (fetchedVideos.length > 0) setSelectedVideoId(fetchedVideos[0].videoId);
                    cacheYoutubeResults(exerciseName, fetchedVideos);
                } else if (data.error && data.error.errors && data.error.errors.length > 0 && data.error.errors[0].reason === 'quotaExceeded') {
                    setQuotaExceeded(true);
                    setError("API Quota Exceeded. You can click below to search on YouTube instead.");
                } else {
                    setError(data.error?.message || "Failed to fetch videos. Check your API Key.");
                    setQuotaExceeded(true);
                }
            } catch (err) {
                setError("Network error fetching videos.");
                setQuotaExceeded(true);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [isOpen, exerciseName, settings.youtubeApiKey, youtubeCache, cacheYoutubeResults]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative bg-gym-surfaceElevated border border-gym-border w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
                >
                    <div className="flex justify-between items-center p-4 border-b border-gym-border">
                        <div className="flex items-center gap-3">
                            <YoutubeIcon className="text-gym-accent" size={28} />
                            <h2 className="text-2xl font-bebas tracking-wide text-white uppercase">{exerciseName} Tutorials</h2>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-gym-surface p-2 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-y-auto">
                        {loading && (
                            <div className="flex flex-col lg:flex-row gap-6 h-[50vh]">
                                <div className="lg:w-2/3 h-full bg-gym-surface animate-pulse rounded-xl"></div>
                                <div className="lg:w-1/3 flex flex-col gap-3">
                                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-24 bg-gym-surface animate-pulse rounded-lg flex-shrink-0"></div>)}
                                </div>
                            </div>
                        )}

                        {!loading && error && quotaExceeded && (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                                <AlertCircle className="text-gym-accent" size={64} />
                                <p className="text-gray-300 max-w-md text-lg">{error}</p>
                                <a
                                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(exerciseName + ' proper form tutorial')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-gym-accent hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full inline-flex items-center gap-2 mt-4 transition-transform hover:scale-105"
                                >
                                    <YoutubeIcon size={20} />
                                    Search on YouTube
                                </a>
                            </div>
                        )}

                        {!loading && !error && videos.length > 0 && (
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Main Player */}
                                <div className="lg:w-2/3 flex flex-col">
                                    <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg border border-gym-border">
                                        {selectedVideoId ? (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${selectedVideoId}`}
                                                className="w-full h-full"
                                                allowFullScreen
                                                title="YouTube Video Player"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                Select a video to play
                                            </div>
                                        )}
                                    </div>
                                    {selectedVideoId && (
                                        <div className="mt-4 bg-gym-surface p-4 rounded-xl border border-gym-light">
                                            <h3 className="text-lg font-bold text-white tracking-wide" dangerouslySetInnerHTML={{ __html: videos.find(v => v.videoId === selectedVideoId)?.title }}>
                                            </h3>
                                            <p className="text-gym-primary font-mono text-sm mt-1">
                                                {videos.find(v => v.videoId === selectedVideoId)?.channel}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Video Top 5 Grid Sidebar */}
                                <div className="lg:w-1/3 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto pb-4 lg:pb-0 lg:pr-2 snap-x">
                                    {videos.map(video => (
                                        <button
                                            key={video.videoId}
                                            onClick={() => setSelectedVideoId(video.videoId)}
                                            className={`flex flex-col sm:flex-row gap-3 p-2 rounded-xl text-left transition-all border shrink-0 w-64 lg:w-auto snap-center ${selectedVideoId === video.videoId
                                                    ? 'bg-gym-surface border-gym-primary shadow-[0_0_10px_rgba(200,255,0,0.1)]'
                                                    : 'bg-transparent border-transparent hover:bg-gym-surface'
                                                }`}
                                        >
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full sm:w-32 aspect-video object-cover rounded-lg shrink-0"
                                            />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="text-sm font-bold text-white line-clamp-2 leading-tight" dangerouslySetInnerHTML={{ __html: video.title }}></h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{video.channel}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!loading && !error && videos.length === 0 && !quotaExceeded && (
                            <div className="text-center text-gray-500 py-10">
                                No tutorials found.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
