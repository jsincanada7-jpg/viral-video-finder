// ========================================
// 🎥 YouTube 인기 영상 검색기
// ========================================

// 카테고리 매핑
const CATEGORIES = {
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

// 국가 매핑
const COUNTRIES = {
    'KR': '🇰🇷 한국',
    'US': '🇺🇸 미국',
    'JP': '🇯🇵 일본',
    'GB': '🇬🇧 영국',
    'IN': '🇮🇳 인도',
    'BR': '🇧🇷 브라질',
    'FR': '🇫🇷 프랑스',
    'DE': '🇩🇪 독일'
};

// YouTube 인기 영상 검색
async function searchYouTube() {
    const countrySelect = document.getElementById('country-select');
    const categorySelect = document.getElementById('category-select');
    const sortSelect = document.getElementById('sort-select');
    const resultsDiv = document.getElementById('youtube-results');
    const filterDiv = document.getElementById('current-filter');
    
    // Null 체크
    if (!countrySelect || !categorySelect || !sortSelect || !resultsDiv || !filterDiv) {
        console.error('❌ 필수 요소를 찾을 수 없습니다');
        if (resultsDiv) {
            resultsDiv.innerHTML = '<div class="error">❌ 페이지 요소를 찾을 수 없습니다.</div>';
        }
        return;
    }
    
    // API 키 확인
    if (typeof YOUTUBE_API_KEY === 'undefined' || !YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'YOUR_API_KEY_HERE') {
        resultsDiv.innerHTML = `
            <div class="error">
                <p>😢 YouTube API 키가 설정되지 않았습니다.</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    <strong>해결 방법:</strong>
                </p>
                <ol style="text-align: left; font-size: 0.9em; color: #666; margin: 15px auto; max-width: 500px;">
                    <li><a href="https://console.cloud.google.com" target="_blank" style="color: #667eea;">Google Cloud Console</a>에서 프로젝트 생성</li>
                    <li>"YouTube Data API v3" 활성화</li>
                    <li>"사용자 인증 정보" → "API 키" 생성</li>
                    <li><code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">config.js</code> 파일에 API 키 입력</li>
                </ol>
                <p style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                    💡 자세한 가이드는 README.md 파일을 참고하세요.
                </p>
            </div>
        `;
        console.error('❌ YOUTUBE_API_KEY가 정의되지 않았습니다');
        return;
    }
    
    const country = countrySelect.value;
    const category = categorySelect.value;
    const sort = sortSelect.value;
    
    console.log('🔍 YouTube 검색 시작:', { country, category, sort });
    
    // 필터 정보 표시
    filterDiv.innerHTML = `
        <strong>현재 필터:</strong> 
        ${COUNTRIES[country]} · ${CATEGORIES[category]} · ${getSortName(sort)}
    `;
    
    // 로딩 표시
    resultsDiv.innerHTML = '<div class="loading">🔍 YouTube 영상 검색 중...</div>';
    
    try {
        // YouTube Data API v3 호출
        let videos = [];
        
        // mostPopular 엔드포인트 사용
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?` +
            `part=snippet,statistics,contentDetails` +
            `&chart=mostPopular` +
            `&regionCode=${country}` +
            `${category ? `&videoCategoryId=${category}` : ''}` +
            `&maxResults=100` +
            `&key=${YOUTUBE_API_KEY}`;
        
        console.log('📡 YouTube API 호출 중...');
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            if (response.status === 403) {
                throw new Error('API 키가 유효하지 않거나 할당량이 초과되었습니다. (403 Forbidden)');
            } else if (response.status === 400) {
                throw new Error('잘못된 요청입니다. API 키를 확인해주세요. (400 Bad Request)');
            } else {
                throw new Error(`YouTube API 오류: ${response.status}`);
            }
        }
        
        const data = await response.json();
        
        if (!data.items || data.items.length === 0) {
            resultsDiv.innerHTML = '<div class="loading">😢 검색 결과가 없습니다.</div>';
            return;
        }
        
        console.log(`✅ ${data.items.length}개 영상 수집 완료`);
        
        // 영상 데이터 가공
        videos = data.items.map(item => ({
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
        
        // 정렬
        videos = sortVideos(videos, sort);
        
        // 상위 100개만 표시
        displayVideos(videos.slice(0, 100));
        
    } catch (error) {
        console.error('❌ YouTube 검색 오류:', error);
        resultsDiv.innerHTML = `
            <div class="error">
                <p>😢 YouTube 검색에 실패했습니다.</p>
                <p style="font-size: 0.9em; color: #888; margin-top: 10px;">
                    ${error.message}
                </p>
                <p style="font-size: 0.85em; color: #aaa; margin-top: 10px;">
                    💡 해결 방법:
                </p>
                <ul style="text-align: left; font-size: 0.85em; color: #666; margin: 10px auto; max-width: 400px;">
                    <li>API 키가 올바르게 설정되었는지 확인</li>
                    <li>YouTube Data API v3가 활성화되었는지 확인</li>
                    <li>API 할당량이 남아있는지 확인 (10,000/일)</li>
                    <li><a href="https://console.cloud.google.com" target="_blank" style="color: #667eea;">Google Cloud Console</a>에서 확인</li>
                </ul>
            </div>
        `;
    }
}

// 정렬 기준 적용
function sortVideos(videos, sortBy) {
    const sorted = [...videos];
    
    switch (sortBy) {
        case 'views':
            return sorted.sort((a, b) => b.viewCount - a.viewCount);
        case 'likes':
            return sorted.sort((a, b) => b.likeCount - a.likeCount);
        case 'comments':
            return sorted.sort((a, b) => b.commentCount - a.commentCount);
        case 'recent':
            return sorted.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        case 'popularity':
        default:
            // 인기도 점수 계산 (조회수 + 좋아요*10 + 댓글*5)
            return sorted.sort((a, b) => {
                const scoreA = a.viewCount + (a.likeCount * 10) + (a.commentCount * 5);
                const scoreB = b.viewCount + (b.likeCount * 10) + (b.commentCount * 5);
                return scoreB - scoreA;
            });
    }
}

// 영상 카드 표시
function displayVideos(videos) {
    const resultsDiv = document.getElementById('youtube-results');
    
    if (!resultsDiv) return;
    
    if (!videos || videos.length === 0) {
        resultsDiv.innerHTML = '<div class="loading">😢 검색 결과가 없습니다.</div>';
        return;
    }
    
    let html = '';
    
    videos.forEach((video, index) => {
        const categoryBadge = getCategoryBadge(video.categoryId);
        
        html += `
            <div class="video-card">
                <div class="video-rank">#${index + 1}</div>
                <img src="${video.thumbnail}" 
                     alt="${escapeHtml(video.title)}" 
                     onclick="window.open('https://www.youtube.com/watch?v=${video.id}', '_blank')"
                     style="cursor: pointer;">
                <div class="video-info">
                    ${categoryBadge}
                    <div class="video-title" 
                         onclick="window.open('https://www.youtube.com/watch?v=${video.id}', '_blank')"
                         style="cursor: pointer;">
                        ${escapeHtml(video.title)}
                    </div>
                    <div class="video-channel">${escapeHtml(video.channelTitle)}</div>
                    <div class="video-stats">
                        <span title="조회수">👁️ ${formatNumber(video.viewCount)}</span>
                        <span title="좋아요">👍 ${formatNumber(video.likeCount)}</span>
                        <span title="댓글">💬 ${formatNumber(video.commentCount)}</span>
                    </div>
                    
                    <!-- 대본 다운로드 버튼 (외부 서비스 연동) -->
                    <div style="display: flex; gap: 8px; margin-top: 12px;">
                        <a href="https://www.youtube.com/watch?v=${video.id}" 
                        target="_blank" 
                        class="transcript-btn transcript-btn-secondary"
                        style="flex: 1; text-align: center; text-decoration: none;"
                        title="YouTube에서 자막 확인">
                            📺 자막 보기
                        </a>
                        <a href="https://downsub.com/?url=https://www.youtube.com/watch?v=${video.id}" 
                        target="_blank" 
                        class="transcript-btn"
                        style="flex: 1; text-align: center; text-decoration: none;"
                        title="외부 서비스에서 자막 다운로드">
                            📄 자막 다운로드
                        </a>
                    </div>
                </div>
            </div>
        `;
    });
    
    resultsDiv.innerHTML = html;
}

// 카테고리 뱃지 생성
function getCategoryBadge(categoryId) {
    const categoryName = CATEGORIES[categoryId] || '기타';
    return `<span class="video-category">${categoryName}</span>`;
}

// 정렬 이름 가져오기
function getSortName(sort) {
    const sortNames = {
        'popularity': '인기순',
        'views': '조회수순',
        'likes': '좋아요순',
        'comments': '댓글순',
        'recent': '최신순'
    };
    return sortNames[sort] || '인기순';
}

// 숫자 포맷팅
function formatNumber(num) {
    const n = parseInt(num);
    if (isNaN(n)) return '0';
    if (n >= 100000000) return (n / 100000000).toFixed(1) + '억';
    if (n >= 10000) return (n / 10000).toFixed(1) + '만';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
}

// HTML 이스케이프
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = String(text);
    return div.innerHTML;
}

// 필터 초기화
function resetFilters() {
    const countrySelect = document.getElementById('country-select');
    const categorySelect = document.getElementById('category-select');
    const sortSelect = document.getElementById('sort-select');
    const resultsDiv = document.getElementById('youtube-results');
    const filterDiv = document.getElementById('current-filter');
    
    if (countrySelect) countrySelect.value = 'KR';
    if (categorySelect) categorySelect.value = '';
    if (sortSelect) sortSelect.value = 'popularity';
    
    if (filterDiv) filterDiv.innerHTML = '';
    if (resultsDiv) resultsDiv.innerHTML = '<div class="loading">🔍 국가와 카테고리를 선택한 후 검색 버튼을 눌러주세요.</div>';
    
    console.log('🔄 필터 초기화 완료');
}

// ========================================
// 📄 YouTube 대본 다운로드 기능 (개선 버전)
// ========================================

// YouTube 자막 가져오기
async function getVideoTranscript(videoId, videoTitle) {
    const transcriptBtn = document.getElementById(`transcript-btn-${videoId}`);
    
    if (!transcriptBtn) return;
    
    // 로딩 상태
    const originalText = transcriptBtn.innerHTML;
    transcriptBtn.innerHTML = '⏳ 로딩 중...';
    transcriptBtn.disabled = true;
    
    try {
        console.log('📄 자막 데이터 가져오는 중...', videoId);
        
        // 여러 CORS 프록시 시도
        const corsProxies = [
            'https://corsproxy.io/?',
            'https://api.allorigins.win/raw?url=',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        
        let html = null;
        let usedProxy = null;
        
        // 각 프록시 순차 시도
        for (const proxy of corsProxies) {
            try {
                const apiUrl = `https://www.youtube.com/watch?v=${videoId}`;
                let proxyUrl;
                
                if (proxy.includes('allorigins')) {
                    proxyUrl = proxy + encodeURIComponent(apiUrl);
                } else {
                    proxyUrl = proxy + apiUrl;
                }
                
                console.log('🔄 프록시 시도:', proxy.split('?')[0]);
                
                const response = await fetch(proxyUrl, { 
                    method: 'GET',
                    signal: AbortSignal.timeout(10000)  // 10초 타임아웃
                });
                
                if (response.ok) {
                    html = await response.text();
                    usedProxy = proxy;
                    console.log('✅ 프록시 성공:', proxy.split('?')[0]);
                    break;
                }
            } catch (err) {
                console.warn('⚠️ 프록시 실패:', proxy.split('?')[0], err.message);
                continue;
            }
        }
        
        if (!html) {
            throw new Error('모든 CORS 프록시 서버에 접근할 수 없습니다');
        }
        
        // 자막 URL 추출
        const captionMatch = html.match(/"captionTracks":\s*\[(.*?)\]/);
        
        if (!captionMatch) {
            alert('❌ 이 영상에는 자막이 없습니다.');
            transcriptBtn.innerHTML = '📄 자막 없음';
            transcriptBtn.disabled = true;
            return;
        }
        
        let captionTracks;
        try {
            captionTracks = JSON.parse('[' + captionMatch[1] + ']');
        } catch (parseError) {
            throw new Error('자막 정보를 파싱할 수 없습니다');
        }
        
        console.log('✅ 사용 가능한 자막:', captionTracks.length + '개');
        
        // 한국어 자막 우선, 없으면 영어, 없으면 첫 번째 자막
        let captionUrl = null;
        let language = 'unknown';
        
        for (const track of captionTracks) {
            if (track.languageCode === 'ko' || track.languageCode === 'ko-KR') {
                captionUrl = track.baseUrl;
                language = 'Korean';
                break;
            }
        }
        
        if (!captionUrl) {
            for (const track of captionTracks) {
                if (track.languageCode === 'en' || track.languageCode === 'en-US') {
                    captionUrl = track.baseUrl;
                    language = 'English';
                    break;
                }
            }
        }
        
        if (!captionUrl && captionTracks.length > 0) {
            captionUrl = captionTracks[0].baseUrl;
            language = captionTracks[0].languageCode || 'unknown';
        }
        
        if (!captionUrl) {
            throw new Error('자막 URL을 찾을 수 없습니다');
        }
        
        console.log('🌐 자막 언어:', language);
        
        // 자막 XML 가져오기 (같은 프록시 사용)
        let captionXml;
        try {
            let proxyCaptionUrl;
            if (usedProxy.includes('allorigins')) {
                proxyCaptionUrl = usedProxy + encodeURIComponent(captionUrl);
            } else {
                proxyCaptionUrl = usedProxy + captionUrl;
            }
            
            const captionResponse = await fetch(proxyCaptionUrl, {
                signal: AbortSignal.timeout(10000)
            });
            
            if (!captionResponse.ok) {
                throw new Error('자막 데이터를 가져올 수 없습니다');
            }
            
            captionXml = await captionResponse.text();
        } catch (fetchError) {
            throw new Error('자막 다운로드 실패: ' + fetchError.message);
        }
        
        // XML 파싱하여 텍스트 추출
        let textElements;
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(captionXml, 'text/xml');
            
            // 파싱 오류 확인
            const parseError = xmlDoc.querySelector('parsererror');
            if (parseError) {
                throw new Error('XML 파싱 오류: ' + parseError.textContent);
            }
            
            textElements = xmlDoc.getElementsByTagName('text');
            
            if (textElements.length === 0) {
                // 대체 시도: transcript 태그
                textElements = xmlDoc.getElementsByTagName('transcript');
                if (textElements.length === 0) {
                    throw new Error('자막 텍스트를 찾을 수 없습니다 (빈 XML)');
                }
            }
        } catch (xmlError) {
            console.error('XML 파싱 오류:', xmlError);
            throw new Error('자막 XML을 파싱할 수 없습니다: ' + xmlError.message);
        }
        
        console.log('✅ 자막 텍스트:', textElements.length + '개 라인');
        
        // 자막 텍스트 조합
        let transcript = `YouTube 영상 대본\n`;
        transcript += `제목: ${videoTitle}\n`;
        transcript += `영상 ID: ${videoId}\n`;
        transcript += `자막 언어: ${language}\n`;
        transcript += `다운로드 시간: ${new Date().toLocaleString('ko-KR')}\n`;
        transcript += `=`.repeat(60) + `\n\n`;
        
        for (let i = 0; i < textElements.length; i++) {
            let text = textElements[i].textContent
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/<[^>]*>/g, '')  // HTML 태그 제거
                .replace(/\s+/g, ' ')  // 연속 공백 제거
                .trim();
            
            if (text) {
                transcript += text + '\n';
            }
        }
        
        if (transcript.split('\n').length <= 10) {
            throw new Error('자막 내용이 너무 적습니다 (추출 실패 가능)');
        }
        
        // 텍스트 파일로 다운로드
        downloadTranscript(transcript, videoTitle, videoId);
        
        // 버튼 복구
        transcriptBtn.innerHTML = originalText;
        transcriptBtn.disabled = false;
        
    } catch (error) {
        console.error('❌ 자막 다운로드 오류:', error);
        
        let errorMessage = '❌ 자막 다운로드에 실패했습니다.\n\n';
        errorMessage += '오류: ' + error.message + '\n\n';
        errorMessage += '💡 가능한 원인:\n';
        errorMessage += '- 영상에 자막이 없을 수 있습니다\n';
        errorMessage += '- CORS 프록시 서버가 일시적으로 불안정합니다\n';
        errorMessage += '- 자막이 비공개 설정되어 있습니다\n\n';
        errorMessage += '잠시 후 다시 시도하거나, 다른 영상을 선택해주세요.';
        
        alert(errorMessage);
        
        transcriptBtn.innerHTML = originalText;
        transcriptBtn.disabled = false;
    }
}

// 텍스트 파일 다운로드
function downloadTranscript(content, videoTitle, videoId) {
    // 파일명 정리 (특수문자 제거)
    const safeTitle = videoTitle
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')  // 파일명 불가 문자 제거
        .replace(/\s+/g, '_')  // 공백을 언더스코어로
        .substring(0, 50);  // 최대 50자
    
    const filename = `${safeTitle}_${videoId}_transcript.txt`;
    
    // Blob 생성
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    
    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // 다운로드 트리거
    document.body.appendChild(link);
    link.click();
    
    // 정리
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('✅ 대본 다운로드 완료:', filename);
    alert('✅ 대본이 다운로드되었습니다!\n\n파일명: ' + filename);
}


// ========================================
// 페이지 로드 완료
// ========================================

// 초기 상태 메시지 표시
document.addEventListener('DOMContentLoaded', () => {
    const resultsDiv = document.getElementById('youtube-results');
    if (resultsDiv && !resultsDiv.innerHTML.trim()) {
        resultsDiv.innerHTML = '<div class="loading">🔍 국가와 카테고리를 선택한 후 검색 버튼을 눌러주세요.</div>';
    }
    console.log('🚀 YouTube 검색기 로드 완료');
});
