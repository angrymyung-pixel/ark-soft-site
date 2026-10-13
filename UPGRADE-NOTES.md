# 홈페이지 개편 작업 기록 — 2026-10-09

작업본: homepage_v3/index.html
기존 저장소: https://github.com/angrymyung-pixel/ark-soft-site.git
공개 서비스 주소와 배포 상태는 확인하지 않았으며, 이번 변경은 로컬 작업본에만 반영했습니다.

- 홍보영상 원본: 05_홍보영상_아트/홍보영상.mov (58.28초, 4K HEVC)
- 웹용 영상: media/promotion.mp4 (H.264/AAC, 약 19.14 MB)
- 무음 배경 루프: media/promotion-preview.mp4 (12초, 약 1.45 MB)
- 최신 캐릭터 아트북 3종 및 김동수 원화 반영
- 캐릭터 CSS 입체 반응, 키보드로 조작 가능한 작품 확대창, 영상 모달
- 모바일 및 움직임 줄이기 설정에서는 배경 영상 자동 재생 생략
- 기존 게임과 방 꾸미기 유지, 중복 단계/멈춤 버튼 정리

캐릭터는 2D 원화에 입체 반응을 적용한 상태이며, 회전 가능한 실제 3D 인체 모델은 아닙니다.
원본 HTML 백업: ../tmp/homepage-before-upgrade-20261009.html
파일 참조 및 중복 ID 검사 통과. 브라우저 실행 도구 오류로 화면·인터랙션 실기 검증은 미완료.

추가 검증: Node.js --check로 기존 인라인 스크립트와 upgrade.js 구문 검사 통과.
