/**
 * Pendrive Media Hub - Metadata Intelligence Engine
 * Advanced ID3 parser, Folder hierarchy analyzer, and Indian/International Cinema & Music Knowledge Base
 */

(function (window) {
    'use strict';

    // 1. Curated Heroes & Actors Knowledge Base
    const HERO_LIST = [
        // Telugu
        "Prabhas", "Allu Arjun", "Jr NTR", "NTR", "Mahesh Babu", "Ram Charan", 
        "Pawan Kalyan", "Chiranjeevi", "Nandamuri Balakrishna", "Balakrishna", 
        "Venkatesh", "Nagarjuna", "Nani", "Vijay Deverakonda", "Ravi Teja", 
        "Ram Pothineni", "Kalyan Ram", "Gopichand", "Naga Chaitanya", "Akhil Akkineni", 
        "Sharwanand", "Adivi Sesh", "Vishwak Sen", "Siddhu Jonnalagadda", "Nikhil Siddhartha", 
        "Teja Sajja", "Allari Naresh", "Raj Tarun", "Varun Tej", "Sai Dharam Tej",
        // Hindi / Bollywood
        "Shah Rukh Khan", "SRK", "Salman Khan", "Aamir Khan", "Hrithik Roshan", 
        "Ranbir Kapoor", "Ranveer Singh", "Akshay Kumar", "Ajay Devgn", "Shahid Kapoor", 
        "Kartik Aaryan", "Vicky Kaushal", "Amitabh Bachchan", "Varun Dhawan", "Tiger Shroff", 
        "Ayushmann Khurrana", "John Abraham", "Sidharth Malhotra",
        // Tamil
        "Thalapathy Vijay", "Vijay", "Ajith Kumar", "Ajith", "Rajinikanth", "Kamal Haasan", 
        "Suriya", "Vikram", "Chiyaan Vikram", "Dhanush", "Silambarasan", "Simbu", 
        "Sivakarthikeyan", "Karthi", "Jayam Ravi", "Vijay Sethupathi",
        // Kannada
        "Yash", "Rishab Shetty", "Puneeth Rajkumar", "Shiva Rajkumar", "Darshan", 
        "Kiccha Sudeep", "Sudeep", "Rakshit Shetty", "Ganesh", "Upendra",
        // Malayalam
        "Mohanlal", "Mammootty", "Dulquer Salmaan", "Fahadh Faasil", "Tovino Thomas", 
        "Prithviraj Sukumaran", "Prithviraj", "Nivin Pauly",
        // International
        "Michael Jackson", "The Weeknd", "Justin Bieber", "Ed Sheeran", "Eminem", 
        "Drake", "Bruno Mars", "Zayn", "Charlie Puth"
    ];

    // 2. Curated Movie Knowledge Base
    const MOVIE_LIST = [
        // Telugu
        "RRR", "Baahubali", "Baahubali 2", "Pushpa", "Pushpa 2", "Devara", "Kalki 2898 AD", 
        "Salaar", "Guntur Kaaram", "Hanu-Man", "Dasara", "Hi Nanna", "Waltair Veerayya", 
        "Veera Simha Reddy", "Sarkaru Vaari Paata", "Ala Vaikunthapurramuloo", "Sarileru Neekevvaru", 
        "Rangasthalam", "Bharat Ane Nenu", "Srimanthudu", "Magadheera", "Eega", "Pokiri", 
        "Athadu", "Okkadu", "Arjun Reddy", "Geetha Govindam", "Sita Ramam", "Baby", 
        "Tillu Square", "DJ Tillu", "Bimbisara", "Virupaksha", "Karthikeya 2", "Major", 
        "Goodachari", "Shyam Singha Roy", "Jersey", "Bro", "Bheemla Nayak", "Vakeel Saab", 
        "Agnyaathavaasi", "Attarintiki Daredi", "Gabbar Singh", "Jalsa", "Kushi", 
        "Simhadri", "Aadi", "Yamadonga", "Janatha Garage", "Aravinda Sametha", "Temper", 
        "Nannaku Prematho", "Mirchi", "Chatrapathi", "Darling", "Mr Perfect", "Varsham", 
        "Saaho", "Radhe Shyam", "Arya", "Arya 2", "Desamuduru", "Julayi", "Race Gurram", 
        "Sarrainodu", "DJ Duvvada Jagannadham", "Naa Peru Surya",
        // Hindi
        "Jawan", "Pathaan", "Dunki", "Animal", "Fighter", "Stree 2", "Bhool Bhulaiyaa 3", 
        "Singham Again", "Kabir Singh", "Brahmastra", "War", "Tiger 3", "Dangal", 
        "PK", "3 Idiots", "Dilwale", "Chennai Express", "Dhoom 3", "Bajrangi Bhaijaan", 
        "Sultan", "Rockstar", "Yeh Jawaani Hai Deewani", "Sanju", "Om Shanti Om", 
        "Kal Ho Naa Ho", "Kabhi Khushi Kabhie Gham", "Kuch Kuch Hota Hai", "DDLJ",
        // Tamil
        "Leo", "Jailer", "Vikram", "Master", "Varisu", "Beast", "Mersal", "Bigil", 
        "Sarkar", "Theri", "Kaththi", "Kaithi", "Ponniyin Selvan", "Maaveeran", "Doctor", 
        "Don", "Amaran", "GOAT", "Captain Miller", "Raayan", "Asuran", "Karnan", 
        "Vada Chennai", "24", "Soorarai Pottru", "Jai Bhim",
        // Kannada
        "KGF", "KGF Chapter 2", "Kantara", "Vikrant Rona", "777 Charlie", "James", "Yuva", "Kabzaa", "Toxic",
        // Malayalam
        "Manjummel Boys", "Premalu", "Aadujeevitham", "Aavesham", "Bramayugam", "RDX", "2018", "Lucifer", "Minnal Murali"
    ];

    // 3. Movie-to-Hero Association Map
    const MOVIE_HERO_MAP = {
        "rrr": "Jr NTR & Ram Charan",
        "baahubali": "Prabhas",
        "baahubali 2": "Prabhas",
        "salaar": "Prabhas",
        "kalki 2898 ad": "Prabhas",
        "saaho": "Prabhas",
        "radhe shyam": "Prabhas",
        "mirchi": "Prabhas",
        "chatrapathi": "Prabhas",
        "darling": "Prabhas",
        "mr perfect": "Prabhas",
        "varsham": "Prabhas",
        "pushpa": "Allu Arjun",
        "pushpa 2": "Allu Arjun",
        "ala vaikunthapurramuloo": "Allu Arjun",
        "sarrainodu": "Allu Arjun",
        "race gurram": "Allu Arjun",
        "julayi": "Allu Arjun",
        "arya": "Allu Arjun",
        "arya 2": "Allu Arjun",
        "desamuduru": "Allu Arjun",
        "dj duvvada jagannadham": "Allu Arjun",
        "naa peru surya": "Allu Arjun",
        "devara": "Jr NTR",
        "janatha garage": "Jr NTR",
        "aravinda sametha": "Jr NTR",
        "temper": "Jr NTR",
        "nannaku prematho": "Jr NTR",
        "yamadonga": "Jr NTR",
        "simhadri": "Jr NTR",
        "aadi": "Jr NTR",
        "guntur kaaram": "Mahesh Babu",
        "sarkaru vaari paata": "Mahesh Babu",
        "sarileru neekevvaru": "Mahesh Babu",
        "bharat ane nenu": "Mahesh Babu",
        "srimanthudu": "Mahesh Babu",
        "dookudu": "Mahesh Babu",
        "pokiri": "Mahesh Babu",
        "athadu": "Mahesh Babu",
        "okkadu": "Mahesh Babu",
        "rangasthalam": "Ram Charan",
        "magadheera": "Ram Charan",
        "dhruva": "Ram Charan",
        "bheemla nayak": "Pawan Kalyan",
        "vakeel saab": "Pawan Kalyan",
        "bro": "Pawan Kalyan",
        "attarintiki daredi": "Pawan Kalyan",
        "gabbar singh": "Pawan Kalyan",
        "jalsa": "Pawan Kalyan",
        "kushi": "Pawan Kalyan",
        "waltair veerayya": "Chiranjeevi",
        "veera simha reddy": "Nandamuri Balakrishna",
        "dasara": "Nani",
        "hi nanna": "Nani",
        "jersey": "Nani",
        "shyam singha roy": "Nani",
        "arjun reddy": "Vijay Deverakonda",
        "geetha govindam": "Vijay Deverakonda",
        "tillu square": "Siddhu Jonnalagadda",
        "dj tillu": "Siddhu Jonnalagadda",
        "hanu-man": "Teja Sajja",
        "jawan": "Shah Rukh Khan",
        "pathaan": "Shah Rukh Khan",
        "dunki": "Shah Rukh Khan",
        "dilwale": "Shah Rukh Khan",
        "chennai express": "Shah Rukh Khan",
        "om shanti om": "Shah Rukh Khan",
        "kal ho naa ho": "Shah Rukh Khan",
        "kuch kuch hota hai": "Shah Rukh Khan",
        "ddlj": "Shah Rukh Khan",
        "animal": "Ranbir Kapoor",
        "sanju": "Ranbir Kapoor",
        "rockstar": "Ranbir Kapoor",
        "yeh jawaani hai deewani": "Ranbir Kapoor",
        "brahmastra": "Ranbir Kapoor",
        "war": "Hrithik Roshan",
        "fighter": "Hrithik Roshan",
        "dhoom 3": "Aamir Khan",
        "dangal": "Aamir Khan",
        "pk": "Aamir Khan",
        "3 idiots": "Aamir Khan",
        "bajrangi bhaijaan": "Salman Khan",
        "tiger 3": "Salman Khan",
        "sultan": "Salman Khan",
        "leo": "Thalapathy Vijay",
        "master": "Thalapathy Vijay",
        "varisu": "Thalapathy Vijay",
        "beast": "Thalapathy Vijay",
        "mersal": "Thalapathy Vijay",
        "bigil": "Thalapathy Vijay",
        "sarkar": "Thalapathy Vijay",
        "theri": "Thalapathy Vijay",
        "kaththi": "Thalapathy Vijay",
        "goat": "Thalapathy Vijay",
        "jailer": "Rajinikanth",
        "vikram": "Kamal Haasan",
        "kgf": "Yash",
        "kgf chapter 2": "Yash",
        "kantara": "Rishab Shetty"
    };

    // 4. Curated Popular Singers & Composers
    const SINGER_LIST = [
        "Sid Sriram", "Arijit Singh", "Anirudh Ravichander", "Anirudh", "Shreya Ghoshal", 
        "A.R. Rahman", "AR Rahman", "S.P. Balasubrahmanyam", "SPB", "K.S. Chithra", "Chithra",
        "Armaan Malik", "Anurag Kulkarni", "Ram Miriyala", "Mangli", "Mohana Bhogaraju", 
        "Devi Sri Prasad", "DSP", "Thaman S", "S. Thaman", "Thaman", "Sanjith Hegde", 
        "Sonu Nigam", "Hariharan", "Karthik", "Shankar Mahadevan", "Udit Narayan", 
        "Alka Yagnik", "Lata Mangeshkar", "Kishore Kumar", "Harris Jayaraj", "Yuvan Shankar Raja", 
        "G.V. Prakash", "Vijay Prakash", "Pradeep Kumar", "Dhee", "Jonita Gandhi", 
        "Neha Kakkar", "Sunidhi Chauhan", "Atif Aslam", "Mohit Chauhan", "Jubin Nautiyal", 
        "Mika Singh", "Badshah", "Diljit Dosanjh", "Vishal Mishra", "Stebin Ben", 
        "B Praak", "Yo Yo Honey Singh", "Honey Singh", "Rahul Sipligunj", "Kaala Bhairava",
        "Justin Bieber", "Ed Sheeran", "Taylor Swift", "The Weeknd", "Dua Lipa", 
        "Billie Eilish", "Bruno Mars", "Post Malone", "Adele"
    ];

    /**
     * Clean spam tags, websites, track numbers, and audio bitrate suffixes from string
     */
    function cleanString(str) {
        if (!str) return '';
        return str
            .replace(/\.[a-zA-Z0-9]{2,4}$/i, '') // remove extension
            .replace(/\[\s*(isongs|sensongs|naasongs|masstamilan|pagalworld|songslover|320kbps|128kbps|hq|audio|mp3|flac|wav)[^\]]*\]/gi, '')
            .replace(/\(\s*(isongs|sensongs|naasongs|masstamilan|pagalworld|songslover|320kbps|128kbps|hq|audio|mp3|flac|wav)[^)]*\)/gi, '')
            .replace(/www\.[a-z0-9\-]+\.[a-z]{2,5}/gi, '')
            .replace(/^[0-9]{1,3}\s*[\.\-_]\s*/, '') // Track number prefix like '01 - ' or '01. '
            .replace(/[\-_]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * Fast Binary ID3 Tag Parser (Pure JavaScript)
     * Reads ID3v2 header and frames (TIT2, TPE1, TALB, TPE2, APIC) from the first 128KB of the file
     */
    async function parseID3Tags(file) {
        const metadata = {
            title: null,
            artist: null,
            album: null,
            albumArtist: null,
            artworkUrl: null
        };

        if (!file || typeof file.slice !== 'function') return metadata;

        try {
            // Read first 128KB for ID3v2
            const headerBlob = file.slice(0, 131072);
            const arrayBuffer = await headerBlob.arrayBuffer();
            const view = new DataView(arrayBuffer);

            // Check for 'ID3' marker
            if (arrayBuffer.byteLength >= 10 &&
                view.getUint8(0) === 0x49 && // 'I'
                view.getUint8(1) === 0x44 && // 'D'
                view.getUint8(2) === 0x33) {  // '3'
                
                const version = view.getUint8(3); // 3 for ID3v2.3, 4 for ID3v2.4
                // Calculate tag size using synchsafe integer
                const tagSize = ((view.getUint8(6) & 0x7F) << 21) |
                                ((view.getUint8(7) & 0x7F) << 14) |
                                ((view.getUint8(8) & 0x7F) << 7) |
                                (view.getUint8(9) & 0x7F);

                let offset = 10;
                const maxOffset = Math.min(tagSize + 10, arrayBuffer.byteLength);

                while (offset + 10 <= maxOffset) {
                    // Frame ID (4 bytes)
                    let frameId = '';
                    for (let i = 0; i < 4; i++) {
                        const charCode = view.getUint8(offset + i);
                        if (charCode === 0) break;
                        frameId += String.fromCharCode(charCode);
                    }

                    if (frameId.length < 4 || !/^[A-Z0-9]{4}$/.test(frameId)) {
                        break; // Invalid frame or padding reached
                    }

                    // Frame size (4 bytes)
                    let frameSize = 0;
                    if (version === 4) {
                        frameSize = ((view.getUint8(offset + 4) & 0x7F) << 21) |
                                    ((view.getUint8(offset + 5) & 0x7F) << 14) |
                                    ((view.getUint8(offset + 6) & 0x7F) << 7) |
                                    (view.getUint8(offset + 7) & 0x7F);
                    } else {
                        frameSize = view.getUint32(offset + 4, false);
                    }

                    if (frameSize <= 0 || offset + 10 + frameSize > arrayBuffer.byteLength) {
                        break;
                    }

                    const frameDataOffset = offset + 10;

                    // Decode Text Frames
                    if (['TIT2', 'TPE1', 'TALB', 'TPE2'].includes(frameId)) {
                        const encoding = view.getUint8(frameDataOffset);
                        let text = '';
                        const textBytes = new Uint8Array(arrayBuffer, frameDataOffset + 1, frameSize - 1);
                        
                        try {
                            if (encoding === 1 || encoding === 2) {
                                text = new TextDecoder('utf-16').decode(textBytes);
                            } else if (encoding === 3) {
                                text = new TextDecoder('utf-8').decode(textBytes);
                            } else {
                                text = new TextDecoder('iso-8859-1').decode(textBytes);
                            }
                            text = text.replace(/\0/g, '').trim();
                        } catch (e) {
                            text = '';
                        }

                        if (text) {
                            if (frameId === 'TIT2' && !metadata.title) metadata.title = text;
                            if (frameId === 'TPE1' && !metadata.artist) metadata.artist = text;
                            if (frameId === 'TALB' && !metadata.album) metadata.album = text;
                            if (frameId === 'TPE2' && !metadata.albumArtist) metadata.albumArtist = text;
                        }
                    }

                    // Decode Embedded Album Art (APIC)
                    else if (frameId === 'APIC' && !metadata.artworkUrl) {
                        try {
                            let ptr = frameDataOffset + 1; // skip encoding
                            // Read MIME type (null-terminated ISO-8859-1)
                            let mimeType = '';
                            while (ptr < frameDataOffset + frameSize && view.getUint8(ptr) !== 0) {
                                mimeType += String.fromCharCode(view.getUint8(ptr));
                                ptr++;
                            }
                            ptr++; // skip null terminator
                            ptr++; // skip picture type byte
                            // skip description (terminated by null or double null)
                            while (ptr < frameDataOffset + frameSize && view.getUint8(ptr) !== 0) {
                                ptr++;
                            }
                            ptr++; // skip null
                            if (ptr < frameDataOffset + frameSize && view.getUint8(ptr) === 0) ptr++;

                            const imgDataSize = (frameDataOffset + frameSize) - ptr;
                            if (imgDataSize > 100) {
                                const imgBytes = new Uint8Array(arrayBuffer, ptr, imgDataSize);
                                const blob = new Blob([imgBytes], { type: mimeType || 'image/jpeg' });
                                metadata.artworkUrl = URL.createObjectURL(blob);
                            }
                        } catch (e) {
                            // Non-fatal, artwork fallback will be used
                        }
                    }

                    offset += 10 + frameSize;
                }
            }
        } catch (err) {
            console.debug('ID3 parse skipped/failed:', err);
        }

        return metadata;
    }

    /**
     * Match text against a dictionary list (case-insensitive substring)
     */
    function findMatchInText(text, list) {
        if (!text) return null;
        const lower = text.toLowerCase();
        for (const item of list) {
            const itemLower = item.toLowerCase();
            // Match with boundary or clear substring
            const regex = new RegExp(`(^|[^a-z0-9])${itemLower.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}([^a-z0-9]|$)`, 'i');
            if (regex.test(lower) || lower.includes(itemLower)) {
                return item;
            }
        }
        return null;
    }

    /**
     * Extract rich metadata (Title, Movie, Hero, Singer, Folder)
     * using folder path, file name, knowledge base, and parsed ID3 tags
     */
    function extractSongMetadata(fileName, folderPath = '', id3Tags = {}) {
        const rawFileName = fileName || '';
        const baseNameWithoutExt = rawFileName.replace(/\.[a-zA-Z0-9]{2,4}$/i, '');
        const cleanedFileName = cleanString(rawFileName);

        // Path segments (e.g. ['Drive', 'Movies', 'RRR', '01 - Naatu Naatu.mp3'])
        const pathSegments = (folderPath || '').split(/[\/\\]+/).filter(Boolean);
        const parentFolder = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : '';
        const grandParentFolder = pathSegments.length > 1 ? pathSegments[pathSegments.length - 2] : '';

        // Combine search context
        const searchContext = `${rawFileName} ${folderPath} ${id3Tags.album || ''} ${id3Tags.title || ''} ${id3Tags.artist || ''}`;

        // 1. Detect Movie Name
        let detectedMovie = null;
        if (id3Tags.album && id3Tags.album.trim().length > 1) {
            detectedMovie = cleanString(id3Tags.album);
        }
        if (!detectedMovie) {
            // Check knowledge base in parent folder, filename, or searchContext
            detectedMovie = findMatchInText(parentFolder, MOVIE_LIST) ||
                            findMatchInText(cleanedFileName, MOVIE_LIST) ||
                            findMatchInText(searchContext, MOVIE_LIST);
        }
        if (!detectedMovie) {
            // Heuristic: If parent folder is not a generic folder ('Music', 'Songs', 'Audio', 'Root', 'USB', 'Pendrive')
            const genericFolders = ['music', 'songs', 'audio', 'root', 'usb', 'pendrive', 'mp3', 'tracks', 'downloads', 'media'];
            if (parentFolder && !genericFolders.includes(parentFolder.toLowerCase()) && parentFolder.length < 35) {
                detectedMovie = cleanString(parentFolder);
            }
        }
        if (!detectedMovie) {
            // Try splitting filename by '-' (e.g. 'Movie - Song')
            if (rawFileName.includes('-')) {
                const parts = rawFileName.split('-');
                if (parts.length >= 2) {
                    const firstPart = cleanString(parts[0]);
                    if (firstPart.length > 2 && firstPart.length < 30) {
                        detectedMovie = firstPart;
                    }
                }
            }
        }
        if (!detectedMovie) {
            detectedMovie = "Independent / Singles";
        }

        // 2. Detect Hero / Actor
        let detectedHero = null;
        // Check if detected movie has a known hero
        if (detectedMovie) {
            const movieKey = detectedMovie.toLowerCase().trim();
            if (MOVIE_HERO_MAP[movieKey]) {
                detectedHero = MOVIE_HERO_MAP[movieKey];
            }
        }
        if (!detectedHero) {
            // Check knowledge base in searchContext, parent/grandparent folder
            detectedHero = findMatchInText(grandParentFolder, HERO_LIST) ||
                           findMatchInText(parentFolder, HERO_LIST) ||
                           findMatchInText(searchContext, HERO_LIST);
        }
        if (!detectedHero && id3Tags.albumArtist) {
            detectedHero = findMatchInText(id3Tags.albumArtist, HERO_LIST);
        }
        if (!detectedHero) {
            detectedHero = "Various Artists";
        }

        // 3. Detect Singer / Performer
        let detectedSinger = null;
        if (id3Tags.artist && id3Tags.artist.trim().length > 1) {
            detectedSinger = cleanString(id3Tags.artist);
        }
        if (!detectedSinger) {
            detectedSinger = findMatchInText(searchContext, SINGER_LIST) ||
                             findMatchInText(cleanedFileName, SINGER_LIST);
        }
        if (!detectedSinger && rawFileName.includes('-')) {
            const parts = rawFileName.split('-');
            if (parts.length >= 3) {
                const candidate = cleanString(parts[2]);
                if (candidate.length > 2 && candidate.length < 35) {
                    detectedSinger = candidate;
                }
            }
        }
        if (!detectedSinger) {
            detectedSinger = "Other Singers";
        }

        // 4. Clean Title
        let detectedTitle = null;
        if (id3Tags.title && id3Tags.title.trim().length > 1) {
            detectedTitle = cleanString(id3Tags.title);
        }
        if (!detectedTitle) {
            if (rawFileName.includes('-')) {
                const parts = rawFileName.split('-');
                // Typically [Movie] - [Song] or [TrackNo] - [Song]
                if (parts.length === 2) {
                    detectedTitle = cleanString(parts[1]);
                } else if (parts.length >= 3) {
                    detectedTitle = cleanString(parts[1]);
                }
            }
        }
        if (!detectedTitle || detectedTitle.length < 2) {
            detectedTitle = cleanedFileName || baseNameWithoutExt;
        }

        return {
            title: detectedTitle,
            movie: detectedMovie,
            hero: detectedHero,
            singer: detectedSinger,
            folder: parentFolder || 'Root Folder',
            artworkUrl: id3Tags.artworkUrl || null
        };
    }

    /**
     * Generate dynamic HD canvas album artwork for Bluetooth devices & Lockscreen
     */
    function generateDynamicArtwork(title, movie, artist) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Elegant dark gradient background
        const grad = ctx.createLinearGradient(0, 0, 512, 512);
        grad.addColorStop(0, '#0a0a14');
        grad.addColorStop(0.5, '#121226');
        grad.addColorStop(1, '#001a24');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);

        // Circular vinyl glow
        const radial = ctx.createRadialGradient(256, 200, 30, 256, 200, 180);
        radial.addColorStop(0, 'rgba(0, 240, 255, 0.4)');
        radial.addColorStop(0.6, 'rgba(138, 43, 226, 0.2)');
        radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(256, 200, 180, 0, Math.PI * 2);
        ctx.fill();

        // Decorative musical emblem
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(256, 200, 100, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 183, 3, 0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(256, 200, 70, 0, Math.PI * 2);
        ctx.stroke();

        // Note icon
        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 70px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('♫', 256, 195);

        // Text details
        // Movie / Album badge
        ctx.fillStyle = '#ffb703';
        ctx.font = 'bold 24px "Segoe UI", sans-serif';
        ctx.fillText((movie || 'PENDRIVE MEDIA HUB').toUpperCase().slice(0, 32), 256, 350);

        // Song Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Segoe UI", sans-serif';
        ctx.fillText((title || 'Song Track').slice(0, 28), 256, 395);

        // Artist / Singer / Hero
        ctx.fillStyle = '#a0a0c0';
        ctx.font = '20px "Segoe UI", sans-serif';
        ctx.fillText((artist || 'Media Hub Audio').slice(0, 38), 256, 440);

        return canvas.toDataURL('image/png');
    }

    // Export to global window object
    window.MediaMetadataEngine = {
        HERO_LIST,
        MOVIE_LIST,
        SINGER_LIST,
        MOVIE_HERO_MAP,
        cleanString,
        parseID3Tags,
        extractSongMetadata,
        generateDynamicArtwork
    };

})(typeof window !== 'undefined' ? window : this);
