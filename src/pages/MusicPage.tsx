import React, { useState } from 'react';
import ReactPlayer from 'react-player';
import { Play, Pause, Calendar, Award, Mic, ExternalLink, Music2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/AnimatedSection';
import AdminPageControls from '../components/AdminPageControls';

interface Release {
  id: string;
  title: string;
  type: 'single' | 'album';
  year: string;
  cover: string;
  tracks: Track[];
  streamingLinks: {
    spotify: string;
    appleMusic: string;
    boomplay: string;
    audiomack: string;
  };
}

interface Track {
  id: string;
  title: string;
  duration: string;
  audioPreviewUrl: string;
}

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  youtubeUrl: string;
}

const biography = [
  {
    year: '2020',
    title: 'Débuts en musique',
    description: 'Premiers pas dans l\'univers musical avec des influences soul et jazz.',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    year: '2022',
    title: 'Premier Album',
    description: 'Sortie du premier album mêlant traditions africaines et sonorités modernes.',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  },
  {
    year: '2024',
    title: 'Tournée Internationale',
    description: 'Une série de concerts à travers l\'Europe et l\'Afrique.',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
  }
];

const releases: Release[] = [
  {
    id: '1',
    title: 'Harmonie Africaine',
    type: 'album',
    year: '2024',
    cover: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tracks: [
      {
        id: '1',
        title: "L'Essence de la Vie",
        duration: '4:32',
        audioPreviewUrl: 'https://example.com/preview1.mp3'
      },
      {
        id: '2',
        title: "Rythmes d'Afrique",
        duration: '3:45',
        audioPreviewUrl: 'https://example.com/preview2.mp3'
      }
    ],
    streamingLinks: {
      spotify: 'https://open.spotify.com',
      appleMusic: 'https://music.apple.com',
      boomplay: 'https://www.boomplay.com',
      audiomack: 'https://audiomack.com'
    }
  },
  {
    id: '2',
    title: 'Soleil Levant',
    type: 'single',
    year: '2024',
    cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    tracks: [
      {
        id: '3',
        title: "Soleil Levant",
        duration: '3:56',
        audioPreviewUrl: 'https://example.com/preview3.mp3'
      }
    ],
    streamingLinks: {
      spotify: 'https://open.spotify.com',
      appleMusic: 'https://music.apple.com',
      boomplay: 'https://www.boomplay.com',
      audiomack: 'https://audiomack.com'
    }
  }
];

const videos: Video[] = [
  {
    id: '1',
    title: 'Live at Jazz Festival 2024',
    thumbnail: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    youtubeUrl: 'https://www.youtube.com/watch?v=example1'
  },
  {
    id: '2',
    title: 'Studio Session - L\'Essence de la Vie',
    thumbnail: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    youtubeUrl: 'https://www.youtube.com/watch?v=example2'
  }
];

const MusicPage = () => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-96 bg-gradient-to-r from-music-primary to-music-secondary"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Mon Univers Musical
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl text-gray-200 max-w-2xl"
            >
              Une fusion unique de soul, jazz et rythmes africains
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Biography Timeline Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-12">Mon Parcours</h2>
          </AnimatedSection>
          
          <div className="space-y-12">
            {biography.map((item, index) => (
              <AnimatedSection key={index} delay={index * 0.2}>
                <div className={`flex flex-col md:flex-row ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} gap-8 items-center`}>
                  <div className="md:w-1/2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="rounded-xl shadow-lg w-full h-64 object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-music-primary font-bold text-xl">{item.year}</span>
                      <div className="h-px flex-grow bg-music-primary/20"></div>
                    </div>
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Discography Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-12">Discographie</h2>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 gap-8">
            {releases.map((release) => (
              <AnimatedSection key={release.id}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-2/5">
                      <img
                        src={release.cover}
                        alt={release.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 md:w-3/5">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 bg-music-primary/10 text-music-primary rounded-full text-sm">
                          {release.type === 'album' ? 'Album' : 'Single'}
                        </span>
                        <span className="text-gray-500">{release.year}</span>
                      </div>
                      
                      <h3 className="text-2xl font-bold mb-4">{release.title}</h3>
                      
                      <div className="space-y-3 mb-6">
                        {release.tracks.map((track) => (
                          <div
                            key={track.id}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => {
                                  setCurrentTrack(track);
                                  setIsPlaying(!isPlaying);
                                }}
                                className="p-2 rounded-full bg-music-primary/10 text-music-primary"
                              >
                                {currentTrack?.id === track.id && isPlaying ? (
                                  <Pause size={18} />
                                ) : (
                                  <Play size={18} />
                                )}
                              </button>
                              <div>
                                <p className="font-medium">{track.title}</p>
                                <p className="text-sm text-gray-500">{track.duration}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={release.streamingLinks.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                        >
                          Spotify
                          <ExternalLink size={16} className="ml-2" />
                        </a>
                        <a
                          href={release.streamingLinks.appleMusic}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                        >
                          Apple Music
                          <ExternalLink size={16} className="ml-2" />
                        </a>
                        <a
                          href={release.streamingLinks.boomplay}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                        >
                          Boomplay
                          <ExternalLink size={16} className="ml-2" />
                        </a>
                        <a
                          href={release.streamingLinks.audiomack}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center px-4 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                        >
                          Audiomack
                          <ExternalLink size={16} className="ml-2" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <h2 className="text-3xl font-bold text-center mb-12">Mes Vidéos</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {videos.map((video) => (
              <AnimatedSection key={video.id}>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => setSelectedVideo(video)}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 transition-colors"
                    >
                      <Play className="w-12 h-12 text-white" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">{video.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedVideo(video)}
                        className="flex-1 px-4 py-2 bg-music-primary text-white rounded-full hover:bg-music-secondary transition-colors"
                      >
                        Regarder
                      </button>
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 border border-music-primary text-music-primary rounded-full hover:bg-music-primary/10 transition-colors"
                      >
                        YouTube
                      </a>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {selectedVideo && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
              <div className="relative w-full max-w-4xl">
                <button
                  onClick={() => setSelectedVideo(null)}
                  className="absolute -top-10 right-0 text-white hover:text-gray-300"
                >
                  Fermer
                </button>
                <div className="aspect-w-16 aspect-h-9">
                  <ReactPlayer
                    url={selectedVideo.youtubeUrl}
                    width="100%"
                    height="100%"
                    controls
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Streaming Platforms Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <AnimatedSection>
            <h2 className="text-3xl font-bold mb-12">Écoutez ma musique</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <a
                href="https://open.spotify.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <Music2 className="w-12 h-12 text-green-500 mb-4" />
                <span className="font-semibold">Spotify</span>
              </a>
              <a
                href="https://music.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <Music2 className="w-12 h-12 text-pink-500 mb-4" />
                <span className="font-semibold">Apple Music</span>
              </a>
              <a
                href="https://www.boomplay.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <Music2 className="w-12 h-12 text-orange-500 mb-4" />
                <span className="font-semibold">Boomplay</span>
              </a>
              <a
                href="https://audiomack.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <Music2 className="w-12 h-12 text-yellow-500 mb-4" />
                <span className="font-semibold">Audiomack</span>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>
      <AdminPageControls slug="music" />
    </div>
  );
};

export default MusicPage;