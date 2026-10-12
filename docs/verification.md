# 최종 검증 · 2026-10-12

환경: macOS, Node.js 26.0.0, Chrome, React 19, Vite 6.4.4, Vitest 5.0.3, Playwright.

- `npm test`: 9/9 통과.
- `npm run test:e2e`: 10/10 통과 (24.8초).
- `npm run build`: TypeScript 검사 및 정적 빌드 성공.
- `npm audit --audit-level=moderate`: 알려진 취약점 0개.
- 로컬 미리보기 HTTP 200 확인.

## 확인한 사용자 경로

무료 탑승권 발급, 두 비용 서비스를 선택한 유료 성공, 오답과 정답 재시도, 입력 정규화, 메일 상세/검색, 여행 서류 확대, 앱 이동 후 입력 유지, 시간 초과 실패, 연습 모드 10분 경과 뒤 성공, 힌트 12단계 사용, 320px 화면에서 끝까지 플레이, 결과 재시작, 결과 복사 및 권한 거절 시 텍스트 대안.

타이머 브라우저 테스트는 Playwright 가상 시계를 사용했습니다. reducer는 마감 직전의 마지막 액션에서도 경과 시간을 검사하는 테스트를 포함합니다. 실제 5분을 기다리지 않았습니다.

## 리뷰 수정

- 답장 타이머를 메신저 화면에서 세션 수준으로 이동. 다른 앱에서도 답장 도착, 알림 배너/배지/알림음.
- 광고를 읽어도 아직 읽지 않은 단서 메일의 배지가 유지되도록 동일한 집합으로 개수/표시 계산.
- 모달 키보드 포커스 순환에서 비활성화 버튼 제외, textarea 포함.
- 320px 화면에서 읽을 수 있도록 본문·입력·버튼 글자 크기 조정.

배지와 포커스 회귀 테스트는 수정 전 실패를 재현한 뒤 수정 후 통과했습니다. 모든 테스트와 최종 빌드의 결과를 직접 확인했습니다.

## 화면

`artifacts/intro-desktop.png`, `intro-mobile.png`, `home-mobile.png`, `home-small.png`, `mail-mobile.png`, `airline-mobile.png`, `document-mobile.png`, `success-mobile.png`, `failure-mobile.png`.

가상 시계 캡처는 `animations: disabled`로 애니메이션 최종 상태를 저장합니다. 화면을 확인하고 문서 이름, 탑승권 정보와 스크롤 가능한 콘텐츠를 점검했습니다.

## 제한

Chrome의 320×568, 390×844, 1440×1000 뷰포트로 검증했습니다. 실제 iOS/Android와 Safari/Firefox 검증은 하지 않았습니다. 실제 소리를 청취하는 검증은 하지 않았으며 Web Audio 생성 코드를 적용했습니다. 사용자의 요청대로 공개 배포와 외부 서비스 연결은 수행하지 않았습니다.
