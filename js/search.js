// ========================================
// 🔍 YouTube 영상 키워드 검색
// ========================================

// 검색 카테고리 매핑
const SEARCH_CATEGORY_NAMES = {
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

// 검색 국가 매핑
const SEARCH_COUNTRIES = {
    'KR': '🇰🇷 한국',
    'US': '🇺🇸 미국',
    'JP': '🇯🇵 일본',
    'GB': '🇬🇧 영국',
    'IN': '🇮🇳 인도',
    'BR': '🇧🇷 브라질',
    'FR': '🇫🇷 프랑스',
    'DE': '🇩🇪 독일'
};

// 카테고리별 키워드 확장
const CATEGORY_KEYWORDS = {
    '10': ['music', 'song', 'mv'],
    '20': ['game', 'gameplay', 'gaming'],
    '17': ['sports', 'match', 'league'],
    '24': ['entertainment', 'show', 'variety'],
    '28': ['tech', 'technology', 'review'],
    '22': ['vlog', 'daily', 'life'],
    '23': ['comedy', 'funny', 'humor'],
    '25': ['news', 'politics', 'current'],
    '26': ['education', 'tutorial', 'how to']
};

// YouTube 영상 검색 실행
async function performSearch() {
    const keywordInput = document.getElementById('search-keyword');
    const countrySelect = document.getElementById('search-country-select');
    const categorySelect = document.getElementById('search-category-select');
    const timeSelect = document.getElementById('search-time-select');
    const viewsSelect = document.getElementById('search-views-select');
    const sortSelect = document.getElementById('search-sort-select');
    const resultsDiv = document.getElementById('search-results');
    const filterInfoDiv = document.getElementById('search-filter-info');
    
    if (!keywordInput || !resultsDiv) return;
    
    const keyword = keywordInput.value.trim();
    
    if (!keyword) {
        alert('❌ 검색어를 입력해주세요!');
        return;
    }
    
    // API 키 확인
    if (typeof YOUTUBE_API_KEY === 'undefined' || !YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_YOUTUBE_API_KEY_HERE') {
        resultsDiv.innerHTML = `
            <div class="error">
                <p>😢 YouTube API 키가 설정되지 않았습니다.</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    index.html 파일에서 YOUTUBE_API_KEY를 설정해주세요.
                </p>
            </div>
        `;
        return;
    }
    
    const country = countrySelect ? countrySelect.value : 'KR';
    const category = categorySelect ? categorySelect.value : '';
    const time = timeSelect ? timeSelect.value : 'all';
    const minViews = viewsSelect ? parseInt(viewsSelect.value) : 0;
    const sort = sortSelect ? sortSelect.value : 'relevance';
    
    console.log('🔍 YouTube 영상 검색:', { keyword, country, category, time, minViews, sort });
    
    // 필터 정보 표시
    if (filterInfoDiv) {
        filterInfoDiv.innerHTML = `
            <strong>검색 조건:</strong> 
            "${keyword}" · ${SEARCH_COUNTRIES[country]} · ${SEARCH_CATEGORY_NAMES[category]} · 
            ${getTimeName(time)} · ${getViewsName(minViews)} · ${getSortNameSearch(sort)}
        `;
    }
    
    // 로딩 표시
    resultsDiv.innerHTML = '<div class="loading">🔍 YouTube 영상 검색 중...</div>';
    
    try {
        // 검색어 확장 (카테고리별)
        let searchQuery = keyword;
        if (category && CATEGORY_KEYWORDS[category]) {
            searchQuery = keyword + ' ' + CATEGORY_KEYWORDS[category][0];
        }
        
        const allVideos = [];
        
        // 여러 번 검색하여 충분한 결과 수집 (필터링 후에도 충분하도록)
        for (let i = 0; i < 3; i++) {
            try {
                const videos = await fetchSearchResults(
                    searchQuery, 
                    country, 
                    category, 
                    time, 
                    sort, 
                    50
                );
                
                allVideos.push(...videos);
                
                if (allVideos.length >= 150) break;
                
            } catch (err) {
                console.warn(`검색 ${i + 1}회 실패:`, err);
            }
        }
        
        console.log(`✅ 총 ${allVideos.length}개 영상 수집`);
        
        if (allVideos.length === 0) {
            resultsDiv.innerHTML = '<div class="loading">😢 검색 결과가 없습니다.</div>';
            return;
        }
        
        // 카테고리 필터링
        let filteredVideos = allVideos;
        if (category) {
            filteredVideos = allVideos.filter(video => video.categoryId === category);
            console.log(`📂 카테고리 필터링 후: ${filteredVideos.length}개`);
        }
        
        // 최소 조회수 필터링
        if (minViews > 0) {
            filteredVideos = filteredVideos.filter(video => video.viewCount >= minViews);
            console.log(`👁️ 조회수 필터링 후: ${filteredVideos.length}개 (최소 ${minViews})`);
        }
        
        // 중복 제거
        const uniqueVideos = [];
        const seenIds = new Set();
        for (const video of filteredVideos) {
            if (!seenIds.has(video.id)) {
                seenIds.add(video.id);
                uniqueVideos.push(video);
            }
        }
        
        console.log(`✅ 중복 제거 후: ${uniqueVideos.length}개`);
        
        if (uniqueVideos.length === 0) {
            resultsDiv.innerHTML = `
                <div class="loading">
                    <p>😢 필터 조건에 맞는 영상이 없습니다.</p>
                    <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                        필터 조건을 완화하거나 다른 검색어를 시도해보세요.
                    </p>
                </div>
            `;
            return;
        }
        
        // 상위 100개만 표시
        displaySearchResults(uniqueVideos.slice(0, 100));
        
    } catch (error) {
        console.error('❌ 검색 오류:', error);
        resultsDiv.innerHTML = `
            <div class="error">
                <p>❌ 검색 오류 발생!</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    ${error.message}
                </p>
                <p style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                    💡 네트워크 연결 또는 API 키를 확인해주세요.
                </p>
            </div>
        `;
    }
}

// YouTube Search API 호출
async function fetchSearchResults(query, country, category, time, sort, maxResults) {
    // 시간 필터 변환
    let publishedAfter = '';
    const now = new Date();
    
    switch (time) {
        case 'today':
            publishedAfter = new Date(now.setDate(now.getDate() - 1)).toISOString();
            break;
        case 'week':
            publishedAfter = new Date(now.setDate(now.getDate() - 7)).toISOString();
            break;
        case 'month':
            publishedAfter = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
            break;
        case 'year':
            publishedAfter = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
            break;
    }
    
    // 국가 코드를 언어 코드로 변환
    const languageCode = getLanguageCode(country);
    
    // Search API URL 구성
    let searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet` +
        `&q=${encodeURIComponent(query)}` +
        `&type=video` +
        `&maxResults=${maxResults}` +
        `&regionCode=${country}` +
        `&relevanceLanguage=${languageCode}` +
        `&order=${sort}` +
        `&key=${YOUTUBE_API_KEY}`;
    
    if (publishedAfter) {
        searchUrl += `&publishedAfter=${publishedAfter}`;
    }
    
    console.log('📡 YouTube Search API 호출...');
    
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
        throw new Error(`Search API 오류: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
        return [];
    }
    
    // Video IDs 추출
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    
    // Videos API로 상세 정보 가져오기
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,statistics,contentDetails` +
        `&id=${videoIds}` +
        `&key=${YOUTUBE_API_KEY}`;
    
    const videosResponse = await fetch(videosUrl);
    
    if (!videosResponse.ok) {
        throw new Error(`Videos API 오류: ${videosResponse.status}`);
    }
    
    const videosData = await videosResponse.json();
    
    if (!videosData.items) {
        return [];
    }
    
    // 영상 데이터 가공
    return videosData.items.map(item => ({
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium.url,
        categoryId: item.snippet.categoryId,
        viewCount: parseInt(item.statistics.viewCount) || 0,
        likeCount: parseInt(item.statistics.likeCount) || 0,
        commentCount: parseInt(item.statistics.commentCount) || 0,
        publishedAt: item.snippet.publishedAt
    }));
}

// 검색 결과 표시 (업로드 날짜 포함)
function displaySearchResults(videos) {
    const resultsDiv = document.getElementById('search-results');
    
    if (!resultsDiv) return;
    
    if (!videos || videos.length === 0) {
        resultsDiv.innerHTML = '<div class="loading">😢 검색 결과가 없습니다.</div>';
        return;
    }
    
    let html = '';
    
    videos.forEach((video, index) => {
        const categoryBadge = getSearchCategoryBadge(video.categoryId);
        const uploadDate = formatUploadDate(video.publishedAt);
        
        html += `
            <div class="video-card">
                <div class="video-rank">#${index + 1}</div>
                <img src="${video.thumbnail}" 
                     alt="${escapeSearchHtml(video.title)}" 
                     onclick="window.open('https://www.youtube.com/watch?v=${video.id}', '_blank')"
                     style="cursor: pointer;">
                <div class="video-info">
                    ${categoryBadge}
                    <div class="video-title" 
                         onclick="window.open('https://www.youtube.com/watch?v=${video.id}', '_blank')"
                         style="cursor: pointer;">
                        ${escapeSearchHtml(video.title)}
                    </div>
                    <div class="video-channel">${escapeSearchHtml(video.channelTitle)}</div>
                    
                    <!-- 업로드 날짜 표시 -->
                    <div class="video-upload-date">
                        📅 ${uploadDate}
                    </div>
                    
                    <div class="video-stats">
                        <span title="조회수">👁️ ${formatSearchNumber(video.viewCount)}</span>
                        <span title="좋아요">👍 ${formatSearchNumber(video.likeCount)}</span>
                        <span title="댓글">💬 ${formatSearchNumber(video.commentCount)}</span>
                    </div>
                    
                    <!-- 대본 다운로드 버튼 -->
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <a href="https://www.youtube.com/watch?v=${video.id}" 
                           target="_blank" 
                           class="transcript-btn transcript-btn-secondary"
                           style="flex: 1; text-align: center; text-decoration: none;"
                           title="YouTube에서 자막 확인"
                           onclick="event.stopPropagation();">
                            📺 자막 보기
                        </a>
                        <a href="https://downsub.com/?url=https://www.youtube.com/watch?v=${video.id}" 
                           target="_blank" 
                           class="transcript-btn"
                           style="flex: 1; text-align: center; text-decoration: none;"
                           title="외부 서비스에서 자막 다운로드"
                           onclick="event.stopPropagation();">
                            📄 자막 다운로드
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// ========================================
// 유틸리티 함수
// ========================================

// 국가 코드 → 언어 코드 변환
function getLanguageCode(countryCode) {
    const languageMap = {
        'KR': 'ko',  // 한국 → 한국어
        'US': 'en',  // 미국 → 영어
        'JP': 'ja',  // 일본 → 일본어
        'GB': 'en',  // 영국 → 영어
        'IN': 'hi',  // 인도 → 힌디어
        'BR': 'pt',  // 브라질 → 포르투갈어
        'FR': 'fr',  // 프랑스 → 프랑스어
        'DE': 'de'   // 독일 → 독일어
    };
    
    return languageMap[countryCode] || 'en';
}

// 카테고리 뱃지 생성
function getSearchCategoryBadge(categoryId) {
    const categoryName = SEARCH_CATEGORY_NAMES[categoryId] || '기타';
    return `<span class="video-category">${categoryName}</span>`;
}

// 시간 필터 이름
function getTimeName(time) {
    const timeNames = {
        'all': '전체 기간',
        'today': '오늘',
        'week': '이번 주',
        'month': '이번 달',
        'year': '올해'
    };
    return timeNames[time] || '전체 기간';
}

// 조회수 필터 이름
function getViewsName(minViews) {
    if (minViews === 0) return '제한 없음';
    if (minViews >= 100000000) return '1억 이상';
    if (minViews >= 10000000) return '1,000만 이상';
    if (minViews >= 1000000) return '100만 이상';
    if (minViews >= 100000) return '10만 이상';
    if (minViews >= 10000) return '1만 이상';
    if (minViews >= 1000) return '1천 이상';
    return minViews + ' 이상';
}

// 정렬 기준 이름
function getSortNameSearch(sort) {
    const sortNames = {
        'relevance': '관련성',
        'viewCount': '조회수',
        'date': '최신순',
        'rating': '평점'
    };
    return sortNames[sort] || '관련성';
}

// 숫자 포맷팅
function formatSearchNumber(num) {
    const n = parseInt(num);
    if (isNaN(n)) return '0';
    if (n >= 100000000) return (n / 100000000).toFixed(1) + '억';
    if (n >= 10000) return (n / 10000).toFixed(1) + '만';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

// HTML 이스케이프
function escapeSearchHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// 업로드 날짜 포맷팅
function formatUploadDate(dateString) {
    if (!dateString) return '날짜 정보 없음';
    
    const uploadDate = new Date(dateString);
    const now = new Date();
    
    // 시간 차이 계산 (밀리초)
    const diffTime = Math.abs(now - uploadDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    // 상대적 시간 표시
    if (diffMinutes < 60) {
        return `${diffMinutes}분 전`;
    } else if (diffHours < 24) {
        return `${diffHours}시간 전`;
    } else if (diffDays < 7) {
        return `${diffDays}일 전`;
    } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return `${weeks}주 전`;
    } else if (diffDays < 365) {
        const months = Math.floor(diffDays / 30);
        return `${months}개월 전`;
    } else {
        const years = Math.floor(diffDays / 365);
        return `${years}년 전`;
    }
}

// ========================================
// 페이지 로드 완료
// ========================================

console.log('✅ search.js 로드 완료');
