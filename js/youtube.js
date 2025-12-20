// 🎬 유튜브 인기 영상 검색 기능 (기간 필터 제거)

const CATEGORY_NAMES = {
    '': '전체',
    '10': '음악', '20': '게임', '17': '스포츠',
    '24': '엔터테인먼트', '28': '과학/기술',
    '22': '브이로그', '23': '코미디',
    '25': '뉴스/정치', '26': '교육'
};

const COUNTRY_NAMES = {
    'KR': '한국', 'US': '미국', 'JP': '일본', 'GB': '영국',
    'IN': '인도', 'BR': '브라질', 'FR': '프랑스', 'DE': '독일'
};

// 🎯 메인 검색 함수
async function searchYouTube() {
    console.log('🔍 searchYouTube 함수 호출됨');
    
    // HTML 요소 확인
    const countrySelect = document.getElementById('country-select');
    const categorySelect = document.getElementById('category-select');
    const sortSelect = document.getElementById('sort-select');
    const filterInfo = document.getElementById('current-filter');
    const resultsDiv = document.getElementById('youtube-results');
    
    // ⚠️ 필수 요소 null 체크
    if (!countrySelect || !categorySelect || !sortSelect) {
        console.error('❌ 필터 요소를 찾을 수 없습니다!');
        console.log('country-select:', countrySelect);
        console.log('category-select:', categorySelect);
        console.log('sort-select:', sortSelect);
        return;
    }
    
    if (!filterInfo || !resultsDiv) {
        console.error('❌ 결과 표시 요소를 찾을 수 없습니다!');
        console.log('current-filter:', filterInfo);
        console.log('youtube-results:', resultsDiv);
        return;
    }
    
    // 값 가져오기 (기간 제외)
    const country = countrySelect.value;
    const category = categorySelect.value;
    const sortBy = sortSelect.value;
    
    const countryName = COUNTRY_NAMES[country] || country;
    const categoryName = CATEGORY_NAMES[category] || '전체';
    
    console.log('📊 검색 시작:', { 
        country: countryName, 
        category: categoryName, 
        categoryId: category,
        sort: sortBy 
    });
    
    // 필터 정보 표시 (기간 제외)
    filterInfo.innerHTML = `
        <span>🌍 <strong>${countryName}</strong></span>
        <span style="margin: 0 15px;">|</span>
        <span>📂 <strong>${categoryName}</strong></span>
        <span style="margin: 0 15px;">|</span>
        <span>📊 <strong>${getSortName(sortBy)}</strong></span>
    `;
    
    // 로딩 메시지
    resultsDiv.innerHTML = `
        <div class="loading">
            <p>🔍 검색 중...</p>
            <p style="font-size: 0.9em;">${countryName}의 ${categoryName} 인기 영상을 찾고 있어요!</p>
        </div>
    `;
    
    try {
        // 항상 mostPopular API 사용 (전체 기간)
        console.log('📡 사용된 API: mostPopular (전체 기간)');
        let videos = await fetchMostPopular(country, category);
        
        console.log('✅ API에서 받은 영상:', videos.length + '개');
        
        // 클라이언트 측 카테고리 필터링
        if (category && videos.length > 0) {
            const beforeFilter = videos.length;
            videos = videos.filter(v => v.snippet.categoryId === category);
            console.log(`📂 카테고리 필터: ${beforeFilter}개 → ${videos.length}개`);
        }
        
        // 정렬
        videos = sortVideos(videos, sortBy);
        console.log('✅ 정렬 완료:', getSortName(sortBy));
        
        // 100개 제한
        if (videos.length > 100) {
            console.log(`✂️ 영상 개수 제한: ${videos.length}개 → 100개`);
            videos = videos.slice(0, 100);
        }
        
        console.log('📺 최종 표시:', videos.length + '개 영상');
        
        // 결과 표시
        displayYouTubeResults(videos, categoryName, sortBy);
        
    } catch (error) {
        console.error('❌ 검색 오류:', error);
        resultsDiv.innerHTML = `
            <div class="loading">
                <p>❌ 검색 오류 발생!</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    ${error.message}
                </p>
                <p style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                    💡 API 키 또는 네트워크를 확인해주세요.
                </p>
            </div>
        `;
    }
}

