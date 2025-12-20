// 트렌드 표시 (Google Trends, YouTube Trends, Naver만)

function showTrends() {
    const country = document.getElementById('trends-country-select').value;
    const resultsDiv = document.getElementById('trends-results');
    
    console.log('📈 트렌드 보기:', country);
    
    const countryNames = {
        'KR': '🇰🇷 한국',
        'US': '🇺🇸 미국',
        'JP': '🇯🇵 일본',
        'GB': '🇬🇧 영국',
        'IN': '🇮🇳 인도',
        'BR': '🇧🇷 브라질',
        'FR': '🇫🇷 프랑스',
        'DE': '🇩🇪 독일'
    };
    
    let html = `
        <div class="trend-section">
            <h3>📊 ${countryNames[country]} 트렌드</h3>
            
            <!-- Google Trends -->
            <div class="trend-links">
                <h4>🔍 Google Trends</h4>
                <a href="https://trends.google.com/trends/trendingsearches/daily?geo=${country}" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">🌐</span>
                    <div>
                        <strong>일일 트렌드 검색어</strong>
                        <p>오늘 가장 많이 검색된 주제</p>
                    </div>
                </a>
                <a href="https://trends.google.com/trends/trendingsearches/realtime?geo=${country}" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">⚡</span>
                    <div>
                        <strong>실시간 트렌드</strong>
                        <p>지금 급상승 중인 검색어</p>
                    </div>
                </a>
                <a href="https://trends.google.com/trends/explore?geo=${country}" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">🔬</span>
                    <div>
                        <strong>트렌드 탐색</strong>
                        <p>키워드 검색 트렌드 분석</p>
                    </div>
                </a>
            </div>
            
            <!-- YouTube Trends -->
            <div class="trend-links">
                <h4>🎥 YouTube Trending</h4>
                <a href="https://www.youtube.com/feed/trending?gl=${country}" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">🔥</span>
                    <div>
                        <strong>인기 급상승 동영상</strong>
                        <p>YouTube 트렌딩 영상</p>
                    </div>
                </a>
                <a href="https://www.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%3D%3D&gl=${country}" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">🎵</span>
                    <div>
                        <strong>음악 트렌드</strong>
                        <p>인기 음악 영상</p>
                    </div>
                </a>
                <a href="https://www.youtube.com/feed/trending?bp=4gIcGhpnYW1pbmdfY29ycHVzX21vc3RfcG9wdWxhcg%3D%3D&gl=${country}" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">🎮</span>
                    <div>
                        <strong>게임 트렌드</strong>
                        <p>인기 게임 영상</p>
                    </div>
                </a>
            </div>
    `;
    
    // Naver (한국만)
    if (country === 'KR') {
        html += `
            <div class="trend-links">
                <h4>📊 Naver 실시간 검색어 & DataLab</h4>
                <a href="https://datalab.naver.com/keyword/realtimeList.naver" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">🔥</span>
                    <div>
                        <strong>실시간 검색어</strong>
                        <p>지금 가장 많이 검색되는 키워드</p>
                    </div>
                </a>
                <a href="https://datalab.naver.com/" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">📈</span>
                    <div>
                        <strong>Naver DataLab</strong>
                        <p>검색어 트렌드 분석 도구</p>
                    </div>
                </a>
                <a href="https://datalab.naver.com/keyword/trendResult.naver" 
                   target="_blank" class="trend-link-card">
                    <span class="emoji">📊</span>
                    <div>
                        <strong>트렌드 분석</strong>
                        <p>키워드별 검색 추이</p>
                    </div>
                </a>
            </div>
        `;
    }
    
    html += `</div>`;
    
    resultsDiv.innerHTML = html;
}
