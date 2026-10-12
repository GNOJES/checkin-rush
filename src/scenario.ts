export const scenario = {
  name: 'HAN SEOJUN',
  wrongName: 'HAN SEOJOON',
  surname: 'HAN',
  given: 'SEOJUN',
  order: 'TR-482193',
  code: 'Q7M2KD',
  flight: 'MA204',
  gate: 'C08',
  seat: '12A',
  departure: '14:35',
  deadline: '14:05',
  duration: 300,
};
export const puzzles = ['예약 찾기', '이름 정정', '시간 확인', '탑승구 확인'];
export const hints = [
  [
    '이메일의 여행사 결제 완료 메일을 열어 보세요.',
    '큰 주문번호와 항공사 예약번호는 달라요. 예약 상세를 펼쳐 보세요.',
    '항공사 예약번호 Q7M2KD, 성 HAN을 입력하세요.',
  ],
  [
    '민지와의 메신저 대화에서 여행 서류를 확대해 보세요.',
    '예약 이름 SEOJOON과 여행 서류의 이름을 한 글자씩 비교하세요.',
    '무료 직접 정정으로 성 HAN, 이름 SEOJUN을 입력하세요.',
  ],
  [
    '출발 안내 메일과 항공사 앱의 시간대 표기를 확인하세요.',
    '휴대폰은 한국 UTC+9, 공항은 UTC+8입니다. 출발 시각과 마감도 달라요.',
    '공항 현지 기준 탑승권 발급 마감은 14:05입니다.',
  ],
  [
    '이메일에 탑승구 안내가 두 개 있습니다.',
    '발송 시각이 더 늦은 변경 안내를 찾아보세요.',
    '13:58에 발송된 변경 메일의 C08이 최종 탑승구입니다.',
  ],
];
export const mailData = [
  {
    id: 'gate',
    sender: '모아항공',
    initial: 'M',
    time: '13:58',
    subject: '[중요] MA204 탑승구 변경 안내',
    preview: '탑승구가 변경되었습니다. 최신 안내를 확인하세요.',
    kind: 'important',
    body: 'MA204 타이베이 → 서울 항공편의 탑승구가 B12에서 C08로 변경되었습니다. 이전 안내 대신 본 안내를 확인해 주세요. 안내 시각은 공항 현지 UTC+8 기준입니다.',
  },
  {
    id: 'departure',
    sender: '모아항공',
    initial: 'M',
    time: '13:30',
    subject: 'MA204, 오늘의 출발 안내',
    preview: '서울로 떠날 준비 되셨나요? 출발 정보를 보내드립니다.',
    kind: 'flight',
    body: 'MA204 · 타이베이 하늘공항 → 서울. 최초 안내 탑승구 B12. 탑승권 발급 마감 14:05, 출발 예정 14:35. 모든 시각은 공항 현지 UTC+8 기준입니다. 한국 UTC+9 기준 마감 15:05 / 출발 15:35.',
  },
  {
    id: 'payment',
    sender: '트래블메이트',
    initial: 'T',
    time: '어제',
    subject: '여행사 결제가 완료되었습니다',
    preview: '서울행 여행의 시작! 주문 정보를 확인해 주세요.',
    kind: 'booking',
    body: '결제가 정상적으로 완료되었습니다. 이 번호는 여행사 주문번호입니다. 항공사 예약 조회에는 아래 예약 상세의 항공사 예약번호를 사용해 주세요.',
  },
  {
    id: 'ad',
    sender: '여행의 발견',
    initial: '✦',
    time: '어제',
    subject: '[광고] 여행의 끝은 기념품!',
    preview: '망고젤리부터 펑리수까지, 이번 주 여행 쇼핑 이야기.',
    kind: 'ad',
    body: '여행 쇼핑 광고입니다. 이 메일에는 예약이나 탑승 정보가 없습니다. 기념품은 마음에 담고, 탑승권은 손에 담으세요.',
  },
];
export const replies: Record<string, { question: string; answer: string }> = {
  code: {
    question: '항공사 예약번호 어디에 있어?',
    answer:
      '메일의 큰 번호는 여행사 주문번호래! 트래블메이트 결제 메일에서 예약 상세를 펼쳐봐. 항공사 번호가 따로 있어.',
  },
  name: {
    question: '내 영문 이름 다시 확인해 줄래?',
    answer:
      '내가 O를 하나 더 넣었나…? 네가 보낸 여행 서류 사진을 확대해서 확인해줘. 항공사 앱에 무료 직접 정정도 있대!',
  },
  time: {
    question: '마감 시각이 정확히 언제야?',
    answer:
      '네 폰은 한국 시각이잖아. 공항은 한 시간 느려! 출발 안내의 UTC+8 표시랑 탑승권 발급 마감을 확인해봐. 출발 시각이랑 헷갈리면 안 돼 😅',
  },
};
