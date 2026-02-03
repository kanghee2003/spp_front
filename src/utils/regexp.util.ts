import { RegExpRule } from '@/type/common.regexp';

export function isMatch(rule: RegExp | RegExpRule, value: string) {
  const rx = rule instanceof RegExp ? rule : rule.regExp;
  return rx.test(value);
}

export function assertMatch(rule: RegExpRule, value: string) {
  if (!rule.regExp.test(value)) throw new Error(rule.message);
}
