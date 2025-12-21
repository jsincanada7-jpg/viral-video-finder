// 🔥 Reddit 검색 기능 (다중 CORS 프록시 + 안정화)

// 여러 CORS 프록시 목록 (자동 전환)
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://api.codetabs.com/v1/proxy?quest='
];

let currentProxyIndex = 0;

// 카테고리별 서브레딧 매핑 (검증된 서브레딧만)
const REDDIT_SUBREDDITS = {
    'all': {
        'KR': ['korea', 'hanguk'],
        'US': ['popular', 'AskReddit', 'news'],
        'JP': ['japan'],
        'GB': ['unitedkingdom', 'CasualUK'],
        'IN': ['india'],
        'BR': ['brasil'],
        'FR': ['france'],
        'DE': ['de']
    },
    'news': ['worldnews', 'news', 'politics'],
    'tech': ['technology', 'programming', 'gadgets'],
    'gaming': ['gaming', 'pcgaming'],
    'music': ['Music', 'hiphopheads', 'kpop'],
    'movies': ['movies', 'television'],
    'sports': ['sports', 'soccer', 'nba'],
    'science': ['science', 'space'],
    'business': ['business', 'Economics'],
    'skincare': ['SkincareAddiction', 'AsianBeauty']  // 수정: 정확한 서브레딧 이름
};

const REDDIT_CATEGORY_NAMES = {
    'all': '전체',
    'news': '뉴스/시사',
    'tech': '기술/IT',
    'gaming': '게임',
    'music': '음악',
    'movies': '영화/TV',
    'sports': '스포츠',
    'science': '과학',
    'business': '비즈니스',
    'skincare': '스킨케어'
};

const REDDIT_SORT_NAMES = {
    'hot': '인기순',
    'top': '베스트',
    'new': '최신순',
    'rising': '급상승'
};

const REDDIT_TIME_NAMES = {
    'day': '오늘',
    'week': '이번 주',
    'month': '이번 달',
    'year': '올해',
    'all': '전체 기간'
};

const REDDIT_COUNTRY_NAMES = {
    'KR': '🇰🇷 한국',
    'US': '🇺🇸 미국',
    'JP': '🇯🇵 일본',
    'GB': '🇬🇧 영국',
    'IN': '🇮🇳 인도',
    'BR': '🇧🇷 브라질',
    'FR': '🇫🇷 프랑스',
    'DE': '🇩🇪 독일'
};

// CORS 프록시를 통한 안전한 fetch
async function safeFetch(url, maxRetries = 3) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const proxy = CORS_PROXIES[currentProxyIndex];
            let proxyUrl;
            
            if (proxy.includes('allorigins')) {
                proxyUrl = proxy + encodeURIComponent(url);
            } else {
                proxyUrl = proxy + url;
            }
            
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                return await response.json();
            }
            
            // 프록시 서버 오류 시 다음 프록시로 전환
            currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
            
        } catch (error) {
            // 프록시 서버 오류 시 다음 프록시로 전환
            currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
            
            if (attempt === maxRetries - 1) {
                throw error;
            }
        }
        
        // 재시도 전 대기
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    throw new Error('모든 프록시 서버 시도 실패');
}

