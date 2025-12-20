// 🔍 YouTube 검색어 입력 기능 (조회수 필터 추가)

const SEARCH_COUNTRY_NAMES = {
    'KR': '한국', 'US': '미국', 'JP': '일본', 'GB': '영국',
    'IN': '인도', 'BR': '브라질', 'FR': '프랑스', 'DE': '독일'
};

const SEARCH_CATEGORY_NAMES = {
    '': '전체',
    '10': '음악', '20': '게임', '17': '스포츠',
    '24': '엔터테인먼트', '28': '과학/기술',
    '22': '브이로그', '23': '코미디',
    '25': '뉴스/정치', '26': '교육'
};

const SEARCH_SORT_NAMES = {
    'relevance': '관련성',
    'viewCount': '조회수',
    'date': '최신순',
    'rating': '평점'
};

// 🎯 메인 검색 함수
async function performSearch() {
    const keyword = document.getElementById('search-keyword').value.trim();
    const country = document.getElementById('search-country-select').value;
    const category = document.getElementById('search-category-select').value;
    const timeRange = document.getElementById('search-time-select').value;
    const minViews = parseInt(document.getElementById('search-views-select').value) || 0;
    const sortBy = document.getElementById('search-sort-select').value;
    
    const resultsDiv = document.getElementById('search-results');
    const filterInfo = document.getElementById('search-filter-info');
    
    // 검색어 입력 확인
    if (!keyword) {
        resultsDiv.innerHTML = `
            <div class="loading">
                <p>⚠️ 검색어를 입력해주세요!</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    예시: BTS, 요리 레시피, Minecraft, React 강의
                </p>
            </div>
        `;
        return;
    }
    
    // 필터 정보 표시
    const countryName = SEARCH_COUNTRY_NAMES[country];
    const categoryName = SEARCH_CATEGORY_NAMES[category];
    const sortName = SEARCH_SORT_NAMES[sortBy];
    const timeName = getTimeRangeName(timeRange);
    const viewsName = getViewsFilterName(minViews);
    
    filterInfo.innerHTML = `
        <strong>🔍 검색:</strong> "${keyword}" 
        <span style="margin: 0 10px;">|</span>
        <strong>🌍 국가:</strong> ${countryName}
        <span style="margin: 0 10px;">|</span>
        <strong>📂 카테고리:</strong> ${categoryName}
        <span style="margin: 0 10px;">|</span>
        <strong>📅 기간:</strong> ${timeName}
        <span style="margin: 0 10px;">|</span>
        <strong>👁️ 조회수:</strong> ${viewsName}
        <span style="margin: 0 10px;">|</span>
        <strong>📊 정렬:</strong> ${sortName}
    `;
    filterInfo.classList.add('active');
    
    // 로딩 메시지
    resultsDiv.innerHTML = `
        <div class="loading">
            <p>🔍 "${keyword}" 검색 중...</p>
            <p style="font-size: 0.9em; color: #666;">
                ${categoryName} 카테고리 · ${viewsName} 조건으로 최대 100개 영상을 찾고 있어요!
            </p>
        </div>
    `;
    
    console.log('🔍 검색 시작:', { keyword, country, category, timeRange, minViews, sortBy });
    
    try {
        // YouTube Search API 호출
        let videos = await fetchSearchResults(keyword, country, category, timeRange, sortBy);
        
        console.log('✅ API 응답:', videos.length + '개 영상');
        
        // 카테고리 클라이언트 필터링
        if (category) {
            const beforeFilter = videos.length;
            videos = videos.filter(video => video.snippet.categoryId === category);
            console.log(`📂 카테고리 필터: ${beforeFilter}개 → ${videos.length}개 (${categoryName})`);
        }
        
        // ⭐ 조회수 필터링 (추가)
        if (minViews > 0) {
            const beforeFilter = videos.length;
            videos = videos.filter(video => {
                const views = parseInt(video.statistics.viewCount) || 0;
                return views >= minViews;
            });
            console.log(`👁️ 조회수 필터: ${beforeFilter}개 → ${videos.length}개 (${formatNumberSearch(minViews)} 이상)`);
        }
        
        // 100개 제한
        if (videos.length > 100) {
            console.log(`✂️ 결과 제한: ${videos.length}개 → 100개`);
            videos = videos.slice(0, 100);
        }
        
        console.log('✅ 최종 결과:', videos.length + '개 영상');
        
        // 결과 표시
        displaySearchResults(videos, keyword, countryName, categoryName, viewsName);
        
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="loading">
                <p>❌ 검색 오류 발생!</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    ${error.message}
                </p>
                <p style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                    💡 네트워크 연결 또는 API 키를 확인해주세요.
                </p>
            </div>
        `;
        console.error('❌ 검색 오류:', error);
    }
}

// 🌐 YouTube Search API 호출
async function fetchSearchResults(keyword, country, category, timeRange, sortBy) {
    let allVideos = [];
    let pageToken = '';
    const targetCount = 150; // 필터링 손실을 고려해 150개 요청
    
    // 카테고리별 검색 키워드 추가
    let searchQuery = keyword;
    if (category) {
        const categoryKeywords = {
            '10': ' music song',
            '20': ' game gaming gameplay',
            '17': ' sports match',
            '24': ' entertainment show',
            '28': ' tech technology science',
            '22': ' vlog daily',
            '23': ' comedy funny',
            '25': ' news politics',
            '26': ' education tutorial learning'
        };
        searchQuery += (categoryKeywords[category] || '');
    }
    
    // 날짜 필터 계산
    let publishedAfter = '';
    if (timeRange !== 'all') {
        const now = new Date();
        switch (timeRange) {
            case 'today':
                now.setDate(now.getDate() - 1);
                break;
            case 'week':
                now.setDate(now.getDate() - 7);
                break;
            case 'month':
                now.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                now.setFullYear(now.getFullYear() - 1);
                break;
        }
        publishedAfter = '&publishedAfter=' + now.toISOString();
    }
    
    // 최대 3번 요청 (50개 x 3 = 150개)
    for (let i = 0; i < 3; i++) {
        const url = `https://www.googleapis.com/youtube/v3/search?` +
                    `part=snippet&` +
                    `q=${encodeURIComponent(searchQuery)}&` +
                    `type=video&` +
                    `regionCode=${country}&` +
                    `relevanceLanguage=${getLanguageCode(country)}&` +
                    `maxResults=50&` +
                    `order=${sortBy}` +
                    publishedAfter +
                    (pageToken ? `&pageToken=${pageToken}` : '') +
                    `&key=${CONFIG.YOUTUBE_API_KEY}`;
        
        console.log(`📡 API 요청 ${i + 1}/3:`, url.replace(CONFIG.YOUTUBE_API_KEY, 'KEY_HIDDEN'));
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        if (!data.items || data.items.length === 0) {
            console.warn(`⚠️ ${i + 1}번째 요청: 결과 없음`);
            break;
        }
        
        // 비디오 ID 추출
        const videoIds = data.items.map(item => item.id.videoId).filter(id => id);
        
        if (videoIds.length > 0) {
            // 비디오 상세 정보 가져오기 (categoryId, statistics 포함)
            const videoDetails = await fetchVideoDetails(videoIds);
            allVideos = allVideos.concat(videoDetails);
            
            console.log(`✅ ${i + 1}번째 요청: ${videoDetails.length}개 추가 (총: ${allVideos.length}개)`);
        }
        
        // 다음 페이지 토큰
        pageToken = data.nextPageToken;
        
        // 150개 도달하면 중단
        if (allVideos.length >= targetCount || !pageToken) {
            break;
        }
    }
    
    return allVideos;
}

