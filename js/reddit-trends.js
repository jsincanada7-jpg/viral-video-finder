// 🔥 트렌드 데이터 수집 (Reddit 대신 대체 소스 사용)

// Reddit은 외부 링크로만 제공하고, 실제 데이터는 다른 소스 사용
function displayRedditSection(country, countryName, category, sortBy, timeRange) {
    const categoryNames = {
        'all': '전체',
        'news': '뉴스/시사',
        'tech': '기술/IT',
        'gaming': '게임',
        'music': '음악',
        'movies': '영화/TV',
        'sports': '스포츠',
        'science': '과학',
        'business': '비즈니스'
    };
    
    const categoryName = categoryNames[category] || '전체';
    
    // 카테고리별 Reddit URL 매핑
    const categorySubreddits = {
        'all': 'popular',
        'news': 'worldnews+news',
        'tech': 'technology+programming',
        'gaming': 'gaming+Games',
        'music': 'Music+hiphopheads',
        'movies': 'movies+television',
        'sports': 'sports+nba+soccer',
        'science': 'science+space',
        'business': 'business+stocks'
    };
    
    const subreddit = categorySubreddits[category] || 'popular';
    const sortParam = sortBy === 'top' ? `top/?t=${timeRange}` : sortBy;
    
    let html = `
        <div class="trend-section">
            <h3>🔥 Reddit 커뮤니티 트렌드</h3>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 0.95em;">
                    <strong>선택:</strong> ${countryName} · ${categoryName}
                </p>
                <p style="margin: 0; color: #888; font-size: 0.85em;">
                    💡 Reddit은 브라우저 보안 정책으로 직접 데이터를 가져올 수 없습니다.<br>
                    아래 링크를 클릭하여 Reddit에서 직접 확인하세요!
                </p>
            </div>
            
            <div class="trend-cards">
                <a href="https://www.reddit.com/r/${subreddit}/${sortParam}" 
                   target="_blank" 
                   class="link-card"
                   rel="noopener noreferrer"
                   style="background: linear-gradient(135deg, #FF4500 0%, #FF6A33 100%);">
                    <h4>🔥 ${categoryName} 인기 게시물</h4>
                    <p>Reddit에서 가장 인기있는 ${categoryName} 토픽을 확인하세요</p>
                </a>
                
                <a href="https://www.reddit.com/r/${subreddit}/rising" 
                   target="_blank" 
                   class="link-card"
                   rel="noopener noreferrer"
                   style="background: linear-gradient(135deg, #FF4500 0%, #FF6A33 100%);">
                    <h4>📈 급상승 게시물</h4>
                    <p>지금 가장 빠르게 주목받는 토픽</p>
                </a>
                
                <a href="https://www.reddit.com/r/${subreddit}/new" 
                   target="_blank" 
                   class="link-card"
                   rel="noopener noreferrer"
                   style="background: linear-gradient(135deg, #FF4500 0%, #FF6A33 100%);">
                    <h4>🆕 최신 게시물</h4>
                    <p>방금 올라온 따끈따끈한 새 게시물</p>
                </a>
            </div>
        </div>
    `;
    
    return html;
}

// Reddit 대신 Hacker News 데이터 가져오기 (실제 작동)
async function fetchHackerNewsTrends(category) {
    console.log('📡 Hacker News 데이터 가져오기:', category);
    
    try {
        // Hacker News API (CORS 지원)
        const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = await response.json();
        
        // 상위 20개 스토리 가져오기
        const topStoryIds = storyIds.slice(0, 20);
        const stories = [];
        
        for (const id of topStoryIds) {
            try {
                const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
                const story = await storyResponse.json();
                
                if (story && story.title) {
                    stories.push({
                        title: story.title,
                        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                        score: story.score || 0,
                        comments: story.descendants || 0,
                        time: story.time,
                        by: story.by
                    });
                }
                
                // 처음 15개만
                if (stories.length >= 15) break;
                
            } catch (error) {
                console.warn('스토리 로드 실패:', id);
            }
        }
        
        console.log(`✅ Hacker News: ${stories.length}개 스토리 수집`);
        return stories;
        
    } catch (error) {
        console.error('❌ Hacker News API 오류:', error);
        return [];
    }
}

// Hacker News 트렌드 표시
function displayHackerNewsTrends(stories) {
    if (!stories || stories.length === 0) {
        return '';
    }
    
    let html = `
        <div class="trend-section">
            <h3>💻 Hacker News 기술 트렌드</h3>
            <div style="padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0; color: #666; font-size: 0.95em;">
                    실시간으로 가장 많이 논의되는 기술 뉴스와 트렌드
                </p>
            </div>
            <div class="reddit-cards">
    `;
    
    stories.forEach((story, index) => {
        const timeAgo = getTimeAgoFromTimestamp(story.time);
        const domain = story.url ? new URL(story.url).hostname.replace('www.', '') : 'news.ycombinator.com';
        
        html += `
            <a href="${story.url}" 
               target="_blank" 
               class="reddit-card"
               rel="noopener noreferrer">
                <div class="reddit-rank" style="background: linear-gradient(135deg, #FF6600 0%, #FF8533 100%);">#${index + 1}</div>
                <h4>${escapeHtmlReddit(story.title)}</h4>
                <div class="reddit-meta">
                    <span class="reddit-subreddit" style="color: #FF6600;">🌐 ${domain}</span>
                    <span class="reddit-time">🕐 ${timeAgo}</span>
                </div>
                <div class="reddit-stats">
                    <span title="점수">⬆️ ${story.score}</span>
                    <span title="댓글">💬 ${story.comments}</span>
                    <span title="작성자">👤 ${story.by}</span>
                </div>
            </a>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

// 유틸리티 함수
function escapeHtmlReddit(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getTimeAgoFromTimestamp(unixTimestamp) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - unixTimestamp;
    
    if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return minutes + '분 전';
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return hours + '시간 전';
    } else {
        const days = Math.floor(diff / 86400);
        return days + '일 전';
    }
}
