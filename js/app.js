document.addEventListener('DOMContentLoaded', () => {
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const welcomeScreen = document.getElementById('welcome-screen');
    const mainApp = document.getElementById('main-app');
    const navBtns = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabTitle = document.getElementById('current-tab-title');
    const searchInput = document.getElementById('search-input');
    
    // Grids
    const songsGrid = document.getElementById('songs-grid');
    const videosGrid = document.getElementById('videos-grid');
    const pdfsGrid = document.getElementById('pdfs-grid');

    // Media elements
    const audioPlayerContainer = document.getElementById('audio-player-container');
    const audioPlayer = document.getElementById('audio-player');
    const audioTitle = document.getElementById('audio-title');
    const prevSongBtn = document.getElementById('prev-song');
    const nextSongBtn = document.getElementById('next-song');
    
    const modal = document.getElementById('media-modal');
    const modalBody = document.getElementById('modal-body');
    const closeBtn = document.querySelector('.close-btn');

    let directoryHandle = null;
    let allFiles = []; // Store file handles and metadata
    let currentObjectUrl = null; // For modal cleanup
    let currentAudioUrl = null; // For audio cleanup
    
    // State for playlist
    let songsOnly = [];
    let currentSongIndex = -1;

    // Allowed extensions
    const extMap = {
        'mp3': 'song',
        'wav': 'song',
        'ogg': 'song',
        'mp4': 'video',
        'mkv': 'video',
        'webm': 'video',
        'pdf': 'pdf'
    };

    connectBtn.addEventListener('click', async () => {
        try {
            // Request directory access
            directoryHandle = await window.showDirectoryPicker({
                mode: 'read'
            });
            
            // UI transition
            welcomeScreen.classList.remove('active');
            mainApp.classList.add('active');
            
            // Scan files
            await scanDirectory(directoryHandle);
            renderFiles();
            
        } catch (error) {
            console.error('Error accessing directory:', error);
            if (error.name !== 'AbortError') {
                alert('Failed to access Pen Drive. Please ensure you are using a supported browser (Chrome/Edge).');
            }
        }
    });

    disconnectBtn.addEventListener('click', () => {
        // Reset everything
        directoryHandle = null;
        allFiles = [];
        songsOnly = [];
        currentSongIndex = -1;
        songsGrid.innerHTML = '';
        videosGrid.innerHTML = '';
        pdfsGrid.innerHTML = '';
        
        // Stop audio
        audioPlayer.pause();
        audioPlayer.src = '';
        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
            currentAudioUrl = null;
        }
        audioPlayerContainer.classList.add('hidden');
        
        // Close modal
        closeModal();
        
        mainApp.classList.remove('active');
        welcomeScreen.classList.add('active');
    });

    // Tab Navigation
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const targetTab = btn.getAttribute('data-tab');
            
            // Update title
            tabTitle.textContent = targetTab.charAt(0).toUpperCase() + targetTab.slice(1);
            
            // Show corresponding content
            tabContents.forEach(content => {
                if (content.id === `tab-${targetTab}`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll('.file-item').forEach(item => {
            const name = item.querySelector('.file-name').textContent.toLowerCase();
            if (name.includes(term)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });

    // Modal Close
    closeBtn.addEventListener('click', closeModal);

    function closeModal() {
        modal.classList.remove('active');
        modalBody.innerHTML = '';
        if (currentObjectUrl) {
            URL.revokeObjectURL(currentObjectUrl);
            currentObjectUrl = null;
        }
    }

    // Recursively scan the directory for supported files
    async function scanDirectory(dirHandle) {
        // Clear previous files
        allFiles = [];
        
        async function readDir(handle) {
            try {
                for await (const entry of handle.values()) {
                    if (entry.kind === 'file') {
                        const ext = entry.name.split('.').pop().toLowerCase();
                        if (extMap[ext]) {
                            allFiles.push({
                                handle: entry,
                                name: entry.name,
                                type: extMap[ext]
                            });
                        }
                    } else if (entry.kind === 'directory') {
                        // Recursively read subdirectories
                        await readDir(entry);
                    }
                }
            } catch (err) {
                console.warn('Skipping inaccessible folder', err);
            }
        }
        
        await readDir(dirHandle);
    }

    const popularSingers = [
        "Arijit Singh", "Sid Sriram", "Anirudh", "Shreya Ghoshal", 
        "A.R. Rahman", "AR Rahman", "S.P. Balasubrahmanyam", "SPB", 
        "Armaan Malik", "DSP", "Devi Sri Prasad", "Thaman", 
        "Sanjith Hegde", "Sonu Nigam", "K.S. Chithra", "Hariharan",
        "Karthik", "Udit Narayan", "Alka Yagnik", "Lata Mangeshkar",
        "Kishore Kumar", "Justin Bieber", "Ed Sheeran", "Taylor Swift",
        "The Weeknd", "Dua Lipa", "Arjit Singh", "Harris Jayaraj",
        "Ilayaraja", "Yuvan Shankar Raja", "G.V. Prakash", "Vijay Prakash"
    ];

    function getSinger(fileName) {
        const nameLower = fileName.toLowerCase();
        for (const singer of popularSingers) {
            if (nameLower.includes(singer.toLowerCase())) {
                return singer;
            }
        }
        if (fileName.includes('-')) {
            const parts = fileName.split('-');
            const possibleSinger = parts[0].trim();
            if (possibleSinger && possibleSinger.length < 30) {
                return possibleSinger;
            }
        }
        return "Other Singers";
    }

    function renderFiles() {
        songsGrid.innerHTML = '';
        videosGrid.innerHTML = '';
        pdfsGrid.innerHTML = '';
        
        songsOnly = allFiles.filter(f => f.type === 'song');
        const videosOnly = allFiles.filter(f => f.type === 'video');
        const pdfsOnly = allFiles.filter(f => f.type === 'pdf');

        // Group songs by singer
        const songsBySinger = {};
        songsOnly.forEach(file => {
            const singer = getSinger(file.name);
            if (!songsBySinger[singer]) songsBySinger[singer] = [];
            songsBySinger[singer].push(file);
        });

        // Sort singers (Others at the end, rest alphabetical)
        const sortedSingers = Object.keys(songsBySinger).sort((a, b) => {
            if (a === "Other Singers") return 1;
            if (b === "Other Singers") return -1;
            return a.localeCompare(b);
        });

        // Render grouped songs
        for (const singer of sortedSingers) {
            const files = songsBySinger[singer];
            
            const header = document.createElement('h3');
            header.style.gridColumn = '1 / -1';
            header.style.color = 'var(--accent-primary)';
            header.style.margin = '20px 0 10px 0';
            header.style.borderBottom = '1px solid var(--glass-border)';
            header.style.paddingBottom = '10px';
            header.style.textAlign = 'left';
            header.innerHTML = `<i class="fa-solid fa-microphone-lines"></i> ${singer}`;
            songsGrid.appendChild(header);

            files.forEach(file => {
                const el = document.createElement('div');
                el.className = `file-item song`;
                el.innerHTML = `
                    <div class="file-icon"><i class="fa-solid fa-music"></i></div>
                    <div class="file-name" title="${file.name}">${file.name}</div>
                `;
                el.addEventListener('click', () => openFile(file));
                songsGrid.appendChild(el);
            });
        }

        // Render videos
        videosOnly.forEach(file => {
            const el = document.createElement('div');
            el.className = `file-item video`;
            el.innerHTML = `
                <div class="file-icon"><i class="fa-solid fa-video"></i></div>
                <div class="file-name" title="${file.name}">${file.name}</div>
            `;
            el.addEventListener('click', () => openFile(file));
            videosGrid.appendChild(el);
        });

        // Render PDFs
        pdfsOnly.forEach(file => {
            const el = document.createElement('div');
            el.className = `file-item pdf`;
            el.innerHTML = `
                <div class="file-icon"><i class="fa-solid fa-file-pdf"></i></div>
                <div class="file-name" title="${file.name}">${file.name}</div>
            `;
            el.addEventListener('click', () => openFile(file));
            pdfsGrid.appendChild(el);
        });
        
        if(songsOnly.length === 0) songsGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column: 1 / -1; text-align: center;">No songs found</p>';
        if(videosOnly.length === 0) videosGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column: 1 / -1; text-align: center;">No videos found</p>';
        if(pdfsOnly.length === 0) pdfsGrid.innerHTML = '<p style="color:var(--text-secondary); grid-column: 1 / -1; text-align: center;">No PDFs found</p>';
    }

    async function openFile(fileInfo) {
        try {
            if (fileInfo.type === 'song') {
                currentSongIndex = songsOnly.findIndex(s => s.name === fileInfo.name);
                await playSong(fileInfo);
            } 
            else {
                // Video or PDF
                const file = await fileInfo.handle.getFile();
                if (currentObjectUrl) {
                    URL.revokeObjectURL(currentObjectUrl);
                }
                const objectUrl = URL.createObjectURL(file);
                
                if (fileInfo.type === 'video') {
                    currentObjectUrl = objectUrl;
                    modalBody.innerHTML = `<video controls autoplay><source src="${objectUrl}"></video>`;
                    modal.classList.add('active');
                    // Pause audio if playing
                    audioPlayer.pause();
                } 
                else if (fileInfo.type === 'pdf') {
                    currentObjectUrl = objectUrl;
                    modalBody.innerHTML = `<iframe src="${objectUrl}#toolbar=0" width="100%" height="100%"></iframe>`;
                    modal.classList.add('active');
                }
            }
        } catch (error) {
            console.error('Error opening file:', error);
            alert('Failed to open file. The file might have been removed or disconnected.');
        }
    }

    async function playSong(fileInfo) {
        try {
            const file = await fileInfo.handle.getFile();
            if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
            }
            currentAudioUrl = URL.createObjectURL(file);
            audioPlayer.src = currentAudioUrl;
            audioTitle.textContent = fileInfo.name;
            audioPlayerContainer.classList.remove('hidden');
            audioPlayer.play();
        } catch (error) {
            console.error('Error playing song:', error);
            alert('Failed to play the song. Please ensure the drive is still connected.');
        }
    }

    // Audio Player Controls Logic
    prevSongBtn.addEventListener('click', async () => {
        if (songsOnly.length > 0 && currentSongIndex > 0) {
            currentSongIndex--;
            await playSong(songsOnly[currentSongIndex]);
        }
    });

    nextSongBtn.addEventListener('click', async () => {
        if (songsOnly.length > 0 && currentSongIndex < songsOnly.length - 1) {
            currentSongIndex++;
            await playSong(songsOnly[currentSongIndex]);
        }
    });

    // Autoplay Next Song with 2-second gap
    audioPlayer.addEventListener('ended', () => {
        if (songsOnly.length > 0 && currentSongIndex < songsOnly.length - 1) {
            currentSongIndex++;
            audioTitle.textContent = "Up next in 2s: " + songsOnly[currentSongIndex].name;
            setTimeout(async () => {
                await playSong(songsOnly[currentSongIndex]);
            }, 2000);
        } else {
            audioTitle.textContent = "End of playlist";
        }
    });
});
