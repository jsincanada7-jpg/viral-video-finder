// 🎬 유튜브 인기 영상 검색 기능 (수정판 - 검색 결과 매칭 개선)

const CATEGORY_NAMES = {
    '': '전체',
    '10': '음악',
    '20': '게임',
    '17': '스포츠',
    '24': '엔터테인먼트',
    '28': '과학/기술',
    '22': '브이로그',
    '23': '코미디',
    '25': '뉴스/정치',
    '26': '교육'
};

const COUNTRY_NAMES = {
    'KR': '한국',
    'US': '미국',
    'JP': '일본',
    'GB': '영국',
    'IN': '인도',
    'BR': '브라질',
    'FR': '프랑스',
    'DE': '독일'
};

const TIME_RANGE_NAMES = {
    'today': '오늘',
    'week': '이번 주',
    'month': '이번 달',
    'year': '올해',
    'all': '전체 기간'
};

const SORT_NAMES = {
    'popularity': '인기순',
    'views': '조회수순',
    'likes': '좋아요순',
    'comments': '댓글순',
    'recent': '최신순'
};

let currentVideos = [];

// 🔍 메인 검색 함수
async function searchYouTube() {
    const country = document.getElementById('country-select').value;
    const category = document.getElementById('category-select').value;
    const timeRange = document.getElementById('time-range-select').value;
    const sortBy = document.getElementById('sort-select').value;
    const resultsDiv = document.getElementById('youtube-results');
    const filterInfo = document.getElementById('current-filter');
    const resultCount = document.getElementById('result-count');
    
    const countryName = COUNTRY_NAMES[country] || country;
    const categoryName = CATEGORY_NAMES[category] || '전체';
    const timeRangeName = TIME_RANGE_NAMES[timeRange] || timeRange;
    const sortName = SORT_NAMES[sortBy] || sortBy;
    
    filterInfo.innerHTML = `
        <span>🌍 <strong>${countryName}</strong></span>
        <span style="margin: 0 10px;">|</span>
        <span>📂 <strong>${categoryName}</strong></span>
        <span style="margin: 0 10px;">|</span>
        <span>📅 <strong>${timeRangeName}</strong></span>
        <span style="margin: 0 10px;">|</span>
        <span>📊 <strong>${sortName}</strong></span>
    `;
    
    resultsDiv.innerHTML = `
        <div class="loading">
            <p>🔍 검색 중...</p>
            <p style="font-size: 0.9em;">${countryName}의 ${categoryName} 영상을 찾고 있어요!</p>
        </div>
    `;
    
    resultCount.innerHTML = '';
    
    try {
        console.log('🔍 검색 시작:', { 
            country: countryName, 
            category: categoryName, 
            categoryId: category,
            timeRange: timeRangeName, 
            sort: sortName 
        });
        
        let videos = [];
        
        // 기간과 카테고리에 따라 다른 API 사용
        if (timeRange === 'all' && !category) {
            // 전체 기간 + 전체 카테고리 = mostPopular API
            videos = await fetchMostPopular(country, null);
            console.log('📊 사용된 API: mostPopular (전체)');
        } else if (timeRange === 'all' && category) {
            // 전체 기간 + 특정 카테고리 = mostPopular with category
            videos = await fetchMostPopular(country, category);
            console.log('📊 사용된 API: mostPopular (카테고리 필터)');
        } else {
            // 특정 기간 = search API
            videos = await fetchSearchVideos(country, category, timeRange);
            console.log('📊 사용된 API: search (기간 필터)');
        }
        
        console.log('✅ API에서 받은 영상:', videos.length + '개');
        
        if (videos.length === 0) {
            resultsDiv.innerHTML = `
                <div class="loading">
                    <p>😢 검색 결과가 없습니다.</p>
                    <p style="font-size: 0.9em;">다른 필터를 선택해보세요!</p>
                    <p style="font-size: 0.85em; margin-top: 10px; color: rgba(255,255,255,0.8);">
                        💡 팁: "전체 기간"으로 변경하면 더 많은 결과를 볼 수 있어요!
                    </p>
                </div>
            `;
            return;
        }
        
        // 카테고리 필터링 (클라이언트 사이드)
        if (category) {
            const beforeFilter = videos.length;
            videos = videos.filter(video => video.snippet.categoryId === category);
            console.log(`🎯 카테고리 필터링: ${beforeFilter}개 → ${videos.length}개`);
        }
        
        if (videos.length === 0) {
            resultsDiv.innerHTML = `
                <div class="loading">
                    <p>😢 해당 카테고리의 영상이 없습니다.</p>
                    <p style="font-size: 0.9em;">"전체" 카테고리로 검색해보세요!</p>
                </div>
            `;
            return;
        }
        
        // 정렬
        videos = sortVideos(videos, sortBy);
        console.log('✅ 정렬 완료:', sortName);
        
        currentVideos = videos;
        
        resultCount.innerHTML = `총 <span>${videos.length}</span>개의 영상을 찾았습니다.`;
        
        displayYouTubeResults(videos, categoryName, sortBy);
        
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="loading">
                <p>❌ 검색 실패!</p>
                <p style="font-size: 0.9em;">${error.message}</p>
            </div>
        `;
        console.error('❌ Error:', error);
    }
}

// 🔥 인기 영상 API (전체 기간용)
async function fetchMostPopular(country, categoryId) {
    let url = `https://www.googleapis.com/youtube/v3/videos?` +
              `part=snippet,statistics,contentDetails&` +
              `chart=mostPopular&` +
              `regionCode=${country}&` +
              `maxResults=50&` +
              `key=${CONFIG.YOUTUBE_API_KEY}`;
    
    if (categoryId) {
        url += `&videoCategoryId=${categoryId}`;
    }
    
    console.log('🔗 인기 영상 API 호출', categoryId ? `(카테고리: ${categoryId})` : '');
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
        console.error('API 오류:', data.error);
        throw new Error(data.error.message);
    }
    
    return data.items || [];
}

