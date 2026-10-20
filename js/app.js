/**
 * Pendrive Media Hub PRO - Core Application Logic
 * Comprehensive Bluetooth AVRCP Media Session Support, Multi-Criteria Sorting & Grouping,
 * Real-Time Intelligent Search, and Pro Audio Playback Engine.
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ==========================================
    // 1. DOM Element Selectors
    // ==========================================
    const connectBtn = document.getElementById('connect-btn');
    const folderFallbackInput = document.getElementById('folder-fallback-input');
    const demoBtn = document.getElementById('demo-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainApp = document.getElementById('main-app');

    // Navigation & Tabs
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabTitle = document.getElementById('current-tab-title');
    const tabSubtitle = document.getElementById('current-tab-subtitle');
    const songsCountBadge = document.getElementById('songs-count-badge');
    const videosCountBadge = document.getElementById('videos-count-badge');
    const pdfsCountBadge = document.getElementById('pdfs-count-badge');

    // Search & Filter
    const searchInput = document.getElementById('search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const searchResultsCount = document.getElementById('search-results-count');
    const sortSelect = document.getElementById('sort-select');
    const groupSelect = document.getElementById('group-select');
    const viewGridBtn = document.getElementById('view-grid-btn');
    const viewListBtn = document.getElementById('view-list-btn');
    const chipBtns = document.querySelectorAll('.chip-btn');
    const songsToolbar = document.getElementById('songs-toolbar');
    const filterChipsBar = document.getElementById('filter-chips-bar');

    // Grids & Containers
    const songsContainer = document.getElementById('songs-container');
    const videosGrid = document.getElementById('videos-grid');
    const pdfsGrid = document.getElementById('pdfs-grid');

    // Pro Audio Player Dock
    const audioPlayerContainer = document.getElementById('audio-player-container');
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = document.getElementById('play-pause-icon');
    const prevSongBtn = document.getElementById('prev-song');
    const nextSongBtn = document.getElementById('next-song');
    const shuffleBtn = document.getElementById('shuffle-btn');
    const repeatBtn = document.getElementById('repeat-btn');
    const repeatModeBadge = document.getElementById('repeat-mode-badge');
    const audioTitle = document.getElementById('audio-title');
    const audioMovie = document.getElementById('audio-movie');
    const audioArtist = document.getElementById('audio-artist');
    const audioHero = document.getElementById('audio-hero');
    const playerTrackArt = document.getElementById('player-track-art');
    const playerDefaultArt = document.getElementById('player-default-art');
    const currentTimeLabel = document.getElementById('current-time');
    const totalDurationLabel = document.getElementById('total-duration');
    const seekSlider = document.getElementById('seek-slider');
    const seekProgressBar = document.getElementById('seek-progress-bar');
    const seekBufferBar = document.getElementById('seek-buffer-bar');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeIcon = document.getElementById('volume-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const gapTransitionBadge = document.getElementById('gap-transition-badge');
    const playerFavBtn = document.getElementById('player-fav-btn');

    // Queue Drawer
    const queueDrawer = document.getElementById('queue-drawer');
    const queueBackdrop = document.getElementById('queue-backdrop');
    const queueToggleBtn = document.getElementById('queue-toggle-btn');
    const closeQueueBtn = document.getElementById('close-queue-btn');
    const clearQueueBtn = document.getElementById('clear-queue-btn');
    const queueList = document.getElementById('queue-list');
    const queueBadgeCount = document.getElementById('queue-badge-count');
    const queueTotalTracks = document.getElementById('queue-total-tracks');

    // Modal
    const modal = document.getElementById('media-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');
    const toastContainer = document.getElementById('toast-container');

    // ==========================================
    // 2. Application State
    // ==========================================
    let directoryHandle = null;
    let allMediaFiles = []; // All files scanned
    let songsMasterList = []; // Array of processed song objects
    let videosMasterList = [];
    let pdfsMasterList = [];

    // Active Playback Queue & Navigation
    let activeQueue = []; // Currently active playlist (can be filtered/sorted)
    let currentQueueIndex = -1; // Index in activeQueue
    let currentSong = null; // Current playing song object
    let currentAudioUrl = null; // Object URL for cleanup
    let currentModalUrl = null;

    // Player Preferences
    let isShuffle = false;
    let repeatMode = 'off'; // 'off' | 'all' | 'one'
    let isMuted = false;
    let previousVolume = 1;
    let viewMode = 'grid'; // 'grid' | 'list'
    let autoPlayTimer = null;
    let isSeeking = false;

    // Supported Extensions Map
    const extMap = {
        'mp3': 'song', 'wav': 'song', 'ogg': 'song', 'm4a': 'song', 'flac': 'song', 'aac': 'song',
        'mp4': 'video', 'mkv': 'video', 'webm': 'video', 'mov': 'video',
        'pdf': 'pdf'
    };

    // ==========================================
    // 3. Bluetooth & Media Session API Setup
    // ==========================================
    function initMediaSession() {
        if (!('mediaSession' in navigator)) {
            console.warn('Media Session API is not supported in this browser.');
            const btCard = document.getElementById('bt-status-card');
            if (btCard) {
                const desc = document.getElementById('bt-status-desc');
                if (desc) desc.textContent = 'MediaSession API unavailable in this browser';
                const pulse = btCard.querySelector('.bt-pulse-indicator');
                if (pulse) pulse.classList.remove('active');
            }
            return;
        }

        try {
            // Action Handlers for Bluetooth Headsets, Speakers, Lockscreen, Smartwatches
            navigator.mediaSession.setActionHandler('play', () => {
                resumePlayback();
            });

            navigator.mediaSession.setActionHandler('pause', () => {
                pausePlayback();
            });

            navigator.mediaSession.setActionHandler('previoustrack', () => {
                playPreviousSong();
            });

            navigator.mediaSession.setActionHandler('nexttrack', () => {
                playNextSong();
            });

            navigator.mediaSession.setActionHandler('seekbackward', (details) => {
                const skip = details.seekOffset || 10;
                if (audioPlayer.duration) {
                    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - skip, 0);
                    updatePositionState();
                }
            });

            navigator.mediaSession.setActionHandler('seekforward', (details) => {
                const skip = details.seekOffset || 10;
                if (audioPlayer.duration) {
                    audioPlayer.currentTime = Math.min(audioPlayer.currentTime + skip, audioPlayer.duration);
                    updatePositionState();
                }
            });

            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime !== undefined && !isNaN(details.seekTime)) {
                    audioPlayer.currentTime = details.seekTime;
                    updatePositionState();
                }
            });

            navigator.mediaSession.setActionHandler('stop', () => {
                pausePlayback();
                audioPlayer.currentTime = 0;
                updatePositionState();
            });

            console.log('Bluetooth Media Session API initialized successfully with AVRCP handlers.');
        } catch (e) {
            console.error('Error binding Media Session handlers:', e);
        }
    }

    /**
     * Broadcast song details & high-res artwork to Bluetooth speaker & OS flyout
     */
    function updateMediaSessionMetadata(song) {
        if (!('mediaSession' in navigator) || !song) return;

        try {
            const artworkSrc = song.artworkUrl || window.MediaMetadataEngine.generateDynamicArtwork(
                song.title,
                song.movie,
                `${song.singer} • ${song.hero}`
            );

            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: `${song.singer} • Hero: ${song.hero}`,
                album: song.movie || 'Pendrive Media Hub',
                artwork: [
                    { src: artworkSrc, sizes: '512x512', type: 'image/png' },
                    { src: artworkSrc, sizes: '256x256', type: 'image/png' },
                    { src: artworkSrc, sizes: '128x128', type: 'image/png' },
                    { src: artworkSrc, sizes: '96x96', type: 'image/png' }
                ]
            });

            navigator.mediaSession.playbackState = 'playing';
            updatePositionState();
        } catch (err) {
            console.warn('Could not update Media Session metadata:', err);
        }
    }

    function updatePositionState() {
        if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession)) return;
        try {
            if (audioPlayer.duration && !isNaN(audioPlayer.duration) && isFinite(audioPlayer.duration)) {
                navigator.mediaSession.setPositionState({
                    duration: audioPlayer.duration,
                    playbackRate: audioPlayer.playbackRate || 1,
                    position: Math.min(audioPlayer.currentTime, audioPlayer.duration)
                });
            }
        } catch (e) {
            // Non-critical
        }
    }

    // ==========================================
    // 4. File System Scanning & Discovery
    // ==========================================

    // Native Chromium File System Access API
    connectBtn.addEventListener('click', async () => {
        try {
            directoryHandle = await window.showDirectoryPicker({
                mode: 'read'
            });

            welcomeScreen.classList.remove('active');
            mainApp.classList.add('active');
            showToast('Pen Drive connected! Scanning media files...', 'info');

            await scanDirectoryWithProgress(directoryHandle);
            initMediaSession();
            applySortAndFilter();
        } catch (error) {
            console.error('Directory picker error:', error);
            if (error.name !== 'AbortError') {
                showToast('Failed to access Pen Drive. Try using Browse Folder.', 'warn');
            }
        }
    });

    // Fallback Folder Input (Works on all browsers, mobile, Safari, Firefox)
    folderFallbackInput.addEventListener('change', async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        welcomeScreen.classList.remove('active');
        mainApp.classList.add('active');
        showToast(`Loading ${files.length} files from folder...`, 'info');

        await processUploadedFilesList(files);
        initMediaSession();
        applySortAndFilter();
    });

    // Instant Demo Media (For testing all features without USB drive)
    demoBtn.addEventListener('click', async () => {
        welcomeScreen.classList.remove('active');
        mainApp.classList.add('active');
        showToast('Loading Demo Pen Drive Media...', 'info');

        loadDemoMediaLibrary();
        initMediaSession();
        applySortAndFilter();
    });

    // Disconnect Pen Drive
    disconnectBtn.addEventListener('click', () => {
        if (confirm('Eject and disconnect current Pen Drive session?')) {
            resetApplication();
        }
    });

    /**
     * Recursively scan directory via FileSystemDirectoryHandle
     */
    async function scanDirectoryWithProgress(dirHandle) {
        allMediaFiles = [];
        songsMasterList = [];
        videosMasterList = [];
        pdfsMasterList = [];

        async function readDir(handle, currentPath = '') {
            try {
                for await (const entry of handle.values()) {
                    const relativePath = currentPath ? `${currentPath}/${entry.name}` : entry.name;
                    if (entry.kind === 'file') {
                        const ext = entry.name.split('.').pop().toLowerCase();
                        if (extMap[ext]) {
                            allMediaFiles.push({
                                handle: entry,
                                file: null,
                                name: entry.name,
                                path: relativePath,
                                type: extMap[ext]
                            });
                        }
                    } else if (entry.kind === 'directory') {
                        await readDir(entry, relativePath);
                    }
                }
            } catch (err) {
                console.warn('Skipping inaccessible folder:', err);
            }
        }

        await readDir(dirHandle);
        await processScannedMediaFiles();
    }

    /**
     * Process files from fallback input
     */
    async function processUploadedFilesList(files) {
        allMediaFiles = [];
        songsMasterList = [];
        videosMasterList = [];
        pdfsMasterList = [];

        for (const file of files) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (extMap[ext]) {
                const relativePath = file.webkitRelativePath || file.name;
                allMediaFiles.push({
                    handle: null,
                    file: file,
                    name: file.name,
                    path: relativePath,
                    type: extMap[ext]
                });
            }
        }

        await processScannedMediaFiles();
    }

    /**
     * Parse metadata for all discovered songs, videos, and PDFs
     */
    async function processScannedMediaFiles() {
        const rawSongs = allMediaFiles.filter(f => f.type === 'song');
        videosMasterList = allMediaFiles.filter(f => f.type === 'video');
        pdfsMasterList = allMediaFiles.filter(f => f.type === 'pdf');

        songsMasterList = [];

        for (let i = 0; i < rawSongs.length; i++) {
            const item = rawSongs[i];
            let id3 = {};

            // Parse ID3 tags if file handle or file object is ready
            try {
                const fileObj = item.file || (item.handle ? await item.handle.getFile() : null);
                if (fileObj) {
                    id3 = await window.MediaMetadataEngine.parseID3Tags(fileObj);
                }
            } catch (e) {
                // Skip tag read if restricted
            }

            const meta = window.MediaMetadataEngine.extractSongMetadata(item.name, item.path, id3);

            songsMasterList.push({
                id: `song-${i}-${Date.now()}`,
                handle: item.handle,
                file: item.file,
                fileName: item.name,
                path: item.path,
                type: 'song',
                title: meta.title,
                movie: meta.movie,
                hero: meta.hero,
                singer: meta.singer,
                folder: meta.folder,
                artworkUrl: meta.artworkUrl
            });
        }

        updateBadges();
        showToast(`Found ${songsMasterList.length} songs, ${videosMasterList.length} videos, ${pdfsMasterList.length} PDFs.`, 'success');
    }

    /**
     * Generate interactive Demo Media Library with synthesized audio tones
     */
    function loadDemoMediaLibrary() {
        const demoSongsData = [
            { title: "Fear Song", movie: "Devara", hero: "Jr NTR", singer: "Anirudh Ravichander", folder: "Devara (2024)" },
            { title: "Naatu Naatu", movie: "RRR", hero: "Jr NTR & Ram Charan", singer: "Rahul Sipligunj & Kaala Bhairava", folder: "RRR Hits" },
            { title: "Peelings", movie: "Pushpa 2", hero: "Allu Arjun", singer: "Devi Sri Prasad (DSP)", folder: "Pushpa 2 The Rule" },
            { title: "Srivalli", movie: "Pushpa", hero: "Allu Arjun", singer: "Sid Sriram", folder: "Pushpa The Rise" },
            { title: "Sooreede", movie: "Salaar", hero: "Prabhas", singer: "Ravi Basrur", folder: "Salaar CeaseFire" },
            { title: "Kurchi Madathapetti", movie: "Guntur Kaaram", hero: "Mahesh Babu", singer: "Thaman S & Sahithi", folder: "Guntur Kaaram" },
            { title: "Chaleya", movie: "Jawan", hero: "Shah Rukh Khan", singer: "Arijit Singh & Shilpa Rao", folder: "Jawan Audio" },
            { title: "Arjan Vailly", movie: "Animal", hero: "Ranbir Kapoor", singer: "Bhupinder Babbal", folder: "Animal Movie" },
            { title: "Badass", movie: "Leo", hero: "Thalapathy Vijay", singer: "Anirudh Ravichander", folder: "Leo Album" },
            { title: "Hukum", movie: "Jailer", hero: "Rajinikanth", singer: "Anirudh Ravichander", folder: "Jailer BGM" },
            { title: "Kesariya", movie: "Brahmastra", hero: "Ranbir Kapoor", singer: "Arijit Singh", folder: "Brahmastra" },
            { title: "Samajavaragamana", movie: "Ala Vaikunthapurramuloo", hero: "Allu Arjun", singer: "Sid Sriram", folder: "AVPL Songs" }
        ];

        songsMasterList = demoSongsData.map((d, idx) => {
            // Generate synthetic playable audio buffer
            const demoWavBlob = generateSynthesizedAudioBlob(idx);
            return {
                id: `demo-song-${idx}`,
                handle: null,
                file: new File([demoWavBlob], `${d.title}.wav`, { type: 'audio/wav' }),
                fileName: `${d.movie} - ${d.title} - ${d.hero}.mp3`,
                path: `${d.folder}/${d.title}.mp3`,
                type: 'song',
                title: d.title,
                movie: d.movie,
                hero: d.hero,
                singer: d.singer,
                folder: d.folder,
                artworkUrl: null
            };
        });

        videosMasterList = [
            { name: "Pushpa 2 - The Rule Trailer.mp4", type: "video", isDemo: true },
            { name: "Devara Official Teaser.mp4", type: "video", isDemo: true }
        ];

        pdfsMasterList = [
            { name: "Pendrive Media Hub Guide.pdf", type: "pdf", isDemo: true }
        ];

        updateBadges();
        showToast('Demo Library Loaded! Click any song or search to test.', 'success');
    }

    /**
     * Synthesize clean, harmonious WAV audio for demo songs
     */
    function generateSynthesizedAudioBlob(seed) {
        const sampleRate = 44100;
        const durationSec = 15; // 15 seconds demo sample
        const numSamples = sampleRate * durationSec;
        const buffer = new ArrayBuffer(44 + numSamples * 2);
        const view = new DataView(buffer);

        // RIFF header
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + numSamples * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true); // Subchunk1Size
        view.setUint16(20, 1, true); // PCM
        view.setUint16(22, 1, true); // Mono
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true); // ByteRate
        view.setUint16(32, 2, true); // BlockAlign
        view.setUint16(34, 16, true); // BitsPerSample
        writeString(view, 36, 'data');
        view.setUint32(40, numSamples * 2, true);

        // Musical notes for demo melody
        const scaleFrequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25];
        const baseFreq = scaleFrequencies[seed % scaleFrequencies.length];

        let offset = 44;
        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            // Chord harmony with gentle envelope
            const noteChange = Math.floor(t * 2) % scaleFrequencies.length;
            const currentFreq = scaleFrequencies[(seed + noteChange) % scaleFrequencies.length];
            const sample = (Math.sin(2 * Math.PI * currentFreq * t) * 0.4 +
                            Math.sin(2 * Math.PI * (currentFreq * 1.5) * t) * 0.2) *
                           (0.5 + 0.5 * Math.sin(t * 4));
            const intSample = Math.max(-1, Math.min(1, sample)) * 0x7FFF;
            view.setInt16(offset, intSample, true);
            offset += 2;
        }

        return new Blob([buffer], { type: 'audio/wav' });
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }

    function updateBadges() {
        songsCountBadge.textContent = songsMasterList.length;
        videosCountBadge.textContent = videosMasterList.length;
        pdfsCountBadge.textContent = pdfsMasterList.length;
    }

    // ==========================================
    // 5. Intelligent Multi-Criteria Sorting & Search
    // ==========================================

    // Real-time Search input listener
    searchInput.addEventListener('input', () => {
        const val = searchInput.value.trim();
        if (val.length > 0) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
            searchResultsCount.classList.add('hidden');
        }
        applySortAndFilter();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.classList.add('hidden');
        searchResultsCount.classList.add('hidden');
        searchInput.focus();
        applySortAndFilter();
    });

    // Sorting change
    sortSelect.addEventListener('change', () => {
        applySortAndFilter();
    });

    // Grouping change
    groupSelect.addEventListener('change', () => {
        applySortAndFilter();
    });

    // View mode toggles
    viewGridBtn.addEventListener('click', () => {
        viewMode = 'grid';
        viewGridBtn.classList.add('active');
        viewListBtn.classList.remove('active');
        renderSongs();
    });

    viewListBtn.addEventListener('click', () => {
        viewMode = 'list';
        viewListBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
        renderSongs();
    });

    // Quick filter chips
    chipBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            chipBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterType = btn.getAttribute('data-filter');
            if (filterType === 'all') {
                groupSelect.value = 'none';
            } else if (filterType === 'movie') {
                groupSelect.value = 'movie';
                sortSelect.value = 'movie-asc';
            } else if (filterType === 'hero') {
                groupSelect.value = 'hero';
                sortSelect.value = 'hero-asc';
            } else if (filterType === 'singer') {
                groupSelect.value = 'singer';
                sortSelect.value = 'singer-asc';
            }

            applySortAndFilter();
        });
    });

    /**
     * Filter & Sort songs in memory and trigger clean rendering
     */
    function applySortAndFilter() {
        const query = searchInput.value.toLowerCase().trim();
        const sortBy = sortSelect.value;

        // 1. Filter by Search Query across all fields: title, movie, hero, singer, filename, folder
        let result = songsMasterList.filter(song => {
            if (!query) return true;
            return (
                (song.title && song.title.toLowerCase().includes(query)) ||
                (song.movie && song.movie.toLowerCase().includes(query)) ||
                (song.hero && song.hero.toLowerCase().includes(query)) ||
                (song.singer && song.singer.toLowerCase().includes(query)) ||
                (song.fileName && song.fileName.toLowerCase().includes(query)) ||
                (song.folder && song.folder.toLowerCase().includes(query))
            );
        });

        // 2. Sort results
        result.sort((a, b) => {
            if (sortBy === 'title-asc') {
                return (a.title || '').localeCompare(b.title || '');
            } else if (sortBy === 'title-desc') {
                return (b.title || '').localeCompare(a.title || '');
            } else if (sortBy === 'movie-asc') {
                const cmp = (a.movie || '').localeCompare(b.movie || '');
                return cmp !== 0 ? cmp : (a.title || '').localeCompare(b.title || '');
            } else if (sortBy === 'hero-asc') {
                const cmp = (a.hero || '').localeCompare(b.hero || '');
                return cmp !== 0 ? cmp : (a.title || '').localeCompare(b.title || '');
            } else if (sortBy === 'singer-asc') {
                const cmp = (a.singer || '').localeCompare(b.singer || '');
                return cmp !== 0 ? cmp : (a.title || '').localeCompare(b.title || '');
            }
            return 0; // default order
        });

        // Update search count badge
        if (query) {
            searchResultsCount.textContent = `${result.length} found`;
            searchResultsCount.classList.remove('hidden');
        } else {
            searchResultsCount.classList.add('hidden');
        }

        activeQueue = result;
        updateQueueUI();
        renderSongs();
    }

    /**
     * Render songs according to active view mode (Grid or List) and grouping mode
     */
    function renderSongs() {
        songsContainer.innerHTML = '';

        if (activeQueue.length === 0) {
            songsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
                    <i class="fa-solid fa-music-slash" style="font-size: 3rem; margin-bottom: 16px; color: var(--accent-cyan); opacity: 0.6;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 8px;">No songs found</h3>
                    <p>Try searching for a different song, movie, actor, or singer name.</p>
                </div>
            `;
            return;
        }

        const groupBy = groupSelect.value;

        // Flat rendering (No Grouping)
        if (groupBy === 'none') {
            if (viewMode === 'grid') {
                songsContainer.className = 'songs-view-grid';
                activeQueue.forEach((song, idx) => {
                    const card = createSongCard(song, idx);
                    songsContainer.appendChild(card);
                });
            } else {
                songsContainer.className = 'songs-view-list';
                activeQueue.forEach((song, idx) => {
                    const row = createSongListRow(song, idx);
                    songsContainer.appendChild(row);
                });
            }
            return;
        }

        // Grouped Rendering (by Movie, Hero, Singer, or Folder)
        const groups = {};
        activeQueue.forEach(song => {
            let key = 'Other';
            if (groupBy === 'movie') key = song.movie || 'Other Movies';
            else if (groupBy === 'hero') key = song.hero || 'Various Artists';
            else if (groupBy === 'singer') key = song.singer || 'Other Singers';
            else if (groupBy === 'folder') key = song.folder || 'Root Folder';

            if (!groups[key]) groups[key] = [];
            groups[key].push(song);
        });

        // Sort group headers alphabetically (keeping 'Other' at the end)
        const sortedGroupKeys = Object.keys(groups).sort((a, b) => {
            if (a.startsWith('Other') || a.startsWith('Various')) return 1;
            if (b.startsWith('Other') || b.startsWith('Various')) return -1;
            return a.localeCompare(b);
        });

        let groupIconClass = 'fa-solid fa-layer-group';
        if (groupBy === 'movie') groupIconClass = 'fa-solid fa-film';
        if (groupBy === 'hero') groupIconClass = 'fa-solid fa-star';
        if (groupBy === 'singer') groupIconClass = 'fa-solid fa-microphone-lines';
        if (groupBy === 'folder') groupIconClass = 'fa-solid fa-folder';

        songsContainer.className = 'songs-view-grid';

        sortedGroupKeys.forEach(groupName => {
            const songsInGroup = groups[groupName];

            // Group Section Header
            const headerSection = document.createElement('div');
            headerSection.className = 'group-section';
            headerSection.innerHTML = `
                <div class="group-header-card">
                    <div class="group-title-left">
                        <i class="${groupIconClass} group-icon"></i>
                        <h3 class="group-name">${groupName}</h3>
                        <span class="group-count-badge">${songsInGroup.length} ${songsInGroup.length === 1 ? 'song' : 'songs'}</span>
                    </div>
                    <button class="group-play-btn" title="Play all songs in this group">
                        <i class="fa-solid fa-play"></i> Play Group
                    </button>
                </div>
            `;

            // Play group button handler
            const playGroupBtn = headerSection.querySelector('.group-play-btn');
            playGroupBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                activeQueue = songsInGroup;
                updateQueueUI();
                playSongByIndex(0);
                showToast(`Playing ${groupName} (${songsInGroup.length} tracks)`, 'info');
            });

            songsContainer.appendChild(headerSection);

            // Group Items
            if (viewMode === 'grid') {
                songsInGroup.forEach((song) => {
                    const idx = activeQueue.findIndex(s => s.id === song.id);
                    const card = createSongCard(song, idx >= 0 ? idx : 0);
                    songsContainer.appendChild(card);
                });
            } else {
                const listWrapper = document.createElement('div');
                listWrapper.className = 'songs-view-list';
                listWrapper.style.gridColumn = '1 / -1';
                listWrapper.style.marginBottom = '20px';

                songsInGroup.forEach((song) => {
                    const idx = activeQueue.findIndex(s => s.id === song.id);
                    const row = createSongListRow(song, idx >= 0 ? idx : 0);
                    listWrapper.appendChild(row);
                });

                songsContainer.appendChild(listWrapper);
            }
        });
    }

    /**
     * Create interactive Song Card (Grid View)
     */
    function createSongCard(song, queueIndex) {
        const card = document.createElement('div');
        const isCurrentPlaying = currentSong && currentSong.id === song.id;
        card.className = `song-card ${isCurrentPlaying ? 'now-playing' : ''}`;
        card.id = `card-${song.id}`;

        const artHtml = song.artworkUrl
            ? `<img src="${song.artworkUrl}" alt="${song.title}">`
            : `<i class="fa-solid fa-music default-art-icon"></i>`;

        const eqHtml = isCurrentPlaying
            ? `<div class="equalizer-wave">
                   <span class="eq-bar"></span>
                   <span class="eq-bar"></span>
                   <span class="eq-bar"></span>
                   <span class="eq-bar"></span>
               </div>`
            : '';

        card.innerHTML = `
            ${eqHtml}
            <div class="song-card-art">
                ${artHtml}
                <div class="card-play-overlay">
                    <div class="card-play-btn-circle">
                        <i class="fa-solid ${isCurrentPlaying && !audioPlayer.paused ? 'fa-pause' : 'fa-play'}"></i>
                    </div>
                </div>
            </div>
            <div class="song-card-info">
                <span class="song-card-title" title="${song.title}">${song.title}</span>
                <span class="song-card-movie" title="${song.movie}">
                    <i class="fa-solid fa-film"></i> ${song.movie}
                </span>
                <span class="song-card-sub" title="${song.hero} • ${song.singer}">
                    <i class="fa-solid fa-star" style="color:var(--accent-purple);"></i> ${song.hero}
                </span>
                <span class="song-card-sub" title="${song.singer}">
                    <i class="fa-solid fa-microphone" style="color:var(--text-muted);"></i> ${song.singer}
                </span>
            </div>
        `;

        // Direct Click-to-Play Handler
        card.addEventListener('click', () => {
            playSongFromCard(song);
        });

        return card;
    }

    /**
     * Create interactive Song Row (List View)
     */
    function createSongListRow(song, queueIndex) {
        const row = document.createElement('div');
        const isCurrentPlaying = currentSong && currentSong.id === song.id;
        row.className = `song-list-row ${isCurrentPlaying ? 'now-playing' : ''}`;
        row.id = `row-${song.id}`;

        const artThumbHtml = song.artworkUrl
            ? `<img src="${song.artworkUrl}" alt="${song.title}">`
            : `<i class="fa-solid fa-music"></i>`;

        const idxDisplay = isCurrentPlaying
            ? `<i class="fa-solid fa-volume-high" style="color: var(--accent-cyan);"></i>`
            : `${queueIndex + 1}`;

        row.innerHTML = `
            <div class="col-idx">${idxDisplay}</div>
            <div class="col-title-group">
                <div class="col-art-thumb">${artThumbHtml}</div>
                <span class="col-title" title="${song.title}">${song.title}</span>
            </div>
            <div class="col-movie" title="${song.movie}">
                <i class="fa-solid fa-film"></i> ${song.movie}
            </div>
            <div class="col-hero" title="${song.hero}">
                <i class="fa-solid fa-star"></i> ${song.hero}
            </div>
            <div class="col-singer" title="${song.singer}">
                <i class="fa-solid fa-microphone"></i> ${song.singer}
            </div>
            <div class="col-action">
                <button class="col-action-btn" title="Play Song">
                    <i class="fa-solid ${isCurrentPlaying && !audioPlayer.paused ? 'fa-pause' : 'fa-play'}"></i>
                </button>
            </div>
        `;

        // Direct Click-to-Play Handler
        row.addEventListener('click', () => {
            playSongFromCard(song);
        });

        return row;
    }

    /**
     * Click-to-Play logic triggered from cards, rows, or search results
     */
    async function playSongFromCard(song) {
        // Toggle play/pause if clicking the currently active track
        if (currentSong && currentSong.id === song.id) {
            if (audioPlayer.paused) {
                resumePlayback();
            } else {
                pausePlayback();
            }
            return;
        }

        // Find index in current active queue
        let targetIndex = activeQueue.findIndex(s => s.id === song.id);
        if (targetIndex === -1) {
            // If song is not in current activeQueue (e.g. from outside search), prepend or set activeQueue
            activeQueue = [song, ...songsMasterList.filter(s => s.id !== song.id)];
            targetIndex = 0;
            updateQueueUI();
        }

        await playSongByIndex(targetIndex);
    }

    // ==========================================
    // 6. Pro Audio Engine & Playback Controller
    // ==========================================

    /**
     * Play song by index in activeQueue
     */
    async function playSongByIndex(index) {
        if (!activeQueue || activeQueue.length === 0) return;
        if (index < 0 || index >= activeQueue.length) {
            index = 0;
        }

        // Cancel any pending auto-transition countdown
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }

        currentQueueIndex = index;
        const song = activeQueue[currentQueueIndex];
        currentSong = song;

        try {
            // Obtain actual File object
            let fileObj = song.file;
            if (!fileObj && song.handle) {
                fileObj = await song.handle.getFile();
            }

            if (!fileObj) {
                throw new Error('File handle is no longer accessible.');
            }

            // Create new ObjectURL safely
            const newAudioUrl = URL.createObjectURL(fileObj);

            // Pause and reset previous source
            audioPlayer.pause();
            audioPlayer.src = newAudioUrl;
            audioPlayer.load();

            // Revoke previous URL after assignment
            if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
            }
            currentAudioUrl = newAudioUrl;

            // Update UI & Dock
            updatePlayerDockUI(song);
            audioPlayerContainer.classList.remove('hidden');

            // Begin playback with Promise handling
            const playPromise = audioPlayer.play();
            if (playPromise !== undefined) {
                await playPromise;
            }

            // Update visual state and Media Session for Bluetooth
            updatePlayPauseUI(true);
            updateMediaSessionMetadata(song);
            highlightActiveTrackInViews();
            updateQueueUI();

        } catch (error) {
            console.error('Audio playback error:', error);
            showToast(`Could not play "${song.title}": ${error.message || 'Format unsupported'}`, 'warn');
            updatePlayPauseUI(false);
        }
    }

    function resumePlayback() {
        if (!audioPlayer.src) {
            if (activeQueue.length > 0) {
                playSongByIndex(0);
            }
            return;
        }

        audioPlayer.play().then(() => {
            updatePlayPauseUI(true);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        }).catch(err => {
            console.warn('Playback resume blocked:', err);
        });
    }

    function pausePlayback() {
        audioPlayer.pause();
        updatePlayPauseUI(false);
        if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
        }
    }

    function playNextSong() {
        if (!activeQueue || activeQueue.length === 0) return;

        if (isShuffle) {
            const randomIndex = Math.floor(Math.random() * activeQueue.length);
            playSongByIndex(randomIndex);
            return;
        }

        if (currentQueueIndex < activeQueue.length - 1) {
            playSongByIndex(currentQueueIndex + 1);
        } else if (repeatMode === 'all') {
            playSongByIndex(0);
        } else {
            showToast('Reached end of playlist.', 'info');
        }
    }

    function playPreviousSong() {
        if (!activeQueue || activeQueue.length === 0) return;

        // If played more than 3 seconds, restart current track
        if (audioPlayer.currentTime > 3) {
            audioPlayer.currentTime = 0;
            updatePositionState();
            return;
        }

        if (currentQueueIndex > 0) {
            playSongByIndex(currentQueueIndex - 1);
        } else if (repeatMode === 'all') {
            playSongByIndex(activeQueue.length - 1);
        }
    }

    // Play/Pause button toggle
    playPauseBtn.addEventListener('click', () => {
        if (audioPlayer.paused) {
            resumePlayback();
        } else {
            pausePlayback();
        }
    });

    // Previous and Next buttons
    prevSongBtn.addEventListener('click', () => {
        playPreviousSong();
    });

    nextSongBtn.addEventListener('click', () => {
        playNextSong();
    });

    // Shuffle Mode toggle
    shuffleBtn.addEventListener('click', () => {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        showToast(isShuffle ? 'Shuffle: ON' : 'Shuffle: OFF', 'info');
    });

    // Repeat Mode toggle (OFF -> ALL -> ONE)
    repeatBtn.addEventListener('click', () => {
        if (repeatMode === 'off') {
            repeatMode = 'all';
            repeatBtn.classList.add('active');
            repeatModeBadge.textContent = 'ALL';
            showToast('Repeat Mode: Repeat All', 'info');
        } else if (repeatMode === 'all') {
            repeatMode = 'one';
            repeatBtn.classList.add('active');
            repeatModeBadge.textContent = '1';
            showToast('Repeat Mode: Repeat Track', 'info');
        } else {
            repeatMode = 'off';
            repeatBtn.classList.remove('active');
            repeatModeBadge.textContent = 'OFF';
            showToast('Repeat Mode: OFF', 'info');
        }
    });

    // Autoplay Next Song with 2-Second Gap Transition
    audioPlayer.addEventListener('ended', () => {
        if (repeatMode === 'one') {
            audioPlayer.currentTime = 0;
            audioPlayer.play();
            return;
        }

        const hasNext = isShuffle || currentQueueIndex < activeQueue.length - 1 || repeatMode === 'all';
        if (hasNext) {
            let nextIdx = currentQueueIndex + 1;
            if (isShuffle) {
                nextIdx = Math.floor(Math.random() * activeQueue.length);
            } else if (nextIdx >= activeQueue.length && repeatMode === 'all') {
                nextIdx = 0;
            }

            const nextSongObj = activeQueue[nextIdx];
            audioTitle.textContent = `Next in 2s: ${nextSongObj.title}`;
            gapTransitionBadge.style.background = 'rgba(0, 240, 255, 0.25)';
            gapTransitionBadge.style.color = 'var(--accent-cyan)';

            autoPlayTimer = setTimeout(async () => {
                gapTransitionBadge.style.background = '';
                gapTransitionBadge.style.color = '';
                await playSongByIndex(nextIdx);
            }, 2000);
        } else {
            audioTitle.textContent = "End of playlist";
            updatePlayPauseUI(false);
        }
    });

    // Track Time Progress & Buffer Updates
    audioPlayer.addEventListener('timeupdate', () => {
        if (isSeeking) return;

        const current = audioPlayer.currentTime || 0;
        const total = audioPlayer.duration || 0;

        currentTimeLabel.textContent = formatTime(current);

        if (total > 0 && !isNaN(total)) {
            const pct = (current / total) * 100;
            seekProgressBar.style.width = `${pct}%`;
            seekSlider.value = pct;
        }

        updatePositionState();
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        const total = audioPlayer.duration || 0;
        totalDurationLabel.textContent = formatTime(total);
        updatePositionState();
    });

    audioPlayer.addEventListener('progress', () => {
        if (audioPlayer.buffered.length > 0 && audioPlayer.duration) {
            const bufferedEnd = audioPlayer.buffered.end(audioPlayer.buffered.length - 1);
            const bufferPct = (bufferedEnd / audioPlayer.duration) * 100;
            seekBufferBar.style.width = `${bufferPct}%`;
        }
    });

    // Custom Interactive Seek Slider
    seekSlider.addEventListener('input', (e) => {
        isSeeking = true;
        const pct = e.target.value;
        seekProgressBar.style.width = `${pct}%`;
        if (audioPlayer.duration) {
            currentTimeLabel.textContent = formatTime((pct / 100) * audioPlayer.duration);
        }
    });

    seekSlider.addEventListener('change', (e) => {
        isSeeking = false;
        const pct = e.target.value;
        if (audioPlayer.duration) {
            audioPlayer.currentTime = (pct / 100) * audioPlayer.duration;
            updatePositionState();
        }
    });

    // Custom Volume Slider & Mute Control
    volumeSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        audioPlayer.volume = val;
        isMuted = val === 0;
        updateVolumeIcon(val);
    });

    volumeBtn.addEventListener('click', () => {
        if (isMuted) {
            audioPlayer.volume = previousVolume || 1;
            volumeSlider.value = previousVolume || 1;
            isMuted = false;
        } else {
            previousVolume = audioPlayer.volume;
            audioPlayer.volume = 0;
            volumeSlider.value = 0;
            isMuted = true;
        }
        updateVolumeIcon(audioPlayer.volume);
    });

    function updateVolumeIcon(vol) {
        if (vol === 0 || isMuted) {
            volumeIcon.className = 'fa-solid fa-volume-xmark';
        } else if (vol < 0.5) {
            volumeIcon.className = 'fa-solid fa-volume-low';
        } else {
            volumeIcon.className = 'fa-solid fa-volume-high';
        }
    }

    playerFavBtn.addEventListener('click', () => {
        const icon = playerFavBtn.querySelector('i');
        const isFav = icon.classList.contains('fa-solid');
        icon.className = isFav ? 'fa-regular fa-heart' : 'fa-solid fa-heart';
        icon.style.color = isFav ? '' : 'var(--accent-danger)';
        showToast(isFav ? 'Removed from favorites' : 'Added to favorites!', 'info');
    });

    // ==========================================
    // 7. UI Synchronizers & Helpers
    // ==========================================

    function updatePlayPauseUI(isPlaying) {
        if (isPlaying) {
            playPauseIcon.className = 'fa-solid fa-pause';
            audioPlayerContainer.classList.add('is-playing');
        } else {
            playPauseIcon.className = 'fa-solid fa-play';
            audioPlayerContainer.classList.remove('is-playing');
        }

        // Sync card and row buttons
        document.querySelectorAll('.song-card, .song-list-row').forEach(el => {
            const isTarget = currentSong && (el.id === `card-${currentSong.id}` || el.id === `row-${currentSong.id}`);
            const btnIcon = el.querySelector('.card-play-btn-circle i, .col-action-btn i');
            if (btnIcon) {
                if (isTarget && isPlaying) {
                    btnIcon.className = 'fa-solid fa-pause';
                } else {
                    btnIcon.className = 'fa-solid fa-play';
                }
            }
        });
    }

    function updatePlayerDockUI(song) {
        audioTitle.textContent = song.title;
        audioMovie.innerHTML = `<i class="fa-solid fa-film"></i> ${song.movie}`;
        audioArtist.innerHTML = `<i class="fa-solid fa-microphone"></i> ${song.singer}`;

        if (song.hero && song.hero !== 'Various Artists') {
            audioHero.innerHTML = `<i class="fa-solid fa-star"></i> ${song.hero}`;
            audioHero.classList.remove('hidden');
        } else {
            audioHero.classList.add('hidden');
        }

        if (song.artworkUrl) {
            playerTrackArt.src = song.artworkUrl;
            playerTrackArt.classList.remove('hidden');
            playerDefaultArt.classList.add('hidden');
        } else {
            playerTrackArt.classList.add('hidden');
            playerDefaultArt.classList.remove('hidden');
        }
    }

    function highlightActiveTrackInViews() {
        document.querySelectorAll('.song-card, .song-list-row').forEach(el => {
            el.classList.remove('now-playing');
            const eq = el.querySelector('.equalizer-wave');
            if (eq) eq.remove();
        });

        if (!currentSong) return;

        const activeCard = document.getElementById(`card-${currentSong.id}`);
        if (activeCard) {
            activeCard.classList.add('now-playing');
            if (!activeCard.querySelector('.equalizer-wave')) {
                const eq = document.createElement('div');
                eq.className = 'equalizer-wave';
                eq.innerHTML = `
                    <span class="eq-bar"></span>
                    <span class="eq-bar"></span>
                    <span class="eq-bar"></span>
                    <span class="eq-bar"></span>
                `;
                activeCard.prepend(eq);
            }
        }

        const activeRow = document.getElementById(`row-${currentSong.id}`);
        if (activeRow) {
            activeRow.classList.add('now-playing');
            const idxCol = activeRow.querySelector('.col-idx');
            if (idxCol) {
                idxCol.innerHTML = `<i class="fa-solid fa-volume-high" style="color: var(--accent-cyan);"></i>`;
            }
        }
    }

    function formatTime(sec) {
        if (!sec || isNaN(sec) || !isFinite(sec)) return '0:00';
        const mins = Math.floor(sec / 60);
        const secs = Math.floor(sec % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // ==========================================
    // 8. Queue Drawer Implementation
    // ==========================================

    queueToggleBtn.addEventListener('click', toggleQueueDrawer);
    closeQueueBtn.addEventListener('click', closeQueueDrawer);
    queueBackdrop.addEventListener('click', closeQueueDrawer);

    function toggleQueueDrawer() {
        const isOpen = queueDrawer.classList.contains('active');
        if (isOpen) closeQueueDrawer();
        else openQueueDrawer();
    }

    function openQueueDrawer() {
        queueDrawer.classList.add('active');
        queueBackdrop.classList.add('active');
        renderQueueList();
    }

    function closeQueueDrawer() {
        queueDrawer.classList.remove('active');
        queueBackdrop.classList.remove('active');
    }

    clearQueueBtn.addEventListener('click', () => {
        activeQueue = [...songsMasterList];
        currentQueueIndex = activeQueue.findIndex(s => currentSong && s.id === currentSong.id);
        updateQueueUI();
        renderQueueList();
        renderSongs();
        showToast('Playback queue reset to full library.', 'info');
    });

    function updateQueueUI() {
        queueBadgeCount.textContent = activeQueue.length;
        queueTotalTracks.textContent = `${activeQueue.length} ${activeQueue.length === 1 ? 'track' : 'tracks'}`;
    }

    function renderQueueList() {
        queueList.innerHTML = '';
        if (activeQueue.length === 0) {
            queueList.innerHTML = `<p style="color:var(--text-muted); padding: 20px; text-align: center;">Queue is empty</p>`;
            return;
        }

        activeQueue.forEach((song, idx) => {
            const item = document.createElement('div');
            const isActive = currentSong && currentSong.id === song.id;
            item.className = `queue-item ${isActive ? 'active' : ''}`;
            item.innerHTML = `
                <span class="queue-item-idx">${isActive ? '▶' : idx + 1}</span>
                <div class="queue-item-info">
                    <div class="queue-item-title">${song.title}</div>
                    <div class="queue-item-sub">${song.movie} • ${song.singer}</div>
                </div>
            `;
            item.addEventListener('click', () => {
                playSongByIndex(idx);
                renderQueueList();
            });
            queueList.appendChild(item);
        });
    }

    // ==========================================
    // 9. Video & PDF Viewers
    // ==========================================

    function renderVideos() {
        videosGrid.innerHTML = '';
        if (videosMasterList.length === 0) {
            videosGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column: 1 / -1; text-align: center; padding: 40px;">No video files found on this drive.</p>';
            return;
        }

        videosMasterList.forEach(file => {
            const el = document.createElement('div');
            el.className = 'file-item video';
            el.innerHTML = `
                <div class="file-icon"><i class="fa-solid fa-video"></i></div>
                <div class="file-name" title="${file.name}">${file.name}</div>
            `;
            el.addEventListener('click', () => openVideoOrPdf(file));
            videosGrid.appendChild(el);
        });
    }

    function renderPdfs() {
        pdfsGrid.innerHTML = '';
        if (pdfsMasterList.length === 0) {
            pdfsGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column: 1 / -1; text-align: center; padding: 40px;">No PDF files found on this drive.</p>';
            return;
        }

        pdfsMasterList.forEach(file => {
            const el = document.createElement('div');
            el.className = 'file-item pdf';
            el.innerHTML = `
                <div class="file-icon"><i class="fa-solid fa-file-pdf"></i></div>
                <div class="file-name" title="${file.name}">${file.name}</div>
            `;
            el.addEventListener('click', () => openVideoOrPdf(file));
            pdfsGrid.appendChild(el);
        });
    }

    async function openVideoOrPdf(fileInfo) {
        try {
            if (currentModalUrl) {
                URL.revokeObjectURL(currentModalUrl);
                currentModalUrl = null;
            }

            modalTitle.textContent = fileInfo.name;

            if (fileInfo.isDemo) {
                if (fileInfo.type === 'video') {
                    modalBody.innerHTML = `
                        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; color:#fff; text-align:center; padding:20px;">
                            <i class="fa-solid fa-film" style="font-size:4rem; color:var(--accent-danger); margin-bottom:16px;"></i>
                            <h2>Demo Video Player</h2>
                            <p style="color:var(--text-secondary); margin-top:8px;">${fileInfo.name}</p>
                            <p style="color:var(--accent-gold); margin-top:12px;">Insert your USB Pen Drive to stream real high-definition MP4/MKV movies directly in-browser!</p>
                        </div>
                    `;
                } else {
                    modalBody.innerHTML = `
                        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height:100%; color:#fff; text-align:center; padding:20px;">
                            <i class="fa-solid fa-file-pdf" style="font-size:4rem; color:var(--accent-gold); margin-bottom:16px;"></i>
                            <h2>Demo PDF Document</h2>
                            <p style="color:var(--text-secondary); margin-top:8px;">${fileInfo.name}</p>
                            <p style="color:var(--accent-cyan); margin-top:12px;">Client-side PDF reader with zero data uploading or network transfer.</p>
                        </div>
                    `;
                }
                modal.classList.add('active');
                return;
            }

            const fileObj = fileInfo.file || (fileInfo.handle ? await fileInfo.handle.getFile() : null);
            if (!fileObj) throw new Error('File not accessible');

            currentModalUrl = URL.createObjectURL(fileObj);

            if (fileInfo.type === 'video') {
                modalBody.innerHTML = `<video controls autoplay style="width:100%; height:100%;"><source src="${currentModalUrl}"></video>`;
                pausePlayback(); // Pause audio if playing
            } else if (fileInfo.type === 'pdf') {
                modalBody.innerHTML = `<iframe src="${currentModalUrl}#toolbar=1" width="100%" height="100%"></iframe>`;
            }

            modal.classList.add('active');
        } catch (e) {
            console.error('Error viewing media:', e);
            showToast('Failed to open file: ' + e.message, 'warn');
        }
    }

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    function closeModal() {
        modal.classList.remove('active');
        modalBody.innerHTML = '';
        if (currentModalUrl) {
            URL.revokeObjectURL(currentModalUrl);
            currentModalUrl = null;
        }
    }

    // ==========================================
    // 10. Navigation Tabs & Shortcuts
    // ==========================================

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const tab = btn.getAttribute('data-tab');
            tabTitle.textContent = tab.charAt(0).toUpperCase() + tab.slice(1);

            if (tab === 'songs') {
                tabSubtitle.textContent = 'All audio tracks';
                songsToolbar.style.display = 'flex';
                filterChipsBar.style.display = 'flex';
            } else if (tab === 'videos') {
                tabSubtitle.textContent = 'MP4, MKV & WebM movies';
                songsToolbar.style.display = 'none';
                filterChipsBar.style.display = 'none';
                renderVideos();
            } else if (tab === 'pdfs') {
                tabSubtitle.textContent = 'PDF books & documents';
                songsToolbar.style.display = 'none';
                filterChipsBar.style.display = 'none';
                renderPdfs();
            }

            tabContents.forEach(c => {
                c.classList.toggle('active', c.id === `tab-${tab}`);
            });
        });
    });

    // Global Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        // Do not intercept when typing in search
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
            if (e.key === 'Escape') {
                searchInput.blur();
            }
            return;
        }

        if (e.code === 'Space') {
            e.preventDefault();
            if (audioPlayer.paused) resumePlayback();
            else pausePlayback();
        } else if (e.key === 'n' || e.key === 'N') {
            playNextSong();
        } else if (e.key === 'p' || e.key === 'P') {
            playPreviousSong();
        } else if (e.key === 'm' || e.key === 'M') {
            volumeBtn.click();
        } else if (e.key === '/') {
            e.preventDefault();
            searchInput.focus();
        } else if (e.key === 'ArrowRight') {
            audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 5, audioPlayer.duration || 0);
            updatePositionState();
        } else if (e.key === 'ArrowLeft') {
            audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 5, 0);
            updatePositionState();
        }
    });

    // Toast Notification System
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'warn') icon = 'fa-triangle-exclamation';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }

    // Reset Application State
    function resetApplication() {
        directoryHandle = null;
        allMediaFiles = [];
        songsMasterList = [];
        videosMasterList = [];
        pdfsMasterList = [];
        activeQueue = [];
        currentQueueIndex = -1;
        currentSong = null;

        audioPlayer.pause();
        audioPlayer.src = '';
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            currentAudioUrl = null;
        }

        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }

        audioPlayerContainer.classList.add('hidden');
        closeModal();
        closeQueueDrawer();

        songsContainer.innerHTML = '';
        videosGrid.innerHTML = '';
        pdfsGrid.innerHTML = '';
        updateBadges();

        mainApp.classList.remove('active');
        welcomeScreen.classList.add('active');
        showToast('Pen Drive disconnected.', 'info');
    }
});
