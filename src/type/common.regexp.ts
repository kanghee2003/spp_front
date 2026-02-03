export type RegExpRule = Readonly<{
  regExp: RegExp;
  message: string;
}>;

export const REGEXP = {
  ENG_ONLY: /^[a-zA-Z]*$/,
  ENG_NUM_ONLY: /^[a-zA-Z0-9]*$/,
  ENG_NUM_UNDER: /^[a-zA-Z0-9_]*$/,

  NUMBER_ONLY: /^[0-9]*$/,
  NUMBER_POSITIVE_INT: /^[1-9][0-9]*$/,

  KOR_ONLY: /^[가-힣]*$/,
  KOR_ENG_NUM_SPACE: /^[가-힣a-zA-Z0-9 ]*$/,

  EMAIL_SIMPLE: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_KR_SIMPLE: /^01[016789][0-9]{7,8}$/,
  CODE_UPPER_NUM_UNDER: /^[A-Z0-9_]*$/,
} as const;

export const REGEXP_RULES = {
  ALLOW_ENG: { regExp: REGEXP.ENG_ONLY, message: '영문만 입력 가능합니다.' },
  ALLOW_ENG_NUM: { regExp: REGEXP.ENG_NUM_ONLY, message: '영문/숫자만 입력 가능합니다.' },
  ALLOW_ENG_NUM_UNDER: { regExp: REGEXP.ENG_NUM_UNDER, message: '영문/숫자/언더바(_)만 입력 가능합니다.' },

  ALLOW_NUMBER: { regExp: REGEXP.NUMBER_ONLY, message: '숫자만 입력 가능합니다.' },
  ALLOW_NUMBER_POSITIVE_INT: { regExp: REGEXP.NUMBER_POSITIVE_INT, message: '정수만 입력 가능합니다.' },

  ALLOW_KOR: { regExp: REGEXP.KOR_ONLY, message: '한글만 입력 가능합니다.' },
  ALLOW_KOR_ENG_NUM_SPACE: { regExp: REGEXP.KOR_ENG_NUM_SPACE, message: '한글/영문/숫자/스페이스만 입력 가능합니다.' },

  ALLOW_EMAIL: { regExp: REGEXP.EMAIL_SIMPLE, message: '이메일 형식이 올바르지 않습니다.' },
  ALLOW_PHONE: { regExp: REGEXP.PHONE_KR_SIMPLE, message: '전화번호 형식이 올바르지 않습니다.' },
  ALLOW_CODE: { regExp: REGEXP.CODE_UPPER_NUM_UNDER, message: '코드 형식이 올바르지 않습니다.' },
} as const satisfies Record<string, RegExpRule>;
