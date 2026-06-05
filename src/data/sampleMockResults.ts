// 더미데이터

export interface SearchResultItem {
  id: number;
  title: string;
  category: string;
  location: string; /* 표시용 지역 */
  locationTags: string[]; /* 검색용 지역 키워드 */
  timeAgo: string;
  price: string;
  imageEmoji: string;
  imageUrl?: string;
  tags: string[];
  keywords: string[]; /* 검색어 매칭용 키워드 */
  description?: string; /* 기타 사항 */
  author?: string;      /* 작성자 */
  lat?: number;         /* 선택된 장소 위도 */
  lng?: number;         /* 선택된 장소 경도 */
}

export const MOCK_RESULTS: SearchResultItem[] = [
  {
    id: 1,
    title: "기타 입문자 대상 1:1 레슨 (강남 홍대 가능)",
    category: "레슨",
    location: "마포구",
    locationTags: ["마포", "마포구", "홍대", "서울"],
    timeAgo: "3분 전",
    price: "월 120,000원",
    imageEmoji: "🎸",
    tags: ["lesson", "guitar"],
    keywords: ["기타", "레슨", "입문", "어쿠스틱", "통기타"],
    description: "통기타 입문부터 코드 스트로크, 핑거스타일까지 단계별로 가르쳐 드립니다. 악기가 없으셔도 레슨실에 기타가 구비되어 있어요. 주 1~2회 수업 가능하며 시간 협의 환영합니다.",
    author: "김민준",
  },
  {
    id: 2,
    title: "드럼 레슨 합니다 - 10년 경력 프로 드러머",
    category: "레슨",
    location: "서대문구",
    locationTags: ["서대문", "서대문구", "서울"],
    timeAgo: "1시간 전",
    price: "월 150,000원",
    imageEmoji: "🥁",
    tags: ["lesson", "drum"],
    keywords: ["드럼", "레슨", "드러머", "타악기"],
    description: "실용음악과 출신 10년 경력 드러머가 직접 지도합니다. 팝, 록, 재즈 등 장르별 드럼 패턴 교육. 방음이 잘 된 개인 연습실에서 진행하며, 초보자도 3개월이면 밴드 합주 가능 수준까지 올려 드립니다.",
    author: "이서연",
  },
  {
    id: 3,
    title: "보컬 트레이닝 · 발성 교정 전문",
    category: "보컬/노래",
    location: "용산구",
    locationTags: ["용산", "용산구", "서울"],
    timeAgo: "2시간 전",
    price: "월 100,000원",
    imageEmoji: "🎤",
    tags: ["vocal"],
    keywords: ["보컬", "노래", "발성", "트레이닝", "보이스"],
    description: "보컬 트레이닝 및 발성 교정 전문입니다. 초보자부터 전문가까지 맞춤 레슨을 제공합니다.",
    author: "박지우",
  },
  {
    id: 4,
    title: "재즈 피아노 레슨 · 초중급 환영",
    category: "피아노/건반",
    location: "강남구",
    locationTags: ["강남", "강남구", "서울"],
    timeAgo: "5시간 전",
    price: "월 130,000원",
    imageEmoji: "🎹",
    tags: ["lesson", "piano"],
    keywords: ["피아노", "건반", "재즈", "레슨"],
    description: "재즈 피아노 전문 레슨. 클래식 피아노 경력자 환영하며 재즈 보이싱, 즉흥연주까지 체계적으로 가르칩니다.",
    author: "최예린",
  },
  {
    id: 5,
    title: "밴드 합주 멤버 구합니다 (기타, 베이스)",
    category: "밴드/합주",
    location: "홍대",
    locationTags: ["마포", "홍대", "서울"],
    timeAgo: "어제",
    price: "무료",
    imageEmoji: "🎵",
    tags: ["band", "guitar"],
    keywords: ["밴드", "합주", "기타", "베이스", "멤버"],
    description: "홍대 인근 연습실 보유. 주 1회 합주 예정이며 장르는 록/팝 위주입니다. 실력보다 열정 있는 분 환영해요!",
    author: "강동현",
  },
  {
    id: 6,
    title: "Fender Stratocaster 중고 판매합니다",
    category: "악기거래",
    location: "성동구",
    locationTags: ["성동", "성동구", "서울"],
    timeAgo: "2일 전",
    price: "850,000원",
    imageEmoji: "🎸",
    tags: ["instrument", "guitar"],
    keywords: ["기타", "펜더", "스트라토캐스터", "일렉기타", "중고"],
    description: "2021년 구매, 사용감 있으나 상태 양호. 케이스 포함. 직거래 선호하며 성동구 인근 가능합니다.",
    author: "윤성호",
  },
  {
    id: 7,
    title: "Roland 전자드럼 TD-17KVX 팝니다",
    category: "악기거래",
    location: "송파구",
    locationTags: ["송파", "송파구", "서울"],
    timeAgo: "3일 전",
    price: "1,200,000원",
    imageEmoji: "🥁",
    tags: ["instrument", "drum"],
    keywords: ["드럼", "전자드럼", "롤랜드", "중고"],
    description: "Roland TD-17KVX 전자드럼 판매합니다. 1년 사용, 패드 상태 깨끗합니다. 앰프 별도 협의 가능.",
    author: "임하늘",
  },
  {
    id: 8,
    title: "색소폰 레슨 · 왕초보 환영 · 단기완성",
    category: "관악기",
    location: "인천 서구",
    locationTags: ["인천", "서구", "인천서구"],
    timeAgo: "4일 전",
    price: "월 90,000원",
    imageEmoji: "🎷",
    tags: ["lesson", "wind"],
    keywords: ["색소폰", "관악기", "레슨", "초보"],
    description: "악기 대여 가능하며 3개월 단기 완성 과정 운영 중입니다. 왕초보도 환영합니다.",
    author: "정다은",
  },
  {
    id: 9,
    title: "기타 레슨 · 인천 서구 방문 가능",
    category: "레슨",
    location: "인천 서구",
    locationTags: ["인천", "서구", "인천서구"],
    timeAgo: "5일 전",
    price: "월 100,000원",
    imageEmoji: "🎸",
    tags: ["lesson", "guitar"],
    keywords: ["기타", "레슨", "방문", "인천"],
    description: "인천 서구 방문 레슨 가능합니다. 어쿠스틱/일렉 모두 가능하며 초보자 환영합니다.",
    author: "오재원",
  },
  {
    id: 10,
    title: "DJ 장비 Pioneer DDJ-400 판매",
    category: "DJ/전자음악",
    location: "마포구",
    locationTags: ["마포", "마포구", "서울"],
    timeAgo: "5일 전",
    price: "450,000원",
    imageEmoji: "🎧",
    tags: ["dj", "equipment"],
    keywords: ["DJ", "파이오니아", "전자음악", "장비"],
    description: "Pioneer DDJ-400 판매합니다. 박스 포함 깨끗한 상태. 직거래 홍대/신촌 가능.",
    author: "한지민",
  },
  {
    id: 11,
    title: "바이올린 레슨 · 어린이 성인 모두 가능",
    category: "현악기",
    location: "노원구",
    locationTags: ["노원", "노원구", "서울"],
    timeAgo: "6일 전",
    price: "월 110,000원",
    imageEmoji: "🎻",
    tags: ["lesson", "string"],
    keywords: ["바이올린", "현악기", "레슨", "어린이"],
    description: "어린이부터 성인까지 연령 관계없이 레슨합니다. 발표회 준비 및 취미 레슨 모두 가능합니다.",
    author: "송미래",
  },
];

export const ALL_KEYWORDS: string[] = [
  ...new Set(MOCK_RESULTS.flatMap((item) => item.keywords)),
].sort();
