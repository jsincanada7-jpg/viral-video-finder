// 📈 Google Trends 기능

const TRENDS_COUNTRY_NAMES = {
    'KR': '한국',
    'US': '미국',
    'JP': '일본',
    'GB': '영국',
    'IN': '인도',
    'BR': '브라질',
    'FR': '프랑스',
    'DE': '독일'
};

// 메인 트렌드 검색 함수
function searchTrends() {
    const countrySelect = document.getElementById('trends-country-select');
    const resultsDiv = document.getElementById('trends-results');
    
    // ⚠️ null 체크
    if (!countrySelect) {
        console.error('❌ trends-country-select 요소를 찾을 수 없습니다!');
        return;
    }
    
    if (!resultsDiv) {
        console.error('❌ trends-results 요소를 찾을 수 없습니다!');
        return;
    }
    
    const country = countrySelect.value;
    const countryName = TRENDS_COUNTRY_NAMES[country] || country;
    
    console.log('📈 트렌드 검색:', countryName);
    
    // Google Trends는 공식 API가 없으므로 외부 링크 제공
    displayTrendsLinks(country, countryName, resultsDiv);
}

// 트렌드 링크 표시
function displayTrendsLinks(country, countryName, resultsDiv) {
    let html = `
        <div class="trend-container">
            <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 10px; margin-bottom: 30px;">
                <h3 style="margin: 0; color: #667eea;">
                    📈 ${countryName} 트렌드
                </h3>
                <p style="margin: 10px 0 0; color: #888; font-size: 0.95em;">
                    Google Trends와 YouTube 트렌딩을 확인하세요!
                </p>
            </div>
            
            <div class="trend-section">
                <h3>🌐 Google Trends</h3>
                <div class="trend-cards">
                    <a href="https://trends.google.com/trends/trendingsearches/daily?geo=${country}" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>📊 일일 트렌드</h4>
                        <p>오늘의 인기 검색어를 확인하세요</p>
                    </a>
                    
                    <a href="https://trends.google.com/trends/trendingsearches/realtime?geo=${country}" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>⚡ 실시간 트렌드</h4>
                        <p>지금 이 순간 인기 급상승 키워드</p>
                    </a>
                    
                    <a href="https://trends.google.com/trends/explore?geo=${country}" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>🔍 트렌드 탐색기</h4>
                        <p>키워드 분석 및 비교 도구</p>
                    </a>
                </div>
            </div>
            
            <div class="trend-section">
                <h3>🎥 YouTube 트렌딩</h3>
                <div class="trend-cards">
                    <a href="https://www.youtube.com/feed/trending?gl=${country}" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>🔥 인기 급상승 동영상</h4>
                        <p>${countryName}에서 지금 인기 있는 영상</p>
                    </a>
                    
                    <a href="https://www.youtube.com/feed/trending?bp=4gINGgt5dG1hX2NoYXJ0cw%3D%3D&gl=${country}" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>🎵 인기 음악</h4>
                        <p>${countryName}에서 인기 있는 음악 영상</p>
                    </a>
                    
                    <a href="https://www.youtube.com/feed/trending?bp=4gIcGhpnYW1pbmdfY29ycHVzX21vc3RfcG9wdWxhcg%3D%3D&gl=${country}" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>🎮 인기 게임</h4>
                        <p>${countryName}에서 인기 있는 게임 영상</p>
                    </a>
                </div>
            </div>
    `;
    
    // 한국 전용: 네이버 실시간 검색어
    if (country === 'KR') {
        html += `
            <div class="trend-section">
                <h3>🇰🇷 네이버 실시간 검색어</h3>
                <div class="trend-cards">
                    <a href="https://datalab.naver.com/keyword/realtimeList.naver" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>📊 실시간 검색어</h4>
                        <p>네이버 데이터랩 실시간 급상승 검색어</p>
                    </a>
                    
                    <a href="https://datalab.naver.com/" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>📈 데이터랩</h4>
                        <p>네이버 검색 트렌드 분석</p>
                    </a>
                </div>
            </div>
        `;
    }
    
    // X (Twitter) 트렌드
    const twitterLocations = {
        'KR': '23424868',
        'US': '23424977',
        'JP': '23424856',
        'GB': '23424975',
        'IN': '23424848',
        'BR': '23424768',
        'FR': '23424819',
        'DE': '23424829'
    };
    
    if (twitterLocations[country]) {
        html += `
            <div class="trend-section">
                <h3>🐦 X (Twitter) 트렌드</h3>
                <div class="trend-cards">
                    <a href="https://twitter.com/explore/tabs/trending" 
                       target="_blank" 
                       class="link-card"
                       rel="noopener noreferrer">
                        <h4>🔥 트렌딩 토픽</h4>
                        <p>${countryName}에서 지금 이야기되는 주제</p>
                    </a>
                </div>
            </div>
        `;
    }
    
    html += `</div>`; // trend-container 닫기
    
    resultsDiv.innerHTML = html;
    
    console.log('✅ 트렌드 링크 표시 완료');
}
