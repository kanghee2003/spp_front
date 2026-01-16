import { z } from 'zod';
import { AutoCompleteOption, IudType } from '../../../type/common.type';

/**
 * SampleOut 런타임 검증 스키마
 * - 날짜(LocalDateTime)는 프론트에서는 string으로 받는 형태(ISO 문자열)
 */

/* ================================== SCHEME =========================================== */

/* ================================== TYPE =========================================== */
export interface ComponentSampleOptions extends AutoCompleteOption {
  seq: number;
}