// 🔍 검색 API (기간별용)
async function fetchSearchVideos(country, categoryId, timeRange) {
    // 날짜 계산
    const now = new Date();
    let publishedAfter = null;
    
    switch (timeRange) {
        case 'today':
            publishedAfter = new Date(now);
            publishedAfter.setHours(0, 0, 0, 0);
            break;
        case 'week':
            publishedAfter = new Date(now);
            publishedAfter.setDate(publishedAfter.getDate() - 7);
            break;
        case 'month':
            publishedAfter = new Date(now);
            publishedAfter.setMonth(publishedAfter.getMonth() - 1);
            break;
        case 'year':
            publishedAfter = new Date(now);
            publishedAfter.setFullYear(publishedAfter.getFullYear() - 1);
            break;
    }
    
    // 검색 키워드 (카테고리별)
    const categoryKeywords = {
        '10': 'music OR 음악 OR song',
        '20': 'gaming OR 게임 OR gameplay',
        '17': 'sports OR 스포츠 OR game',
        '24': 'entertainment OR 엔터테인먼트',
        '28': 'technology OR 기술 OR tech',
        '22': 'vlog OR 브이로그 OR daily',
        '23': 'comedy OR 코미디 OR funny',
        '25': 'news OR 뉴스',
        '26': 'education OR 교육 OR tutorial'
    };
    
    const keyword = categoryId ? categoryKeywords[categoryId] : '';
    
    // Search API로 비디오 ID 가져오기
    let searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
                    `part=snippet&` +
                    `type=video&` +
                    `regionCode=${country}&` +
                    `maxResults=50&` +
                    `order=viewCount&` +
                    `key=${CONFIG.YOUTUBE_API_KEY}`;
    
    if (keyword) {
        searchUrl += `&q=${encodeURIComponent(keyword)}`;
    }
    
    if (publishedAfter) {
        searchUrl += `&publishedAfter=${publishedAfter.toISOString()}`;
    }
    
    console.log('🔗 검색 API 호출', keyword ? `(키워드: ${keyword})` : '');
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (searchData.error) {
        console.error('검색 API 오류:', searchData.error);
        throw new Error(searchData.error.message);
    }
    
    if (!searchData.items || searchData.items.length === 0) {
        console.warn('검색 결과 없음');
        return [];
    }
    
    // 비디오 ID 추출
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    
    // 비디오 상세 정보 가져오기
    const detailUrl = `https://www.googleapis.com/youtube/v3/videos?` +
                      `part=snippet,statistics,contentDetails&` +
                      `id=${videoIds}&` +
                      `key=${CONFIG.YOUTUBE_API_KEY}`;
    
    console.log('🔗 상세 정보 API 호출');
    
    const detailResponse = await fetch(detailUrl);
    const detailData = await detailResponse.json();
    
    if (detailData.error) {
        console.error('상세 정보 API 오류:', detailData.error);
        throw new Error(detailData.error.message);
    }
    
    return detailData.items || [];
}