// 📺 비디오 상세 정보 가져오기
async function fetchVideoDetails(videoIds) {
    const url = `https://www.googleapis.com/youtube/v3/videos?` +
                `part=snippet,statistics,contentDetails&` +
                `id=${videoIds.join(',')}&` +
                `key=${CONFIG.YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error.message);
    }
    
    return data.items || [];
}

// 📺 검색 결과 표시
function displaySearchResults(videos, keyword, countryName, categoryName, viewsName) {
    const resultsDiv = document.getElementById('search-results');
    
    if (!videos || videos.length === 0) {
        resultsDiv.innerHTML = `
            <div class="loading">
                <p>😢 "${keyword}" 검색 결과가 없습니다.</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    ${categoryName !== '전체' ? `"${categoryName}" 카테고리 또는 ` : ''}
                    "${viewsName}" 조건에서 결과를 찾지 못했어요.
                </p>
                <p style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                    💡 다른 검색어, 카테고리 또는 조회수 조건을 시도해보세요!
                </p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; margin-bottom: 30px;">
            <h3 style="margin: 0; color: #667eea;">
                🏆 "${keyword}" 검색 결과 <span style="color: #764ba2;">${videos.length}개</span>
            </h3>
            <p style="margin: 10px 0 0; color: #888; font-size: 0.95em;">
                ${countryName} · ${categoryName} · ${viewsName}
            </p>
        </div>
    `;
    
    videos.forEach((video, index) => {
        const title = escapeHtmlSearch(video.snippet.title);
        const thumbnail = video.snippet.thumbnails.medium.url;
        const views = formatNumberSearch(video.statistics.viewCount);
        const likes = formatNumberSearch(video.statistics.likeCount || 0);
        const comments = formatNumberSearch(video.statistics.commentCount || 0);
        const videoId = video.id;
        const channelTitle = escapeHtmlSearch(video.snippet.channelTitle);
        const publishedAt = formatDateSearch(video.snippet.publishedAt);
        
        // 카테고리 배지
        const videoCategoryId = video.snippet.categoryId;
        const videoCategoryName = SEARCH_CATEGORY_NAMES[videoCategoryId] || '';
        
        html += `
            <div class="video-card">
                <div class="rank">#${index + 1}</div>
                ${videoCategoryName ? `<div class="category-badge">${videoCategoryName}</div>` : ''}
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                <h3>${title}</h3>
                <p style="padding: 0 15px; color: #888; font-size: 0.9em; margin-bottom: 5px;">
                    📺 ${channelTitle}
                </p>
                <p style="padding: 0 15px; color: #aaa; font-size: 0.85em; margin-bottom: 10px;">
                    📅 ${publishedAt}
                </p>
                <div class="stats">
                    <span title="조회수">👁️ ${views}</span>
                    <span title="좋아요">👍 ${likes}</span>
                    <span title="댓글">💬 ${comments}</span>
                </div>
                <a href="https://youtube.com/watch?v=${videoId}" 
                   target="_blank" 
                   class="watch-btn"
                   rel="noopener noreferrer">
                    ▶️ 영상 보기
                </a>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// 🛠️ 유틸리티 함수들
function getTimeRangeName(timeRange) {
    const names = {
        'all': '전체 기간',
        'today': '오늘',
        'week': '이번 주',
        'month': '이번 달',
        'year': '올해'
    };
    return names[timeRange] || '전체 기간';
}

function getViewsFilterName(minViews) {
    if (minViews === 0) return '제한 없음';
    return formatNumberSearch(minViews) + ' 이상';
}

function getLanguageCode(country) {
    const codes = {
        'KR': 'ko', 'JP': 'ja', 'US': 'en', 'GB': 'en',
        'IN': 'hi', 'BR': 'pt', 'FR': 'fr', 'DE': 'de'
    };
    return codes[country] || 'en';
}

function formatNumberSearch(num) {
    num = parseInt(num) || 0;
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '억';
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    if (num >= 1000) return (num / 1000).toFixed(1) + '천';
    return num.toString();
}

function formatDateSearch(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return diffDays + '일 전';
    if (diffDays < 30) return Math.floor(diffDays / 7) + '주 전';
    if (diffDays < 365) return Math.floor(diffDays / 30) + '개월 전';
    return Math.floor(diffDays / 365) + '년 전';
}

function escapeHtmlSearch(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