// Reddit 검색 실행
async function searchReddit() {
    const keywordInput = document.getElementById('reddit-keyword');
    const countrySelect = document.getElementById('reddit-country-select');
    const categorySelect = document.getElementById('reddit-category-select');
    const sortSelect = document.getElementById('reddit-sort-select');
    const timeSelect = document.getElementById('reddit-time-select');
    const resultsDiv = document.getElementById('reddit-results');
    const filterInfoDiv = document.getElementById('reddit-filter-info');
    
    if (!keywordInput || !countrySelect || !categorySelect || !sortSelect || !timeSelect || !resultsDiv || !filterInfoDiv) {
        if (resultsDiv) {
            resultsDiv.innerHTML = '<div class="error">❌ 페이지 요소를 찾을 수 없습니다.</div>';
        }
        return;
    }
    
    const keyword = keywordInput.value.trim();
    const country = countrySelect.value;
    const category = categorySelect.value;
    const sort = sortSelect.value;
    const time = timeSelect.value;
    
    // 필터 정보 표시
    filterInfoDiv.innerHTML = `
        <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin: 20px 0;">
            <strong>검색 조건:</strong> 
            ${keyword ? `"${keyword}" · ` : ''}
            ${REDDIT_COUNTRY_NAMES[country]} · ${REDDIT_CATEGORY_NAMES[category]} · 
            ${REDDIT_SORT_NAMES[sort]} · ${REDDIT_TIME_NAMES[time]}
        </div>
    `;
    
    // 로딩 표시
    resultsDiv.innerHTML = `
        <div class="loading">
            <p>🔍 Reddit 검색 중...</p>
            <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                여러 서브레딧에서 데이터를 수집하고 있습니다. 잠시만 기다려주세요.
            </p>
        </div>
    `;
    
    try {
        let subreddits = [];
        if (category === 'all') {
            subreddits = REDDIT_SUBREDDITS['all'][country] || REDDIT_SUBREDDITS['all']['US'];
        } else {
            subreddits = REDDIT_SUBREDDITS[category] || [];
        }
        
        if (!subreddits || subreddits.length === 0) {
            resultsDiv.innerHTML = '<div class="error">😢 해당 카테고리의 서브레딧을 찾을 수 없습니다.</div>';
            return;
        }
        
        const posts = [];
        const errors = [];
        const targetSubreddits = subreddits.slice(0, 2);  // 2개만 시도 (속도 개선)
        
        for (const sub of targetSubreddits) {
            try {
                let redditUrl;
                
                if (keyword) {
                    redditUrl = `https://www.reddit.com/r/${sub}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=${sort}&t=${time}&limit=25`;
                } else {
                    redditUrl = `https://www.reddit.com/r/${sub}/${sort}.json?t=${time}&limit=25`;
                }
                
                const data = await safeFetch(redditUrl);
                
                if (data && data.data && data.data.children && Array.isArray(data.data.children)) {
                    data.data.children.forEach(post => {
                        if (post && post.data) {
                            const p = post.data;
                            if (!p.stickied && !p.is_promoted && !p.distinguished) {
                                posts.push({
                                    title: p.title || '제목 없음',
                                    score: parseInt(p.ups) || 0,
                                    comments: parseInt(p.num_comments) || 0,
                                    subreddit: p.subreddit || sub,
                                    url: p.permalink ? ('https://reddit.com' + p.permalink) : '#',
                                    author: p.author || 'unknown',
                                    created: parseInt(p.created_utc) || Math.floor(Date.now() / 1000),
                                    ratio: parseFloat(p.upvote_ratio) || 0
                                });
                            }
                        }
                    });
                }
                
                // API 과부하 방지
                await new Promise(resolve => setTimeout(resolve, 800));
                
            } catch (err) {
                errors.push(`r/${sub}: ${err.message}`);
            }
        }
        
        if (posts.length === 0) {
            let errorMessage = '<div class="loading"><p>😢 검색 결과가 없습니다.</p>';
            
            if (errors.length > 0) {
                errorMessage += '<details style="margin-top: 15px; font-size: 0.9em; color: #666;">';
                errorMessage += '<summary style="cursor: pointer; font-weight: 600;">오류 상세 정보 보기</summary>';
                errorMessage += '<ul style="text-align: left; font-size: 0.85em; color: #666; margin-top: 10px;">';
                errors.forEach(err => {
                    errorMessage += `<li>${escapeRedditHtml(err)}</li>`;
                });
                errorMessage += '</ul></details>';
            }
            
            errorMessage += `
                <p style="font-size: 0.9em; color: #888; margin-top: 15px;">💡 해결 방법:</p>
                <ul style="text-align: left; font-size: 0.85em; color: #666; margin: 10px auto; max-width: 400px;">
                    <li>다른 검색어를 시도해보세요</li>
                    <li>카테고리를 변경해보세요</li>
                    <li>정렬 기준이나 기간을 조정해보세요</li>
                    <li>잠시 후 다시 시도해보세요</li>
                </ul>
            </div>`;
            
            resultsDiv.innerHTML = errorMessage;
            return;
        }
        
        posts.sort((a, b) => b.score - a.score);
        displayRedditResults(posts.slice(0, 40));
        
    } catch (error) {
        resultsDiv.innerHTML = `
            <div class="error">
                <p>😢 Reddit 검색에 실패했습니다.</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    CORS 프록시 서버에 일시적인 문제가 있을 수 있습니다.
                </p>
                <p style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                    오류: ${escapeRedditHtml(error.message || '알 수 없는 오류')}
                </p>
                <p style="font-size: 0.85em; color: #888; margin-top: 15px;">
                    💡 <strong>해결 방법:</strong> 1~2분 후 다시 시도하거나, 다른 검색어/카테고리를 선택해주세요.
                </p>
            </div>
        `;
    }
}

// Reddit 결과 표시
function displayRedditResults(posts) {
    const resultsDiv = document.getElementById('reddit-results');
    
    if (!resultsDiv) return;
    
    if (!posts || posts.length === 0) {
        resultsDiv.innerHTML = `
            <div class="loading">
                <p>😢 검색 결과가 없습니다.</p>
                <p style="font-size: 0.9em; color: #888;">다른 검색어나 필터를 시도해보세요.</p>
            </div>
        `;
        return;
    }
    
    let html = '<div class="reddit-cards">';
    
    posts.forEach((post, index) => {
        const timeAgo = getRedditTimeAgo(post.created);
        const ratio = Math.round(post.ratio * 100);
        
        html += `
            <a href="${escapeRedditHtml(post.url)}" target="_blank" class="reddit-card" rel="noopener noreferrer">
                <div class="reddit-rank">#${index + 1}</div>
                <h4>${escapeRedditHtml(post.title)}</h4>
                <div class="reddit-meta">
                    <span class="reddit-subreddit">📂 r/${escapeRedditHtml(post.subreddit)}</span>
                    <span class="reddit-time">🕐 ${timeAgo}</span>
                </div>
                <div class="reddit-stats">
                    <span title="추천수">⬆️ ${formatRedditNumber(post.score)}</span>
                    <span title="댓글수">💬 ${formatRedditNumber(post.comments)}</span>
                    <span title="추천 비율">👍 ${ratio}%</span>
                </div>
            </a>
        `;
    });
    
    html += '</div>';
    resultsDiv.innerHTML = html;
}

// 유틸리티 함수
function formatRedditNumber(num) {
    const n = parseInt(num);
    if (isNaN(n)) return '0';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

function escapeRedditHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

function getRedditTimeAgo(timestamp) {
    const ts = parseInt(timestamp);
    if (isNaN(ts)) return '알 수 없음';
    
    const now = Math.floor(Date.now() / 1000);
    const diff = now - ts;
    
    if (diff < 0) return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    if (diff < 2592000) return Math.floor(diff / 86400) + '일 전';
    return Math.floor(diff / 2592000) + '달 전';
}

if (typeof window !== 'undefined') {
    window.redditSearchReady = true;
}