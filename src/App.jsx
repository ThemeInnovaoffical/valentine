import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { config } from "./config";
import "./App.css"; // Make sure your responsive CSS is imported

function App() {
  const [noLabel, setNoLabel] = useState("NO 💔");
  const [showHoverPopup, setShowHoverPopup] = useState(false);
  const [showSlidesPopup, setShowSlidesPopup] = useState(false);
  const [showProsConsPopup, setShowProsConsPopup] = useState(false);
  const [noMessageIndex, setNoMessageIndex] = useState(0);
  const [hoveredOnce, setHoveredOnce] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [view, setView] = useState("home");
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [giftsOpened, setGiftsOpened] = useState(new Set());
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  // Media player state
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [selectedSongCard, setSelectedSongCard] = useState(null);
  const [heartBurstCard, setHeartBurstCard] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  // Song data from config
  const songs = useMemo(() => config.songs, []);

  const romanticSongLines = useMemo(
    () => [
      "This melody feels like your smile.",
      "Every beat says how much I miss you.",
      "Our memories dance in this tune.",
      "A little song, a lot of love.",
      "If love had a sound, this is it.",
      "For your heart, from mine.",
    ],
    [],
  );

  const songCards = useMemo(() => {
    if (!songs.length) return [];

    const picked = songs.slice(0, 6);
    const expanded = [...picked];

    for (let index = 0; expanded.length < 6; index += 1) {
      const source = songs[index % songs.length];
      expanded.push({ ...source, id: `${source.id ?? index}-${expanded.length}` });
    }

    return expanded.map((song, index) => ({
      ...song,
      romanticLine: romanticSongLines[index % romanticSongLines.length],
    }));
  }, [romanticSongLines, songs]);

  const noMessages = useMemo(
    () => [
      "Maybe I should explain the perks of being my Valentine… let me tell you 😉",
      "Still not convinced? One more cute reason coming up 💕",
      "Last chance to say yes… I promise unlimited love and hugs 🥰",
    ],
    [],
  );

  const slides = useMemo(() => config.prosCons, []);

  // Handle window resize for responsive adjustments
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Check if mobile view
  const isMobile = windowWidth <= 768;

  const handleNoEnter = useCallback(() => {
    if (hoveredOnce) {
      setNoLabel("YESSS ❤️");
    }
  }, [hoveredOnce]);

  const handleNoLeave = useCallback(() => {
    if (hoveredOnce) {
      setNoLabel("NO 💔");
    }
  }, [hoveredOnce]);

  const handleNoClick = useCallback(() => {
    setShowHoverPopup(true);
    setHoveredOnce(true);
    setNoLabel("NO 💔");
  }, []);

  const closeHoverPopup = useCallback(() => {
    setShowHoverPopup(false);
    setNoLabel("NO 💔");
    setNoMessageIndex((prev) => (prev + 1) % noMessages.length);
  }, [noMessages.length]);

  const openProsConsPopup = useCallback(() => {
    setShowHoverPopup(false);
    setShowProsConsPopup(true);
    setNoMessageIndex((prev) => (prev + 1) % noMessages.length);
  }, [noMessages.length]);

  const closeProsConsPopup = useCallback(() => {
    setShowProsConsPopup(false);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Gift tracking functions
  const handleGiftClick = useCallback((giftType) => {
    setGiftsOpened((prev) => {
      const newSet = new Set(prev);
      newSet.add(giftType);
      return newSet;
    });
  }, []);

  const allGiftsOpened = useMemo(() => giftsOpened.size === 3, [giftsOpened]);

  const handleGift1Click = useCallback(() => {
    handleGiftClick("songs");
    setCurrentSongIndex(0);
    setSelectedSongCard(null);
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setView("songs");
  }, [handleGiftClick]);

  const handleGift2Click = useCallback(() => {
    handleGiftClick("letter");
    setView("letter");
  }, [handleGiftClick]);

  const handleGift3Click = useCallback(() => {
    handleGiftClick("photos");
    setCurrentPhotoIndex(0);
    setView("photos");
  }, [handleGiftClick]);

  const handleNextPhoto = useCallback(() => {
    setCurrentPhotoIndex((prev) => (prev + 1) % config.couplePhotos.length);
  }, []);

  // Media player functions
  const currentSong = useMemo(
    () => songCards[currentSongIndex] ?? songCards[0],
    [songCards, currentSongIndex],
  );

  const formatTime = useCallback((time) => {
    if (isNaN(time) || !isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }, []);

  const fadeOutCurrentAudio = useCallback(() => {
    return new Promise((resolve) => {
      const audioElement = audioRef.current;
      if (!audioElement || audioElement.paused || audioElement.volume <= 0.02) {
        resolve();
        return;
      }

      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      const step = Math.max((volume || 1) / 8, 0.05);
      fadeIntervalRef.current = setInterval(() => {
        if (!audioRef.current) {
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          resolve();
          return;
        }

        const nextVolume = audioRef.current.volume - step;
        if (nextVolume <= 0.02) {
          audioRef.current.volume = 0;
          audioRef.current.pause();
          clearInterval(fadeIntervalRef.current);
          fadeIntervalRef.current = null;
          resolve();
          return;
        }

        audioRef.current.volume = nextVolume;
      }, 35);
    });
  }, [volume]);

  const selectSongCard = useCallback(
    async (index, withFade = true) => {
      if (!songCards.length) return;

      const normalizedIndex = ((index % songCards.length) + songCards.length) % songCards.length;

      setSelectedSongCard(normalizedIndex);
      setHeartBurstCard(normalizedIndex);
      setTimeout(() => {
        setHeartBurstCard((current) =>
          current === normalizedIndex ? null : current,
        );
      }, 520);

      if (withFade && isPlaying && normalizedIndex !== currentSongIndex) {
        await fadeOutCurrentAudio();
      }

      setCurrentSongIndex(normalizedIndex);
      setCurrentTime(0);
      setDuration(0);

      setTimeout(() => {
        const audioElement = audioRef.current;
        if (!audioElement) return;

        audioElement.load();
        audioElement.volume = volume;
        audioElement.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }, 80);
    },
    [currentSongIndex, fadeOutCurrentAudio, isPlaying, songCards.length, volume],
  );

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (selectedSongCard === null) {
      selectSongCard(currentSongIndex || 0, false);
      return;
    }

    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [currentSongIndex, isPlaying, selectSongCard, selectedSongCard]);

  const handleNext = useCallback(() => {
    if (!songCards.length) return;
    selectSongCard((currentSongIndex + 1) % songCards.length, true);
  }, [currentSongIndex, selectSongCard, songCards.length]);

  const handlePrevious = useCallback(() => {
    if (!songCards.length) return;
    selectSongCard((currentSongIndex - 1 + songCards.length) % songCards.length, true);
  }, [currentSongIndex, selectSongCard, songCards.length]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    if (!songCards.length) return;
    selectSongCard((currentSongIndex + 1) % songCards.length, false);
  }, [currentSongIndex, selectSongCard, songCards.length]);

  const handleProgressClick = useCallback(
    (e) => {
      if (audioRef.current && duration > 0) {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.nativeEvent.offsetX;
        const width = rect.width;
        const progress = Math.max(0, Math.min(1, clickX / width));
        audioRef.current.currentTime = progress * duration;
        setCurrentTime(progress * duration);
      }
    },
    [duration],
  );

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  // Success View
  if (view === "success") {
    return (
      <motion.div 
        className="valentine-root success"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="card success-card"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <h1 className="yay">{config.content.successMessage}</h1>
          <p className="subtitle small">{config.content.successSubtitle}</p>

          <motion.div 
            className="image-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <img
              src={config.media.loveYouBearGif}
              alt="Love you bear"
              loading="lazy"
            />
          </motion.div>

          <motion.div
            className="love-text-container"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring", stiffness: 200 }}
          >
            <motion.h2
              className="love-text"
              animate={{
                scale: [1, 1.1, 1],
                rotate: isMobile ? [0, 2, -2, 0] : [0, 5, -5, 0],
              }}
              transition={{
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
            >
              I LOVE YOU ❤️
            </motion.h2>
          </motion.div>

          <div style={{ height: isMobile ? 8 : 12 }} />
          
          <motion.button
            className="btn romantic-gift-btn"
            onClick={() => setView("gifts")}
            whileHover={{ scale: isMobile ? 1 : 1.05, y: isMobile ? 0 : -3 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {config.navigation.backToGifts}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Gifts View
  if (view === "gifts") {
    return (
      <motion.div 
        className="valentine-root gifts"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="card gifts-card"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <h1 className="yay">{config.content.giftsTitle}</h1>

          <div className="gifts-container">
            <motion.div 
              className="gift-card" 
              onClick={handleGift1Click}
              whileHover={{ scale: isMobile ? 1 : 1.05, y: isMobile ? 0 : -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="gift-title">Gift 1</h3>
              <div className="gift-image">
                <img src={config.gifts.gift1} alt="Music gift" loading="lazy" />
              </div>
              <p className="gift-desc hide-mobile">Romantic songs for you</p>
            </motion.div>

            <motion.div 
              className="gift-card" 
              onClick={handleGift2Click}
              whileHover={{ scale: isMobile ? 1 : 1.05, y: isMobile ? 0 : -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="gift-title">Gift 2</h3>
              <div className="gift-image">
                <img src={config.gifts.gift2} alt="Letter gift" loading="lazy" />
              </div>
              <p className="gift-desc hide-mobile">A heartfelt letter</p>
            </motion.div>

            <motion.div 
              className="gift-card" 
              onClick={handleGift3Click}
              whileHover={{ scale: isMobile ? 1 : 1.05, y: isMobile ? 0 : -5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="gift-title">Gift 3</h3>
              <div className="gift-image">
                <img src={config.gifts.gift3} alt="Photos gift" loading="lazy" />
              </div>
              <p className="gift-desc hide-mobile">Our precious memories</p>
            </motion.div>
          </div>

          {allGiftsOpened ? (
            <motion.div 
              className="all-gifts-opened"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="love-you-bear-container"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={config.media.loveYouBearGif}
                  alt="Love you bear"
                  loading="lazy"
                />
              </motion.div>
              <p className="all-gifts-text">
                Yayyyy!! You opened all the gifts! <br />
                LOVE YOU SO MUCH PATOOTIEE! ❤️
              </p>
            </motion.div>
          ) : (
            <>
              <div style={{ height: isMobile ? 8 : 12 }} />
              <motion.button 
                className="btn yes" 
                onClick={() => setView("success")}
                whileHover={{ scale: isMobile ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {config.navigation.backToLove}
              </motion.button>
            </>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Songs View with Media Player
  if (view === "songs") {
    return (
      <motion.div 
        className="valentine-root songs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="card songs-card songs-cinematic-card"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <h1 className="yay">Our Songs</h1>
          <p className="songs-typewriter">Every song here reminds me of you 💖</p>

          <div className="songs-grid">
            {songCards.map((song, index) => {
              const isSelected = selectedSongCard === index;
              const isCardPlaying = isSelected && isPlaying;
              const shouldDim = selectedSongCard !== null && !isSelected;

              return (
                <motion.div
                  key={`${song.id}-${index}`}
                  className={`song-love-card ${isSelected ? "active" : ""} ${isCardPlaying ? "playing" : ""} ${shouldDim ? "dimmed" : ""}`}
                  layout
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                >
                  <span className="song-heart-icon" aria-hidden="true">💖</span>

                  {heartBurstCard === index && (
                    <div className="heart-burst" aria-hidden="true">
                      <span>💗</span>
                      <span>💖</span>
                      <span>💕</span>
                    </div>
                  )}

                  <h3 className="song-card-title">{song.title}</h3>
                  <p className="song-card-artist">{song.artist || "For You"}</p>
                  <p className="song-card-line">{song.romanticLine}</p>

                  <motion.button
                    className="play-for-you-btn"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => selectSongCard(index, true)}
                  >
                    {isCardPlaying ? "Playing for You" : "Play for You"}
                  </motion.button>

                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        className="inline-song-player"
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -8, height: 0 }}
                        transition={{ duration: 0.35, ease: "easeInOut" }}
                      >
                        <div className="inline-album-head">
                          <img
                            src={song.cover}
                            alt={`${song.album} cover`}
                            className="inline-album-cover"
                            loading="lazy"
                          />
                          <div>
                            <p className="inline-track-name">{song.title}</p>
                            <p className="inline-track-meta">{song.album}</p>
                          </div>
                        </div>

                        <div className="progress-section">
                          <div className="time-display">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                          <div
                            className="progress-bar-container"
                            onClick={handleProgressClick}
                            role="button"
                            tabIndex={0}
                            aria-label="Seek progress"
                          >
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{
                                  width:
                                    duration > 0
                                      ? `${(currentTime / duration) * 100}%`
                                      : "0%",
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="control-buttons inline-controls">
                          <motion.button
                            className="control-btn"
                            onClick={handlePrevious}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Previous song"
                          >
                            ⏮️
                          </motion.button>
                          <motion.button
                            className="play-btn-large"
                            onClick={handlePlayPause}
                            whileTap={{ scale: 0.95 }}
                            aria-label={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? "⏸️" : "▶️"}
                          </motion.button>
                          <motion.button
                            className="control-btn"
                            onClick={handleNext}
                            whileTap={{ scale: 0.9 }}
                            aria-label="Next song"
                          >
                            ⏭️
                          </motion.button>
                        </div>

                        <div className="volume-section">
                          <span className="volume-icon">
                            {volume > 0.5 ? "🔊" : volume > 0 ? "🔉" : "🔇"}
                          </span>
                          <input
                            type="range"
                            className="volume-bar"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            aria-label="Volume control"
                          />
                        </div>

                        <div className={`equalizer ${isPlaying ? "playing" : "paused"}`}>
                          <span></span>
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={currentSong?.audio}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            preload="metadata"
          />

          <div style={{ height: isMobile ? 8 : 12 }} />
          
          <motion.button 
            className="btn yes" 
            onClick={() => setView("gifts")}
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {config.navigation.backToGifts}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Photos View
  if (view === "photos") {
    return (
      <motion.div 
        className="valentine-root photos"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="card photos-card"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <h1 className="yay">{config.content.photosTitle}</h1>
          <div className="photo-single-view">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhotoIndex}
                className="photo-card photo-single-card"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.985 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <motion.div
                  className={`photo-frame vintage-${(currentPhotoIndex % 6) + 1}`}
                  role="button"
                  tabIndex={0}
                  aria-label="Show next photo"
                  onClick={handleNextPhoto}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleNextPhoto();
                    }
                  }}
                  whileHover={{ scale: isMobile ? 1 : 1.02 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <img
                    src={config.couplePhotos[currentPhotoIndex].image}
                    alt={config.couplePhotos[currentPhotoIndex].caption}
                    loading="lazy"
                  />
                </motion.div>

                <p className="photo-caption">
                  {config.couplePhotos[currentPhotoIndex].caption}
                </p>

    

                <p className="photo-next-hint">Click photo</p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div style={{ height: isMobile ? 8 : 12 }} />
          
          <motion.button 
            className="btn yes" 
            onClick={() => setView("gifts")}
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {config.navigation.backToGifts}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Letter View
  if (view === "letter") {
    return (
      <motion.div 
        className="valentine-root letter"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="card letter-card"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <h1 className="yay">{config.content.letterTitle}</h1>
          
          <motion.div
            className="envelope-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="envelope"
              onClick={() => setEnvelopeOpen(!envelopeOpen)}
              whileHover={{ scale: isMobile ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              role="button"
              tabIndex={0}
              aria-label={envelopeOpen ? "Close envelope" : "Open envelope"}
            >
              <div className="envelope-flap">
                <div className="envelope-triangle" />
              </div>
              <div className="envelope-body">
                <div className="envelope-seal">
                  <span className="heart-symbol">❤️</span>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {envelopeOpen && (
                <motion.div
                  className="letter-paper"
                  initial={{ rotateX: -90, opacity: 0, y: -50 }}
                  animate={{ rotateX: 0, opacity: 1, y: 0 }}
                  exit={{ rotateX: 90, opacity: 0, y: -30 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                >
                  <div className="letter-content">
                    <h2 className="letter-title">{config.letter.title}</h2>
                    {config.letter.content.map((paragraph, index) => (
                      <p key={index} className="letter-text">
                        {paragraph}
                      </p>
                    ))}
                    <p className="letter-signature">{config.letter.signature}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {envelopeOpen && <div style={{ height: isMobile ? 8 : 12 }} />}
          
          <motion.button 
            className="btn yes" 
            onClick={() => setView("gifts")}
            whileHover={{ scale: isMobile ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {config.navigation.backToGifts}
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  // Home View
  return (
    <AnimatePresence mode="wait">
      <>
        <div className="hearts">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <motion.div
          key={view}
          className="valentine-root"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <motion.div
            className="card"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, ease: "backOut" }}
          >
            <motion.img
              src={config.media.mainBearGif}
              alt="Cute Valentine bear"
              className="card-image"
              loading="eager"
              whileHover={{ scale: isMobile ? 1 : 1.05 }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.h1
              className="title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <span className="name">{config.names.receiver},</span>
              <span className="ask"> {config.content.title}</span>
            </motion.h1>

            <motion.p
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {isMobile ? "Tap your answer 💕" : "Choose your answer with love 💕"}
            </motion.p>

            <motion.div
              className="choices"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.button
                className="btn yes"
                onClick={() => setView("success")}
                whileHover={{ 
                  scale: isMobile ? 1 : 1.1, 
                  y: isMobile ? 0 : -5,
                  boxShadow: "0 12px 25px rgba(255, 122, 162, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {config.content.yesButtonText}
              </motion.button>
              
              <motion.button
                className="btn no"
                onClick={handleNoClick}
                onMouseEnter={handleNoEnter}
                onMouseLeave={handleNoLeave}
                aria-label="No button"
                whileHover={{ 
                  scale: isMobile ? 1 : 1.05, 
                  y: isMobile ? 0 : -2 
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                {noLabel}
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Hover Popup */}
          <AnimatePresence>
            {showHoverPopup && (
              <motion.div
                className="overlay"
                onClick={closeHoverPopup}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="popup"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                >
                  <button
                    className="close-btn"
                    onClick={closeHoverPopup}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                  
                  <p className="popup-text">
                    {noMessages[noMessageIndex]}
                  </p>
                  
                  <motion.button
                    className="btn okay-btn"
                    onClick={openProsConsPopup}
                    whileHover={{ scale: isMobile ? 1 : 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    Okay
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Pros & Cons Popup */}
            {showProsConsPopup && (
              <motion.div
                className="overlay"
                onClick={closeProsConsPopup}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="pros-cons-popup"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "backOut" }}
                >
                  <button
                    className="close-btn"
                    onClick={closeProsConsPopup}
                    aria-label="Close"
                  >
                    ✕
                  </button>

                  <h2 className="pros-cons-title">
                    {config.content.prosConsTitle}
                  </h2>

                  <motion.div
                    className="cards-container"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <motion.div
                      className="card pros-card"
                      whileHover={{ y: isMobile ? 0 : -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="card-title">💖 Pros</h3>
                      <div className="pros-list">
                        <div className="pro-item">
                          <img
                            src={slides[currentSlide].gif}
                            alt="Pro reason"
                            className="pro-gif"
                            loading="lazy"
                          />
                          <p className="pro-text">{slides[currentSlide].text}</p>
                        </div>
                      </div>

                      <div className="pros-nav">
                        <motion.button
                          className="nav-btn"
                          onClick={prevSlide}
                          whileHover={{ scale: isMobile ? 1 : 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Previous reason"
                        >
                          <img
                            src={config.media.leftButton}
                            alt="Previous"
                            className="nav-btn-img"
                          />
                        </motion.button>
                        
                        <span className="slide-indicator">
                          {currentSlide + 1} / {slides.length}
                        </span>
                        
                        <motion.button
                          className="nav-btn"
                          onClick={nextSlide}
                          whileHover={{ scale: isMobile ? 1 : 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label="Next reason"
                        >
                          <img
                            src={config.media.rightButton}
                            alt="Next"
                            className="nav-btn-img"
                          />
                        </motion.button>
                      </div>
                    </motion.div>

                    <motion.div
                      className="card cons-card"
                      whileHover={{ y: isMobile ? 0 : -5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="card-title">❌ Cons</h3>
                      <div className="cons-content">
                        <img
                          src={config.media.childGif}
                          alt="Funny cons"
                          className="cons-gif"
                          loading="lazy"
                        />
                        <p className="cons-text">
                          {config.content.prosConsSubtitle}
                        </p>
                        <p className="cons-subtext hide-mobile">
                          (Just kidding! There are no cons! 😄)
                        </p>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </>
    </AnimatePresence>
  );
}

export default App;