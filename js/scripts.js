let channels = [];
        let activeChannels = [];
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        let uploadHistory = JSON.parse(localStorage.getItem('uploadHistory')) || [];
        let currentChannelIndex = -1;
        let hlsInstance = null;
        let dashInstance = null;
        let showFavoritesOnly = false;
        let channelFilter = 'all';
        let showingHistory = false;
        let selectedCategory = '';
        const videoPlayer = document.getElementById('videoPlayer');
        const sidebar = document.getElementById('sidebar');
        const channelList = document.getElementById('channelList');
        const popupOverlay = document.getElementById('popupOverlay');
        const historyPopup = document.getElementById('historyPopup');
        const epgPopup = document.getElementById('epgPopup');
        const multiPlaylistSelect = document.getElementById('multiPlaylistSelect');
        const historyList = document.getElementById('historyList');
        const epgContent = document.getElementById('epgContent');
        const urlInput = document.getElementById('urlInput');
        const fileInput = document.getElementById('fileInput');
        const qualitySelector = document.getElementById('qualitySelector');
        const sleepTimer = document.getElementById('sleepTimer');
        const controls = document.getElementById('controls');
        const totalChannelsSpan = document.getElementById('totalChannels');
        const onlineChannelsSpan = document.getElementById('onlineChannels');
        const offlineChannelsSpan = document.getElementById('offlineChannels');
        const searchBar = document.getElementById('searchBar');
        const tvFrame = document.getElementById('tvFrame');
        const datetime = document.getElementById('datetime');
        const defaultPlaylistUrl = 'https://iptv-org.github.io/iptv/countries/us.m3u';
        const loadingOverlay = document.getElementById('loadingOverlay');
        const loadingProgress = document.getElementById('loadingProgress');
        const categoryFilter = document.getElementById('categoryFilter');

        const supportedCodecs = [
            'video/mp4;codecs="avc1.42001E"',
            'video/mp4;codecs="avc1.64001E"',
            'video/mp4;codecs="avc1.4D401E"',
            'video/mp4;codecs="avc1.4D401F"',
            'audio/mp4;codecs="mp4a.40.2"',
            'application/vnd.apple.mpegurl'
        ];

        const themes = ['light', 'dark', 'ocean-blue', 'emerald-green', 'slate-gray'];
        let currentThemeIndex = 0;

        // Event Listeners for Buttons
        document.getElementById('sidebarToggleBtn').addEventListener('click', toggleSidebar);
        document.getElementById('favoritesToggleBtn').addEventListener('click', toggleFavorites);
        document.getElementById('themeCycleBtn').addEventListener('click', cycleTheme);
        document.getElementById('fullscreenToggleBtn').addEventListener('click', toggleFullscreen);
        document.getElementById('pipToggleBtn').addEventListener('click', togglePiP);
        document.getElementById('epgShowBtn').addEventListener('click', showEPG);
        document.getElementById('loadUrlBtn').addEventListener('click', addM3UList);
        document.getElementById('closePopupBtn').addEventListener('click', hidePopup);
        document.getElementById('closeEpgPopupBtn').addEventListener('click', hidePopup);
        document.getElementById('showAllChannelsBtn').addEventListener('click', showAllChannels);
        document.getElementById('showOnlineChannelsBtn').addEventListener('click', showOnlineChannels);
        document.getElementById('showOfflineChannelsBtn').addEventListener('click', showOfflineChannels);
        urlInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addM3UList(); });
        fileInput.addEventListener('change', handleFileUpload);
        qualitySelector.addEventListener('change', changeQuality);
        sleepTimer.addEventListener('change', setSleepTimer);
        categoryFilter.addEventListener('change', filterByCategory);
        searchBar.addEventListener('input', filterChannels);
        multiPlaylistSelect.addEventListener('change', loadSelectedPlaylist);
        document.getElementById('defaultPlaylistToggle').addEventListener('change', toggleDefaultPlaylist);
        document.getElementById('historyToggle').addEventListener('change', toggleHistory);

        function toggleSidebar() {
            sidebar.classList.toggle('active');
        }

        function toggleHistory() {
            showingHistory = document.getElementById('historyToggle').checked;
            if (showingHistory) {
                displayHistory();
            } else {
                displayChannels();
            }
        }

        function cycleTheme() {
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const theme = themes[currentThemeIndex];
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            updateThemeIcon(theme);
        }

        function updateThemeIcon(theme) {
            const themeIcon = document.getElementById('themeCycleBtn').querySelector('svg');
            if (theme === 'dark') {
                themeIcon.innerHTML = '<path d="M12 2a10 10 0 00-3.16 19.4c.6.12 1.21.2 1.84.2 4.41 0 8-3.59 8-8a10 10 0 00-14.84-8.36 9.91 9.91 0 007.16-2.24z"/>';
            } else {
                themeIcon.innerHTML = '<path d="M12 2v2m0 16v2m10-10h-2M4 12H2m16.36-6.36l-1.41 1.41M7.05 17.05l-1.41 1.41m12.31 0l-1.41-1.41M5.64 5.64L7.05 7.05M12 6a6 6 0 100 12 6 6 0 000-12z"/>';
            }
        }

        function updateDateTime() {
            const now = new Date();
            const date = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
            const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
            datetime.textContent = `${date} ${time}`;
        }
        setInterval(updateDateTime, 1000);
        updateDateTime();

        let hideControlsTimeout;
        function showControls() {
            controls.classList.remove('hidden');
            clearTimeout(hideControlsTimeout);
            hideControlsTimeout = setTimeout(() => {
                if (!controls.matches(':hover')) {
                    controls.classList.add('hidden');
                }
            }, 3000);
        }

        document.addEventListener('mousemove', showControls);
        controls.addEventListener('mouseenter', () => clearTimeout(hideControlsTimeout));
        controls.addEventListener('mouseleave', () => {
            hideControlsTimeout = setTimeout(() => controls.classList.add('hidden'), 3000);
        });

        document.addEventListener('keydown', (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlKey = isMac ? e.metaKey : e.ctrlKey;
            if (ctrlKey && e.key === 'b') {
                e.preventDefault();
                toggleSidebar();
            }
            if (ctrlKey && e.key === 'f') {
                e.preventDefault();
                toggleFavorites();
            }
            if (ctrlKey && e.key === 't') {
                e.preventDefault();
                cycleTheme();
            }
            if (ctrlKey && e.key === 'l') {
                e.preventDefault();
                urlInput.focus();
            }
            if (ctrlKey && e.key === 's') {
                e.preventDefault();
                searchBar.focus();
            }
            if (ctrlKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                if (channels.length > 1) {
                    currentChannelIndex += e.key === 'ArrowRight' ? 1 : -1;
                    if (currentChannelIndex < 0) currentChannelIndex = channels.length - 1;
                    if (currentChannelIndex >= channels.length) currentChannelIndex = 0;
                    loadStream(channels[currentChannelIndex].url, currentChannelIndex);
                }
            }
            if (e.key === 'Escape') {
                if (sidebar.classList.contains('active')) {
                    toggleSidebar();
                }
                hidePopup();
            }
        });

        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleGestures();
        });

        function handleGestures() {
            const swipeDistanceX = touchEndX - touchStartX;
            const swipeDistanceY = touchEndY - touchStartY;
            const isMobile = window.innerWidth <= 1024;
            const tvFrameRect = tvFrame.getBoundingClientRect();

            if (isMobile) {
                const edgeThreshold = window.innerWidth * 0.1;
                if (touchStartX > window.innerWidth - edgeThreshold && swipeDistanceX < -50) {
                    toggleSidebar();
                }
                if (sidebar.classList.contains('active') && swipeDistanceX > 50) {
                    toggleSidebar();
                }
                const channelListRect = channelList.getBoundingClientRect();
                if (
                    touchStartX >= channelListRect.left &&
                    touchStartX <= channelListRect.right &&
                    touchStartY >= channelListRect.top &&
                    touchStartY <= channelListRect.bottom &&
                    swipeDistanceY > 50
                ) {
                    searchBar.value = '';
                    filterChannels();
                }
                if (
                    touchStartX >= tvFrameRect.left &&
                    touchStartX <= tvFrameRect.right &&
                    touchStartY >= tvFrameRect.top &&
                    touchStartY <= tvFrameRect.bottom &&
                    Math.abs(swipeDistanceX) > 50 &&
                    Math.abs(swipeDistanceY) < 50
                ) {
                    if (channels.length > 1) {
                        currentChannelIndex += swipeDistanceX < 0 ? 1 : -1;
                        if (currentChannelIndex < 0) currentChannelIndex = channels.length - 1;
                        if (currentChannelIndex >= channels.length) currentChannelIndex = 0;
                        loadStream(channels[currentChannelIndex].url, currentChannelIndex);
                    }
                }
            }
        }

        tvFrame.addEventListener('click', (e) => {
            if (e.target !== controls && !controls.contains(e.target)) {
                toggleSidebar();
            }
        });

        function showPopup(popupId) {
            popupOverlay.style.display = 'block';
            document.getElementById(popupId).style.display = 'block';
        }

        function hidePopup() {
            popupOverlay.style.display = 'none';
            historyPopup.style.display = 'none';
            epgPopup.style.display = 'none';
        }

        function toggleFavorites() {
            showFavoritesOnly = !showFavoritesOnly;
            channelFilter = 'all';
            displayChannels();
            updateStatusBar();
        }

        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => console.error('Fullscreen failed:', err));
            } else {
                document.exitFullscreen();
            }
        }

        function togglePiP() {
            if (document.pictureInPictureEnabled && videoPlayer !== document.pictureInPictureElement) {
                videoPlayer.requestPictureInPicture().catch(err => console.error('PiP failed:', err));
            } else if (document.pictureInPictureElement) {
                document.exitPictureInPicture();
            }
        }

        function populateQualitySelector(levels, type) {
            qualitySelector.innerHTML = '<option value="-1">Auto</option>';
            if (type === 'hls') {
                levels.forEach((level, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.text = level.height ? `${level.height}p` : `Level ${index}`;
                    qualitySelector.appendChild(option);
                });
            } else if (type === 'dash') {
                levels.forEach((level, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.text = level.height ? `${level.height}p` : `Level ${index}`;
                    qualitySelector.appendChild(option);
                });
            }
        }

        function changeQuality() {
            const quality = parseInt(qualitySelector.value);
            if (hlsInstance) {
                hlsInstance.currentLevel = quality;
            } else if (dashInstance) {
                dashInstance.setQualityFor('video', quality);
            }
        }

        function setSleepTimer() {
            const time = parseInt(sleepTimer.value);
            if (time > 0) {
                setTimeout(() => videoPlayer.pause(), time * 60 * 1000);
            }
        }

        function cleanupStreams() {
            if (hlsInstance) {
                hlsInstance.detachMedia();
                hlsInstance.destroy();
                hlsInstance = null;
            }
            if (dashInstance) {
                dashInstance.reset();
                dashInstance = null;
            }
            videoPlayer.src = '';
            qualitySelector.innerHTML = '<option value="-1">Auto</option>';
        }

        async function checkStreamHealth(url) {
            return new Promise((resolve) => {
                const tempVideo = document.createElement('video');
                let timeoutId = setTimeout(() => {
                    tempVideo.remove();
                    resolve(true);
                }, 1000);

                const handleError = (errorType) => {
                    clearTimeout(timeoutId);
                    tempVideo.remove();
                    resolve(errorType === 'http' || errorType === 'hls' || errorType === 'cors' || errorType === '404' ? false : true);
                };

                if (url.endsWith('.mpd')) {
                    const tempDash = dashjs.MediaPlayer().create();
                    tempDash.initialize(tempVideo, url, false);
                    tempDash.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
                        clearTimeout(timeoutId);
                        tempDash.reset();
                        tempVideo.remove();
                        resolve(true);
                    });
                    tempDash.on(dashjs.MediaPlayer.events.ERROR, (e) => {
                        if (e.error.code === 'HTTP_ERROR' || e.error.message.includes('404')) handleError('404');
                        else if (e.error.message.includes('CORS')) handleError('cors');
                        else handleError('other');
                    });
                } else if (Hls.isSupported() && url.endsWith('.m3u8')) {
                    const tempHls = new Hls();
                    tempHls.loadSource(url);
                    tempHls.attachMedia(tempVideo);
                    tempHls.on(Hls.Events.MANIFEST_PARSED, () => {
                        clearTimeout(timeoutId);
                        tempHls.destroy();
                        tempVideo.remove();
                        resolve(true);
                    });
                    tempHls.on(Hls.Events.ERROR, (event, data) => {
                        if (data.details === 'manifestLoadError' || data.details === 'networkError') handleError('hls');
                        else if (data.response?.code === 404) handleError('404');
                        else if (data.networkDetails?.message?.includes('CORS')) handleError('cors');
                        else handleError('other');
                    });
                } else if (tempVideo.canPlayType('application/vnd.apple.mpegurl') && url.endsWith('.m3u8')) {
                    tempVideo.src = url;
                    tempVideo.onloadedmetadata = () => {
                        clearTimeout(timeoutId);
                        tempVideo.remove();
                        resolve(true);
                    };
                    tempVideo.onerror = (e) => {
                        if (e.target.error.code === MediaError.MEDIA_ERR_NETWORK) handleError('http');
                        else if (e.target.error.message?.includes('CORS')) handleError('cors');
                        else handleError('other');
                    };
                } else {
                    clearTimeout(timeoutId);
                    tempVideo.remove();
                    resolve(true);
                }
            });
        }

        async function canAccessDRM(url) {
            return true;
        }

        async function loadStream(url, index = 0, retries = 2) {
            if (channels[index].online === undefined) {
                channels[index].online = await checkStreamHealth(url);
                updateStatusBar();
            }

            if (!channels[index].online && retries > 0) {
                tryNextStream(index + 1);
                return;
            } else if (!channels[index].online) {
                alert('No valid streams available. Some streams may be blocked by CORS or unavailable (404). Please try a different playlist or host the page on a server.');
                updateURL();
                return;
            }

            cleanupStreams();
            currentChannelIndex = index;

            const tryLoad = async () => {
                let canPlay = false;
                if (url.endsWith('.mpd')) {
                    canPlay = supportedCodecs.some(codec => dashjs.MediaPlayer().getCodecSupported(codec.split(';')[1]));
                } else if (Hls.isSupported() && url.endsWith('.m3u8')) {
                    canPlay = true;
                } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl') && url.endsWith('.m3u8')) {
                    canPlay = true;
                }

                if (!canPlay) {
                    throw new Error('Unsupported stream format');
                }

                if (url.endsWith('.mpd')) {
                    dashInstance = dashjs.MediaPlayer().create();
                    dashInstance.updateSettings({
                        streaming: {
                            abr: { autoSwitchBitrate: { video: true } },
                            delay: { liveDelayFragmentCount: 4 },
                            protection: { robustnessLevel: '' }
                        }
                    });
                    dashInstance.initialize(videoPlayer, url, true);
                    dashInstance.on(dashjs.MediaPlayer.events.STREAM_INITIALIZED, () => {
                        const qualities = dashInstance.getBitrateInfoListFor('video');
                        populateQualitySelector(qualities, 'dash');
                        videoPlayer.play().catch(() => {
                            videoPlayer.muted = true;
                            videoPlayer.play();
                        });
                    });
                    dashInstance.on(dashjs.MediaPlayer.events.ERROR, (e) => {
                        console.error('DASH Error:', e);
                        if (retries > 0) tryNextStream(index + 1);
                        else {
                            alert('Failed to load stream due to playback error. Some streams may be blocked by CORS or unavailable.');
                        }
                    });
                } else if (Hls.isSupported() && url.endsWith('.m3u8')) {
                    hlsInstance = new Hls();
                    hlsInstance.loadSource(url);
                    hlsInstance.attachMedia(videoPlayer);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
                        populateQualitySelector(hlsInstance.levels, 'hls');
                        videoPlayer.play().catch(() => {
                            videoPlayer.muted = true;
                            videoPlayer.play();
                        });
                    });
                    hlsInstance.on(Hls.Events.ERROR, (event, data) => {
                        console.error('HLS Error:', { details: data.details, fatal: data.fatal, type: data.type, response: data.response });
                        if (data.details === 'manifestLoadError' || data.fatal || data.response?.code === 404 || data.networkDetails?.message?.includes('CORS')) {
                            if (retries > 0) tryNextStream(index + 1);
                            else {
                                alert('Failed to load stream due to manifest error, CORS restriction, or unavailable resource.');
                            }
                        }
                    });
                } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl') && url.endsWith('.m3u8')) {
                    videoPlayer.src = url;
                    videoPlayer.addEventListener('loadedmetadata', () => {
                        videoPlayer.play().catch(() => {
                            videoPlayer.muted = true;
                            videoPlayer.play();
                        });
                    }, { once: true });
                    videoPlayer.addEventListener('error', (e) => {
                        console.error('Native HLS Error:', e);
                        if (retries > 0) tryNextStream(index + 1);
                        else {
                            alert('Failed to load stream due to network or CORS issues.');
                        }
                    }, { once: true });
                }
            };

            try {
                await tryLoad();
            } catch (e) {
                console.error('Stream load failed:', e);
                if (retries > 0) {
                    tryNextStream(index + 1);
                } else {
                    alert('No valid streams available: ' + e.message);
                }
            }

            localStorage.setItem('lastChannelIndex', index);
            displayChannels();
            updateURL();
        }

        function tryNextStream(index) {
            if (index < channels.length) {
                loadStream(channels[index].url, index, 0);
            } else {
                alert('No valid streams available. Some streams may be blocked by CORS or unavailable.');
                updateURL();
            }
        }

        function parseM3U(data) {
            const channels = [];
            const lines = data.split('\n');
            let name = '', url = '', logo = '', epgUrl = '', category = 'Uncategorized';
            lines.forEach(line => {
                if (line.startsWith('#EXTINF')) {
                    name = line.split(',')[1]?.trim() || 'Unknown Channel';
                    logo = line.match(/tvg-logo="([^"]*)"/i)?.[1] || '';
                    epgUrl = line.match(/tvg-epg-url="([^"]*)"/i)?.[1] || '';
                    category = line.match(/group-title="([^"]*)"/i)?.[1] || 'Uncategorized';
                } else if (line.startsWith('http')) {
                    url = line.trim();
                    if (url.endsWith('.mpd') || url.endsWith('.m3u8') || url.endsWith('.m3u')) {
                        channels.push({ name, url, logo, epgUrl, category, online: undefined });
                    }
                }
            });
            return channels.filter(c => c.url);
        }

        function parseJSON(data) {
            try {
                return JSON.parse(data).map(item => ({
                    name: item.name || item.title || 'Unknown Channel',
                    url: item.url || item.link || '',
                    logo: item.logo || item.tvgLogo || '',
                    epgUrl: item.epgUrl || '',
                    category: item.category || item.group || 'Uncategorized',
                    online: undefined
                })).filter(item => item.url.startsWith('http') && (item.url.endsWith('.mpd') || item.url.endsWith('.m3u8') || item.url.endsWith('.m3u')));
            } catch (e) {
                console.error("Invalid JSON format:", e);
                return [];
            }
        }

        function parseTXT(data) {
            const channels = [];
            const lines = data.split('\n');
            lines.forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('http')) {
                    if (trimmed.endsWith('.mpd') || trimmed.endsWith('.m3u8') || trimmed.endsWith('.m3u')) {
                        channels.push({ name: 'Unknown Channel', url: trimmed, logo: '', epgUrl: '', category: 'Uncategorized', online: undefined });
                    }
                } else if (trimmed.includes(',')) {
                    const [name, url, logo, epgUrl, category] = trimmed.split(',').map(s => s.trim());
                    if (url?.startsWith('http') && (url.endsWith('.mpd') || url.endsWith('.m3u8') || url.endsWith('.m3u'))) {
                        channels.push({ name: name || 'Unknown Channel', url, logo: logo || '', epgUrl: epgUrl || '', category: category || 'Uncategorized', online: undefined });
                    }
                }
            });
            return channels.filter(c => c.url);
        }

        async function processChannelsInChunks(newChannels, chunkSize = 50) {
            const total = newChannels.length;
            let processed = 0;
            channels = [];

            loadingOverlay.classList.add('active');
            loadingProgress.textContent = '0%';

            for (let i = 0; i < newChannels.length; i += chunkSize) {
                const chunk = newChannels.slice(i, i + chunkSize);
                await Promise.all(chunk.map(async (channel, idx) => {
                    try {
                        channel.online = await checkStreamHealth(channel.url);
                    } catch (e) {
                        channel.online = false;
                    }
                    processed++;
                    const progress = Math.round((processed / total) * 100);
                    loadingProgress.textContent = `${progress}%`;
                }));
            }

            channels = newChannels;
            activeChannels = channels;

            const categories = [...new Set(channels.map(c => c.category))].sort();
            categoryFilter.innerHTML = '<option value="">All Categories</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.text = cat;
                categoryFilter.appendChild(option);
            });

            loadingOverlay.classList.remove('active');
            const lastIndex = parseInt(localStorage.getItem('lastChannelIndex')) || 0;
            const lastPlaylist = localStorage.getItem('lastPlaylist') || '';
            if (lastPlaylist && uploadHistory.includes(lastPlaylist)) {
                multiPlaylistSelect.value = lastPlaylist;
            }
            displayChannels();
            updateStatusBar();

            if (channels[lastIndex]) {
                loadStream(channels[lastIndex].url, lastIndex);
            } else if (channels[0]) {
                loadStream(channels[0].url, 0);
            }
        }

        function handleFileUpload() {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.onload = e => {
                    let newChannels = [];
                    if (file.name.endsWith('.m3u')) newChannels = parseM3U(e.target.result);
                    else if (file.name.endsWith('.json')) newChannels = parseJSON(e.target.result);
                    else if (file.name.endsWith('.txt')) newChannels = parseTXT(e.target.result);
                    if (newChannels.length > 0) {
                        uploadHistory = [file.name, ...uploadHistory.filter(h => h !== file.name).slice(0, 9)];
                        localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
                        localStorage.setItem('lastPlaylist', file.name);
                        processChannelsInChunks(newChannels);
                        displayHistory();
                    } else {
                        alert('Invalid or empty playlist file.');
                    }
                };
                reader.readAsText(file);
            }
        }

        function addM3UList(url) {
            if (typeof url === 'string') {
                fetch(url)
                    .then(response => response.text())
                    .then(data => {
                        let newChannels = [];
                        if (url.endsWith('.m3u')) newChannels = parseM3U(data);
                        else if (url.endsWith('.json')) newChannels = parseJSON(data);
                        else if (url.endsWith('.txt')) newChannels = parseTXT(data);
                        else newChannels = parseM3U(data);
                        if (newChannels.length > 0) {
                            uploadHistory = [url, ...uploadHistory.filter(h => h !== url).slice(0, 9)];
                            localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
                            localStorage.setItem('lastPlaylist', url);
                            processChannelsInChunks(newChannels);
                            displayHistory();
                        } else {
                            loadingOverlay.classList.remove('active');
                            alert('Invalid or empty playlist.');
                        }
                    })
                    .catch(err => {
                        loadingOverlay.classList.remove('active');
                        alert('Failed to load playlist URL: ' + err.message);
                    });
            } else {
                const inputUrl = urlInput.value.trim();
                if (inputUrl) {
                    fetch(inputUrl)
                        .then(response => response.text())
                        .then(data => {
                            let newChannels = [];
                            if (inputUrl.endsWith('.m3u')) newChannels = parseM3U(data);
                            else if (inputUrl.endsWith('.json')) newChannels = parseJSON(data);
                            else if (inputUrl.endsWith('.txt')) newChannels = parseTXT(data);
                            else newChannels = parseM3U(data);
                            if (newChannels.length > 0) {
                                uploadHistory = [inputUrl, ...uploadHistory.filter(h => h !== inputUrl).slice(0, 9)];
                                localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
                                localStorage.setItem('lastPlaylist', inputUrl);
                                processChannelsInChunks(newChannels);
                                displayHistory();
                            } else {
                                loadingOverlay.classList.remove('active');
                                alert('Invalid or empty playlist.');
                            }
                        })
                        .catch(err => {
                            loadingOverlay.classList.remove('active');
                            alert('Failed to load playlist URL: ' + err.message);
                        });
                }
            }
        }

        function toggleDefaultPlaylist() {
            if (document.getElementById('defaultPlaylistToggle').checked) {
                addM3UList(defaultPlaylistUrl);
            }
        }

        function toggleFavorite(channel, index) {
            const isFavorited = favorites.some(f => f.url === channel.url);
            if (isFavorited) {
                favorites = favorites.filter(f => f.url !== channel.url);
            } else {
                favorites.push(channel);
            }
            localStorage.setItem('favorites', JSON.stringify(favorites));
            displayChannels();
            updateStatusBar();
        }

        function updateStatusBar() {
            const total = activeChannels.length;
            const online = activeChannels.filter(c => c.online === true).length;
            const offline = activeChannels.filter(c => c.online === false).length;
            totalChannelsSpan.textContent = total;
            onlineChannelsSpan.textContent = online;
            offlineChannelsSpan.textContent = offline;
        }

        function showAllChannels() {
            channelFilter = 'all';
            displayChannels();
        }

        function showOnlineChannels() {
            channelFilter = 'online';
            displayChannels();
        }

        function showOfflineChannels() {
            channelFilter = 'offline';
            displayChannels();
        }

        function filterByCategory() {
            selectedCategory = categoryFilter.value;
            displayChannels();
        }

        function displayChannels() {
            const scrollPosition = channelList.scrollTop;
            channelList.innerHTML = '';
            if (!showingHistory) {
                let displayChannels = showFavoritesOnly ? activeChannels.filter(c => favorites.some(f => f.url === c.url)) : activeChannels;
                if (selectedCategory) {
                    displayChannels = displayChannels.filter(c => c.category === selectedCategory);
                }
                if (channelFilter === 'online') {
                    displayChannels = displayChannels.filter(c => c.online === true);
                } else if (channelFilter === 'offline') {
                    displayChannels = displayChannels.filter(c => c.online === false);
                }
                const term = searchBar.value.toLowerCase();
                displayChannels = displayChannels.filter((channel) => term ? channel.name.toLowerCase().includes(term) : true);

                const chunkSize = 50;
                let loadedIndex = 0;

                function loadNextChunk() {
                    const end = Math.min(loadedIndex + chunkSize, displayChannels.length);
                    for (let index = loadedIndex; index < end; index++) {
                        const channel = displayChannels[index];
                        const channelDiv = document.createElement('div');
                        channelDiv.className = 'channel-item';
                        if (index === currentChannelIndex) channelDiv.classList.add('current-channel');
                        channelDiv.onclick = () => {
                            const currentScroll = channelList.scrollTop;
                            loadStream(channel.url, index);
                            setTimeout(() => {
                                channelList.scrollTop = currentScroll;
                            }, 0);
                        };
                        const logo = document.createElement('img');
                        logo.className = 'channel-logo';
                        logo.src = channel.logo || 'https://bugsfreecdn.netlify.app/BugsfreeDefault/default-logo.png';
                        logo.onerror = () => logo.src = 'https://bugsfreecdn.netlify.app/BugsfreeDefault/default-logo.png';
                        const name = document.createElement('span');
                        name.className = 'channel-name';
                        name.textContent = channel.name;
                        const favBtn = document.createElement('button');
                        favBtn.className = 'favorite-btn';
                        if (favorites.some(f => f.url === channel.url)) {
                            favBtn.classList.add('favorited');
                        }
                        favBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
                        favBtn.onclick = (e) => {
                            e.stopPropagation();
                            toggleFavorite(channel, index);
                        };
                        channelDiv.appendChild(logo);
                        channelDiv.appendChild(name);
                        channelDiv.appendChild(favBtn);
                        channelList.appendChild(channelDiv);
                    }
                    loadedIndex = end;
                    if (loadedIndex < displayChannels.length) {
                        requestAnimationFrame(loadNextChunk);
                    } else {
                        channelList.scrollTop = scrollPosition;
                    }
                }

                requestAnimationFrame(loadNextChunk);
            }
        }

        function filterChannels() {
            displayChannels();
        }

        function displayHistory() {
            channelList.innerHTML = '';
            if (showingHistory) {
                const backBtn = document.createElement('button');
                backBtn.textContent = 'Back to Channels';
                backBtn.style.width = '100%';
                backBtn.style.marginBottom = '10px';
                backBtn.onclick = () => {
                    document.getElementById('historyToggle').checked = false;
                    toggleHistory();
                };
                channelList.appendChild(backBtn);
                uploadHistory.forEach((item, index) => {
                    const div = document.createElement('div');
                    div.className = 'history-item';
                    const icon = document.createElement('span');
                    icon.innerHTML = item.startsWith('http') 
                        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17h-2v-2h2v2zm3.5-4.34v-3.66c0-1.79-1.47-3.25-3.25-3.25s-3.25 1.46-3.25 3.25v3.66c0 .21.15.39.34.44l2.03.5c.06.01.12.01.18.01s.12 0 .18-.01l2.03-.5c.19-.05.34-.23.34-.44zm-3.25-4.09c.69 0 1.25.56 1.25 1.25v3.66l-2.5.62-2.5-.62v-3.66c0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25z"/></svg>'
                        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/></svg>';
                    const nameSpan = document.createElement('span');
                    nameSpan.className = 'history-name';
                    nameSpan.textContent = item.length > 20 ? item.substring(0, 20) + '...' : item;
                    const loadBtn = document.createElement('button');
                    loadBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
                    loadBtn.onclick = () => (item.startsWith('http') ? addM3UList(item) : alert('Upload file again'));
                    const clearBtn = document.createElement('button');
                    clearBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
                    clearBtn.onclick = () => {
                        uploadHistory.splice(index, 1);
                        localStorage.setItem('uploadHistory', JSON.stringify(uploadHistory));
                        if (uploadHistory.length === 0) localStorage.removeItem('lastPlaylist');
                        displayHistory();
                    };
                    div.appendChild(icon);
                    div.appendChild(nameSpan);
                    div.appendChild(loadBtn);
                    div.appendChild(clearBtn);
                    channelList.appendChild(div);
                });
            }
        }

        function loadSelectedPlaylist() {
            const selected = multiPlaylistSelect.value;
            if (selected && selected.startsWith('http')) {
                addM3UList(selected);
                localStorage.setItem('lastPlaylist', selected);
            } else if (selected) {
                alert('Please upload the file again to load it.');
            }
        }

        async function showEPG() {
            epgContent.innerHTML = '';
            if (currentChannelIndex >= 0 && channels[currentChannelIndex].epgUrl) {
                try {
                    const response = await fetch(channels[currentChannelIndex].epgUrl);
                    const data = await response.text();
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(data, 'text/xml');
                    const programs = xmlDoc.getElementsByTagName('programme');
                    for (let program of programs) {
                        const start = program.getAttribute('start');
                        const stop = program.getAttribute('stop');
                        const title = program.getElementsByTagName('title')[0]?.textContent || 'No Title';
                        epgContent.innerHTML += `<p>${start} - ${stop}: ${title}</p>`;
                    }
                } catch (e) {
                    epgContent.innerHTML = '<p>EPG data unavailable or invalid.</p>';
                    console.error('EPG fetch error:', e);
                }
                showPopup('epgPopup');
            } else {
                epgContent.innerHTML = '<p>No EPG data available for this channel.</p>';
                showPopup('epgPopup');
            }
        }

        function encryptStreamParam(url) {
            const hash = CryptoJS.MD5(url).toString().substr(0, 16);
            const key = CryptoJS.enc.Hex.parse(hash);
            const iv = CryptoJS.lib.WordArray.random(8);
            const encrypted = CryptoJS.DES.encrypt(url, key, { iv: iv }).toString();
            const shortEncrypted = encrypted.substr(0, 12);
            return `${iv.toString(CryptoJS.enc.Hex)}:${shortEncrypted}`;
        }

        function decryptStreamParam(encryptedStr) {
            try {
                const [ivHex, encrypted] = encryptedStr.split(':');
                const iv = CryptoJS.enc.Hex.parse(ivHex);
                const hash = CryptoJS.MD5(channels[currentChannelIndex]?.url || encryptedStr).toString().substr(0, 16);
                const key = CryptoJS.enc.Hex.parse(hash);
                const decrypted = CryptoJS.DES.decrypt(encrypted, key, { iv: iv }).toString(CryptoJS.enc.Utf8);
                return decrypted;
            } catch (e) {
                console.error('Decryption failed:', e);
                return '';
            }
        }

        function updateURL() {
            if (window.location.protocol === 'file:' || document.location.href.includes('about:srcdoc')) return;

            if (currentChannelIndex >= 0 && channels[currentChannelIndex]) {
                const streamUrl = channels[currentChannelIndex].url;
                const encryptedParam = encryptStreamParam(streamUrl);
                const newUrl = `${window.location.pathname}?stream=${encodeURIComponent(encryptedParam)}`;
                window.history.replaceState({}, document.title, newUrl);
            } else {
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            displayHistory();
            const savedTheme = localStorage.getItem('theme') || 'light';
            currentThemeIndex = themes.indexOf(savedTheme);
            if (currentThemeIndex === -1) currentThemeIndex = 0;
            document.body.setAttribute('data-theme', themes[currentThemeIndex]);
            updateThemeIcon(themes[currentThemeIndex]);
            if (document.getElementById('defaultPlaylistToggle').checked) {
                addM3UList(defaultPlaylistUrl);
            }
            if (document.getElementById('historyToggle').checked) {
                toggleHistory();
            }

            uploadHistory.forEach(item => {
                const option = document.createElement('option');
                option.value = item;
                option.text = item.length > 30 ? item.substring(0, 30) + '...' : item;
                multiPlaylistSelect.appendChild(option);
            });

            const lastPlaylist = localStorage.getItem('lastPlaylist');
            if (lastPlaylist && uploadHistory.includes(lastPlaylist)) {
                multiPlaylistSelect.value = lastPlaylist;
            }

            if (window.location.protocol !== 'file:' && !document.location.href.includes('about:srcdoc')) {
                const urlParams = new URLSearchParams(window.location.search);
                const streamParam = urlParams.get('stream');
                if (streamParam) {
                    const decryptedUrl = decryptStreamParam(decodeURIComponent(streamParam));
                    if (decryptedUrl) {
                        const channelIndex = channels.findIndex(c => c.url === decryptedUrl);
                        if (channelIndex >= 0) {
                            loadStream(decryptedUrl, channelIndex);
                        } else {
                            addM3UList(decryptedUrl);
                        }
                    }
                }
            }
        });