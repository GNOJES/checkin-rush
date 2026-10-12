import { scenario } from './scenario';
export type AppId = 'home' | 'mail' | 'chat' | 'airline';
export type GameState = {
  status: 'intro' | 'playing' | 'success' | 'failure';
  mode: 'timed' | 'practice';
  session: number;
  started: number;
  elapsed: number;
  app: AppId;
  mail: string | null;
  airScreen: string;
  done: boolean[];
  cost: number;
  charged: string[];
  wrong: number;
  hints: string[];
  notice: string;
  inputs: Record<string, string>;
  messages: string[];
  chatUnread: boolean;
  asked: string[];
  read: string[];
  muted: boolean;
  reduced: boolean;
};
export type Action = {
  type: string;
  now: number;
  session?: number;
  mode?: string;
  app?: AppId;
  screen?: string;
  code?: string;
  surname?: string;
  given?: string;
  value?: string;
  paid?: boolean;
  puzzle?: number;
  level?: number;
  key?: string;
};
export const initialState: GameState = {
  status: 'intro',
  mode: 'timed',
  session: 0,
  started: 0,
  elapsed: 0,
  app: 'home',
  mail: null,
  airScreen: 'menu',
  done: [false, false, false, false],
  cost: 0,
  charged: [],
  wrong: 0,
  hints: [],
  notice: '',
  inputs: { code: '', surname: '', nameSurname: '', given: '', search: '' },
  messages: [],
  chatUnread: true,
  asked: [],
  read: [],
  muted: false,
  reduced: false,
};
const norm = (v = '') => v.trim().toUpperCase();
export function reducer(state: GameState, a: Action): GameState {
  if (a.type === 'START')
    return {
      ...initialState,
      muted: state.muted,
      reduced: state.reduced,
      status: 'playing',
      mode: a.mode === 'practice' ? 'practice' : 'timed',
      session: state.session + 1,
      started: a.now,
    };
  if (a.type === 'MUTE') return { ...state, muted: !state.muted };
  if (a.type === 'REDUCE') return { ...state, reduced: !state.reduced };
  if (a.session !== undefined && a.session !== state.session) return state;
  if (state.status !== 'playing') return state;
  const elapsed = Math.max(0, (a.now - state.started) / 1000);
  if (state.mode === 'timed' && elapsed >= scenario.duration)
    return { ...state, elapsed: 300, status: 'failure', notice: '' };
  let s = { ...state, elapsed };
  const error = (notice: string) => ({ ...s, notice, wrong: s.wrong + 1 });
  const pass = (p: number, notice: string) => ({
    ...s,
    done: s.done.map((v, i) => v || i === p),
    notice,
  });
  switch (a.type) {
    case 'TICK':
      return s;
    case 'APP':
      return { ...s, app: a.app!, chatUnread: a.app === 'chat' ? false : s.chatUnread, notice: '' };
    case 'SCREEN':
      return { ...s, airScreen: a.screen!, notice: '' };
    case 'MAIL':
      return { ...s, mail: a.key!, read: [...new Set([...s.read, a.key!])] };
    case 'MAIL_BACK':
      return { ...s, mail: null };
    case 'INPUT':
      return { ...s, inputs: { ...s.inputs, [a.key!]: a.value! } };
    case 'LOOKUP':
      if (norm(a.code) === scenario.order)
        return error('여행사 주문번호로는 조회할 수 없습니다. 항공사 예약번호를 확인해 주세요.');
      if (norm(a.code) !== scenario.code || norm(a.surname) !== scenario.surname)
        return error('예약을 찾을 수 없습니다. 항공사 예약번호와 성을 다시 확인해 주세요.');
      return {
        ...pass(0, '예약을 찾았습니다. 여행 서류와 이름을 확인해 주세요.'),
        airScreen: 'booking',
      };
    case 'NAME':
      if (!s.done[0]) return { ...s, notice: '먼저 예약을 조회해 주세요.' };
      if (norm(a.surname) !== scenario.surname || norm(a.given) !== scenario.given)
        return error('여행 서류와 이름이 일치하지 않습니다. 성과 이름을 다시 확인해 주세요.');
      s = pass(1, '이름 정정 완료. HAN SEOJUN으로 변경되었습니다.');
      if (a.paid && !s.charged.includes('name'))
        s = { ...s, cost: s.cost + 19900, charged: [...s.charged, 'name'] };
      return s;
    case 'TIME':
      return a.value === scenario.deadline
        ? pass(2, '현지 마감 시각 14:05를 확인했습니다.')
        : error(
            a.value === '15:05'
              ? '15:05는 한국 UTC+9 기준입니다. 공항 현지 UTC+8 기준으로 확인해 주세요.'
              : '14:35는 출발 시각입니다. 탑승권 발급 마감은 그보다 이릅니다.',
          );
    case 'GATE':
      return a.value === scenario.gate
        ? pass(3, '최신 탑승구 C08을 확인했습니다.')
        : error('기존 안내입니다. 더 최근 변경 안내를 확인해 주세요.');
    case 'RECOVERY':
      return s.charged.includes('recovery')
        ? { ...s, notice: '이미 대행 접수가 완료되었습니다. 추가 비용은 없습니다.' }
        : {
            ...s,
            cost: s.cost + 9900,
            charged: [...s.charged, 'recovery'],
            notice: '대행 접수 완료. 예약번호 확인은 별도로 필요합니다.',
          };
    case 'ISSUE':
      return s.done.every(Boolean)
        ? { ...s, status: 'success', notice: '' }
        : { ...s, notice: '네 가지 확인을 모두 완료한 뒤 탑승권을 발급해 주세요.' };
    case 'HINT':
      return { ...s, hints: [...new Set([...s.hints, `${a.puzzle}-${a.level}`])] };
    case 'ASK':
      return s.asked.includes(a.key!) ? s : { ...s, asked: [...s.asked, a.key!] };
    case 'MESSAGE':
      return s.messages.includes(a.key!)
        ? s
        : { ...s, messages: [...s.messages, a.key!], chatUnread: s.app !== 'chat' };
    default:
      return s;
  }
}
export const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0')}`;
export const airportTime = (elapsed: number, offset = 0) => {
  const minutes = 14 * 60 + offset + Math.floor(elapsed / 60);
  return `${Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}`;
};
