// 📈 구글 트렌드 기능 (실용적 버전)

const TREND_COUNTRY_NAMES = {
    'KR': '한국',
    'US': '미국',
    'JP': '일본',
    'GB': '영국',
    'IN': '인도',
    'BR': '브라질',
    'FR': '프랑스',
    'DE': '독일'
};

// 일일 트렌드 검색
function searchTrends() {
    const country = document.getElementById('trend-country').value;
    const resultsDiv = document.getElementById('trends-results');
    const infoDiv = document.getElementById('trends-info');
    
    const countryName = TREND_COUNTRY_NAMES[country] || country;
    
    infoDiv.innerHTML = `
        <span>🌍 <strong>${countryName}</strong></span>
        <span style="margin: 0 15px;">|</span>
        <span>📅 <strong>일일 인기 검색어</strong></span>
    `;
    
    console.log('📈 트렌드 탭 활성화:', countryName);
    
    resultsDiv.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <!-- 메인 카드 -->
            <div class="trend-card" style="text-align: center; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h2 style="font-size: 2em; margin-bottom: 15px;">📊 ${countryName} 트렌드</h2>
                <p style="font-size: 1.1em; margin: 20px 0; opacity: 0.95;">
                    실시간으로 급상승하는 검색어와<br>
                    인기 주제를 확인하세요!
                </p>
            </div>

            <!-- 옵션 카드들 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <!-- Google Trends 일일 -->
                <div class="trend-card" style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 3em; margin-bottom: 10px;">📈</div>
                        <h3 style="color: #667eea; margin-bottom: 10px;">일일 인기 검색어</h3>
                        <p style="color: #666; font-size: 0.95em;">
                            오늘 ${countryName}에서<br>
                            가장 많이 검색된 키워드
                        </p>
                    </div>
                    <a href="https://trends.google.com/trends/trendingsearches/daily?geo=${country}" 
                       target="_blank" 
                       class="watch-btn" 
                       style="display: block; text-decoration: none; margin-top: 20px;">
                        📊 일일 트렌드 보기
                    </a>
                </div>

                <!-- Google Trends 실시간 -->
                <div class="trend-card" style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 3em; margin-bottom: 10px;">⚡</div>
                        <h3 style="color: #ff6b6b; margin-bottom: 10px;">실시간 급상승</h3>
                        <p style="color: #666; font-size: 0.95em;">
                            지금 이 순간<br>
                            급상승하는 검색어
                        </p>
                    </div>
                    <a href="https://trends.google.com/trends/trendingsearches/realtime?geo=${country}" 
                       target="_blank" 
                       class="watch-btn" 
                       style="display: block; text-decoration: none; margin-top: 20px; background: linear-gradient(135deg, #ff6b6b, #ee5a52);">
                        ⚡ 실시간 트렌드 보기
                    </a>
                </div>

                <!-- Google Trends 메인 -->
                <div class="trend-card" style="padding: 30px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="font-size: 3em; margin-bottom: 10px;">🔍</div>
                        <h3 style="color: #4285f4; margin-bottom: 10px;">트렌드 탐색</h3>
                        <p style="color: #666; font-size: 0.95em;">
                            키워드 비교 및<br>
                            상세 분석 도구
                        </p>
                    </div>
                    <a href="https://trends.google.com/trends/?geo=${country}" 
                       target="_blank" 
                       class="watch-btn" 
                       style="display: block; text-decoration: none; margin-top: 20px; background: #4285f4;">
                        🌐 Google Trends 열기
                    </a>
                </div>
            </div>

            <!-- YouTube 인기 영상 링크 -->
            <div class="trend-card" style="padding: 30px; background: #fff3cd; border-left: 4px solid #ffc107;">
                <div style="display: flex; align-items: center; gap: 20px;">
                    <div style="font-size: 3em;">💡</div>
                    <div style="flex: 1;">
                        <h3 style="color: #856404; margin-bottom: 10px;">추천 팁</h3>
                        <p style="color: #856404; margin-bottom: 15px;">
                            <strong>유튜브 인기 영상 탭</strong>에서 "오늘" 또는 "이번 주" 기간을 선택하면<br>
                            ${countryName}의 바이럴 영상을 바로 확인할 수 있어요!
                        </p>
                        <button onclick="showTab('youtube'); document.getElementById('time-range-select').value='today'; searchYouTube();" 
                                style="padding: 12px 20px; background: #ffc107; color: #856404; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                            📺 오늘의 인기 영상 보기
                        </button>
                    </div>
                </div>
            </div>

            <!-- 대체 트렌드 사이트 -->
            <div class="trend-card" style="padding: 30px;">
                <h3 style="color: #333; margin-bottom: 20px; text-align: center;">🌐 다른 트렌드 사이트</h3>
                <div style="display: grid; gap: 15px;">
                    <a href="https://www.youtube.com/feed/trending?gl=${country}" 
                       target="_blank" 
                       style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; text-decoration: none; transition: all 0.3s;"
                       onmouseover="this.style.background='#e9ecef'"
                       onmouseout="this.style.background='#f8f9fa'">
                        <span style="font-size: 2em;">📺</span>
                        <div>
                            <div style="font-weight: 600; color: #ff0000; margin-bottom: 5px;">YouTube 인기</div>
                            <div style="font-size: 0.9em; color: #666;">YouTube에서 인기 있는 영상</div>
                        </div>
                    </a>

                    <a href="https://twitter.com/explore/tabs/trending" 
                       target="_blank" 
                       style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; text-decoration: none; transition: all 0.3s;"
                       onmouseover="this.style.background='#e9ecef'"
                       onmouseout="this.style.background='#f8f9fa'">
                        <span style="font-size: 2em;">𝕏</span>
                        <div>
                            <div style="font-weight: 600; color: #1da1f2; margin-bottom: 5px;">X (Twitter) 트렌드</div>
                            <div style="font-size: 0.9em; color: #666;">실시간 트렌딩 토픽</div>
                        </div>
                    </a>

                    ${country === 'KR' ? `
                    <a href="https://datalab.naver.com/keyword/realtimeList.naver" 
                       target="_blank" 
                       style="display: flex; align-items: center; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 10px; text-decoration: none; transition: all 0.3s;"
                       onmouseover="this.style.background='#e9ecef'"
                       onmouseout="this.style.background='#f8f9fa'">
                        <span style="font-size: 2em;">🟢</span>
                        <div>
                            <div style="font-weight: 600; color: #03c75a; margin-bottom: 5px;">네이버 실검</div>
                            <div style="font-size: 0.9em; color: #666;">네이버 실시간 검색어</div>
                        </div>
                    </a>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// 실시간 트렌드 (searchTrends와 동일한 UI 표시)
function searchRealtime() {
    const country = document.getElementById('trend-country').value;
    const resultsDiv = document.getElementById('trends-results');
    const infoDiv = document.getElementById('trends-info');
    
    const countryName = TREND_COUNTRY_NAMES[country] || country;
    
    infoDiv.innerHTML = `
        <span>🌍 <strong>${countryName}</strong></span>
        <span style="margin: 0 15px;">|</span>
        <span>⚡ <strong>실시간 인기 검색어</strong></span>
    `;
    
    console.log('⚡ 실시간 트렌드:', countryName);
    
    resultsDiv.innerHTML = `
        <div style="display: grid; gap: 20px;">
            <!-- 메인 카드 -->
            <div class="trend-card" style="text-align: center; padding: 40px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white;">
                <h2 style="font-size: 2em; margin-bottom: 15px;">⚡ ${countryName} 실시간 트렌드</h2>
                <p style="font-size: 1.1em; margin: 20px 0; opacity: 0.95;">
                    지금 이 순간 가장 뜨거운<br>
                    검색어를 확인하세요!
                </p>
                <a href="https://trends.google.com/trends/trendingsearches/realtime?geo=${country}" 
                   target="_blank" 
                   class="watch-btn" 
                   style="display: inline-block; text-decoration: none; margin-top: 20px; background: white; color: #ff6b6b; font-size: 1.2em; padding: 15px 30px;">
                    🔥 실시간 트렌드 보기
                </a>
            </div>

            <!-- 빠른 링크 그리드 -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px;">
                <a href="https://trends.google.com/trends/trendingsearches/realtime?geo=${country}" 
                   target="_blank" 
                   class="trend-card"
                   style="padding: 25px; text-align: center; text-decoration: none; transition: all 0.3s;"
                   onmouseover="this.style.transform='translateY(-5px)'"
                   onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size: 2.5em; margin-bottom: 10px;">⚡</div>
                    <div style="font-weight: 600; color: #ff6b6b; margin-bottom: 5px;">Google 실시간</div>
                    <div style="font-size: 0.9em; color: #666;">급상승 검색어</div>
                </a>

                <a href="https://www.youtube.com/feed/trending?gl=${country}" 
                   target="_blank" 
                   class="trend-card"
                   style="padding: 25px; text-align: center; text-decoration: none; transition: all 0.3s;"
                   onmouseover="this.style.transform='translateY(-5px)'"
                   onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size: 2.5em; margin-bottom: 10px;">📺</div>
                    <div style="font-weight: 600; color: #ff0000; margin-bottom: 5px;">YouTube 인기</div>
                    <div style="font-size: 0.9em; color: #666;">인기 급상승 영상</div>
                </a>

                <a href="https://twitter.com/explore/tabs/trending" 
                   target="_blank" 
                   class="trend-card"
                   style="padding: 25px; text-align: center; text-decoration: none; transition: all 0.3s;"
                   onmouseover="this.style.transform='translateY(-5px)'"
                   onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size: 2.5em; margin-bottom: 10px;">𝕏</div>
                    <div style="font-weight: 600; color: #1da1f2; margin-bottom: 5px;">X 트렌딩</div>
                    <div style="font-size: 0.9em; color: #666;">실시간 화제</div>
                </a>

                ${country === 'KR' ? `
                <a href="https://datalab.naver.com/keyword/realtimeList.naver" 
                   target="_blank" 
                   class="trend-card"
                   style="padding: 25px; text-align: center; text-decoration: none; transition: all 0.3s;"
                   onmouseover="this.style.transform='translateY(-5px)'"
                   onmouseout="this.style.transform='translateY(0)'">
                    <div style="font-size: 2.5em; margin-bottom: 10px;">🟢</div>
                    <div style="font-weight: 600; color: #03c75a; margin-bottom: 5px;">네이버 실검</div>
                    <div style="font-size: 0.9em; color: #666;">실시간 검색어</div>
                </a>
                ` : ''}
            </div>

            <!-- 유튜브 탭 연결 -->
            <div class="trend-card" style="padding: 30px; background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1)); border-left: 4px solid #667eea;">
                <h3 style="color: #667eea; margin-bottom: 15px;">💡 이 사이트에서 바로 확인하기</h3>
                <p style="color: #666; margin-bottom: 20px;">
                    유튜브 인기 영상 탭에서 실시간 바이럴 영상을 확인할 수 있어요!
                </p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button onclick="showTab('youtube'); document.getElementById('time-range-select').value='today'; searchYouTube();" 
                            style="padding: 12px 20px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        🔥 오늘의 인기 영상
                    </button>
                    <button onclick="showTab('youtube'); document.getElementById('time-range-select').value='week'; searchYouTube();" 
                            style="padding: 12px 20px; background: #764ba2; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        📅 이번 주 인기 영상
                    </button>
                </div>
            </div>
        </div>
    `;
}
