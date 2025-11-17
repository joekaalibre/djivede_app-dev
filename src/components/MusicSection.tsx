import React from 'react';
import { Play, Pause, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Track {
  id: string;
  title: string;
  duration: string;
  audioUrl: string;
}

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
        audioUrl: 'https://example.com/track1.mp3'
      },
      {
        id: '2',
        title: "Rythmes d'Afrique",
        duration: '3:45',
        audioUrl: 'https://example.com/track2.mp3'
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
        audioUrl: 'https://example.com/track3.mp3'
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

const MusicSection = () => {
  const [currentTrack, setCurrentTrack] = React.useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <section id="music" className="py-20 bg-gradient-to-br from-music-primary/10 to-music-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Ma Musique</h2>
          <p className="text-xl text-gray-600">Une fusion unique de soul, jazz et rythmes africains</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {releases.map((release) => (
            <motion.div
              key={release.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
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
                    <span className="px-2 py-1 bg-music-primary/10 text-music-primary rounded-full text-xs">
                      {release.type === 'album' ? 'Album' : 'Single'}
                    </span>
                    <span className="text-gray-500 text-sm">{release.year}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-4">{release.title}</h3>
                  
                  <div className="space-y-2 mb-6">
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
                            className="p-1.5 rounded-full bg-music-primary/10 text-music-primary"
                          >
                            {currentTrack?.id === track.id && isPlaying ? (
                              <Pause size={16} />
                            ) : (
                              <Play size={16} />
                            )}
                          </button>
                          <div>
                            <p className="font-medium text-sm">{track.title}</p>
                            <p className="text-xs text-gray-500">{track.duration}</p>
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
                      className="flex items-center justify-center px-3 py-1.5 text-xs bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                    >
                      Spotify
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                    <a
                      href={release.streamingLinks.appleMusic}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-1.5 text-xs bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors"
                    >
                      Apple Music
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                    <a
                      href={release.streamingLinks.boomplay}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-1.5 text-xs bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
                    >
                      Boomplay
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                    <a
                      href={release.streamingLinks.audiomack}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-1.5 text-xs bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition-colors"
                    >
                      Audiomack
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MusicSection;