// 🌐 mostPopular API (전체 기간)
async function fetchMostPopular(country, categoryId) {
    let allVideos = [];
    let pageToken = '';
    
    for (let i = 0; i < 2; i++) {
        let url = `https://www.googleapis.com/youtube/v3/videos?` +
                  `part=snippet,statistics,contentDetails&` +
                  `chart=mostPopular&` +
                  `regionCode=${country}&` +
                  `maxResults=50` +
                  (categoryId ? `&videoCategoryId=${categoryId}` : '') +
                  (pageToken ? `&pageToken=${pageToken}` : '') +
                  `&key=${CONFIG.YOUTUBE_API_KEY}`;
        
        console.log(`📡 mostPopular 요청 ${i + 1}/2`);
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        if (data.items && data.items.length > 0) {
            allVideos = allVideos.concat(data.items);
            console.log(`✅ ${i + 1}번째 요청: ${data.items.length}개 (총: ${allVideos.length}개)`);
        }
        
        pageToken = data.nextPageToken;
        if (!pageToken || allVideos.length >= 100) break;
    }
    
    return allVideos;
}

// 📊 정렬 함수
function sortVideos(videos, sortBy) {
    const sorted = [...videos];
    
    switch (sortBy) {
        case 'views':
            return sorted.sort((a, b) => 
                parseInt(b.statistics.viewCount || 0) - parseInt(a.statistics.viewCount || 0)
            );
        case 'likes':
            return sorted.sort((a, b) => 
                parseInt(b.statistics.likeCount || 0) - parseInt(a.statistics.likeCount || 0)
            );
        case 'comments':
            return sorted.sort((a, b) => 
                parseInt(b.statistics.commentCount || 0) - parseInt(a.statistics.commentCount || 0)
            );
        case 'recent':
            return sorted.sort((a, b) => 
                new Date(b.snippet.publishedAt) - new Date(a.snippet.publishedAt)
            );
        default: // popularity
            return sorted;
    }
}

// 📺 결과 표시
function displayYouTubeResults(videos, categoryName, sortBy) {
    const resultsDiv = document.getElementById('youtube-results');
    
    if (!resultsDiv) {
        console.error('❌ youtube-results 요소를 찾을 수 없습니다!');
        return;
    }
    
    if (!videos || videos.length === 0) {
        resultsDiv.innerHTML = `
            <div class="loading">
                <p>😢 검색 결과가 없습니다.</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    다른 필터를 선택해보세요!
                </p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; margin-bottom: 30px;">
            <h3 style="margin: 0; color: #667eea;">
                🏆 TOP ${videos.length}
            </h3>
            <p style="margin: 10px 0 0; color: #888; font-size: 0.95em;">
                ${categoryName} · ${getSortName(sortBy)}
            </p>
        </div>
    `;
    
    videos.forEach((video, index) => {
        const title = escapeHtml(video.snippet.title);
        const thumbnail = video.snippet.thumbnails.medium.url;
        const views = formatNumber(video.statistics.viewCount);
        const likes = formatNumber(video.statistics.likeCount || 0);
        const comments = formatNumber(video.statistics.commentCount || 0);
        const videoId = video.id;
        const channelTitle = escapeHtml(video.snippet.channelTitle);
        const publishedAt = formatDate(video.snippet.publishedAt);
        const videoCategoryId = video.snippet.categoryId;
        const videoCategoryName = CATEGORY_NAMES[videoCategoryId] || '';
        
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

// 🔄 필터 초기화 (기간 제외)
function resetFilters() {
    const countrySelect = document.getElementById('country-select');
    const categorySelect = document.getElementById('category-select');
    const sortSelect = document.getElementById('sort-select');
    
    if (countrySelect) countrySelect.value = 'KR';
    if (categorySelect) categorySelect.value = '';
    if (sortSelect) sortSelect.value = 'popularity';
    
    console.log('🔄 필터 초기화 완료');
    searchYouTube();
}

// 🛠️ 유틸리티 함수
function getSortName(sort) {
    const names = {
        'popularity': '인기순',
        'views': '조회수순',
        'likes': '좋아요순',
        'comments': '댓글순',
        'recent': '최신순'
    };
    return names[sort] || '인기순';
}

function formatNumber(num) {
    num = parseInt(num) || 0;
    if (num >= 100000000) return (num / 100000000).toFixed(1) + '억';
    if (num >= 10000) return (num / 10000).toFixed(1) + '만';
    if (num >= 1000) return (num / 1000).toFixed(1) + '천';
    return num.toString();
}

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

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 페이지 로드 시 자동 검색
window.addEventListener('load', () => {
    console.log('🚀 페이지 로드 완료');
    setTimeout(() => {
        searchYouTube();
    }, 100);
});