// 📊 정렬 함수
function sortVideos(videos, sortBy) {
    const sorted = [...videos];
    
    switch (sortBy) {
        case 'views':
            sorted.sort((a, b) => parseInt(b.statistics.viewCount || 0) - parseInt(a.statistics.viewCount || 0));
            break;
        case 'likes':
            sorted.sort((a, b) => parseInt(b.statistics.likeCount || 0) - parseInt(a.statistics.likeCount || 0));
            break;
        case 'comments':
            sorted.sort((a, b) => parseInt(b.statistics.commentCount || 0) - parseInt(a.statistics.commentCount || 0));
            break;
        case 'recent':
            sorted.sort((a, b) => new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt));
            break;
        case 'popularity':
        default:
            sorted.sort((a, b) => {
                const scoreA = parseInt(a.statistics.viewCount || 0) + 
                              (parseInt(a.statistics.likeCount || 0) * 10) + 
                              (parseInt(a.statistics.commentCount || 0) * 5);
                const scoreB = parseInt(b.statistics.viewCount || 0) + 
                              (parseInt(b.statistics.likeCount || 0) * 10) + 
                              (parseInt(b.statistics.commentCount || 0) * 5);
                return scoreB - scoreA;
            });
            break;
    }
    
    return sorted;
}

// 📺 검색 결과 표시
function displayYouTubeResults(videos, categoryName, sortBy) {
    const resultsDiv = document.getElementById('youtube-results');
    
    if (!videos || videos.length === 0) {
        resultsDiv.innerHTML = `<div class="loading"><p>😢 표시할 영상이 없습니다.</p></div>`;
        return;
    }
    
    let html = '';
    
    videos.forEach((video, index) => {
        const title = escapeHtml(video.snippet.title);
        const thumbnail = video.snippet.thumbnails.medium.url;
        const views = formatNumber(video.statistics.viewCount);
        const likes = formatNumber(video.statistics.likeCount || 0);
        const comments = formatNumber(video.statistics.commentCount || 0);
        const videoId = video.id;
        const channelTitle = escapeHtml(video.snippet.channelTitle);
        
        const publishedAt = video.snippet.publishedAt;
        const relativeDate = formatDate(publishedAt);
        const exactDate = formatExactDate(publishedAt);
        
        const videoCategoryId = video.snippet.categoryId;
        const videoCategoryName = CATEGORY_NAMES[videoCategoryId] || '';
        
        let sortIndicator = '';
        if (index < 3) {
            const medals = ['🥇', '🥈', '🥉'];
            sortIndicator = `<div class="sort-indicator">${medals[index]} TOP ${index + 1}</div>`;
        }
        
        html += `
            <div class="video-card">
                <div class="rank">#${index + 1}</div>
                ${videoCategoryName ? `<div class="category-badge">${videoCategoryName}</div>` : ''}
                ${sortIndicator}
                <img src="${thumbnail}" alt="${title}" loading="lazy">
                <h3>${title}</h3>
                <p style="padding: 0 15px; color: #888; font-size: 0.9em; margin-bottom: 5px;">
                    📺 ${channelTitle}
                </p>
                <div class="video-date-info">
                    <span class="relative-date" title="${exactDate}">📅 ${relativeDate}</span>
                    <span class="exact-date">🗓️ ${exactDate}</span>
                </div>
                <div class="stats">
                    <span title="조회수">👁️ ${views}</span>
                    <span title="좋아요">👍 ${likes}</span>
                    <span title="댓글">💬 ${comments}</span>
                </div>
                <a href="https://youtube.com/watch?v=${videoId}" target="_blank" class="watch-btn" rel="noopener noreferrer">
                    ▶️ 영상 보기
                </a>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// 🔄 필터 초기화
function resetFilters() {
    document.getElementById('country-select').value = 'KR';
    document.getElementById('category-select').value = '';
    document.getElementById('time-range-select').value = 'all';
    document.getElementById('sort-select').value = 'popularity';
    console.log('🔄 필터 초기화');
    searchYouTube();
}

// 숫자 포맷팅
function formatNumber(num) {
    num = parseInt(num) || 0;
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '억';
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    if (num >= 1000) return (num / 1000).toFixed(1) + '천';
    return num.toString();
}

// 상대적 날짜
function formatDate(dateString) {
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

// 정확한 날짜
function formatExactDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 페이지 로드
window.addEventListener('load', () => {
    console.log('🚀 페이지 로드 완료');
    searchYouTube();
});
