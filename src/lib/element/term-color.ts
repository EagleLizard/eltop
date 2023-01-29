
const ALL_TERM_COLOR_CODES = Array(256).fill(0).map((v, i) => i);

export const OMIT_COLOR_CODES: number[] = [
  ...getRangeInclusive(16, 27),
  ...getRangeInclusive(52, 81),
  ...getRangeInclusive(88, 117),
  ...getRangeInclusive(124, 159),
  ...getRangeInclusive(160, 177),

  // 0,
  // 4,
  // 7,
  // 8,
  // 15,
  // 16, 17, 18, 19, 20, 21,
  // 22, 23
];

export const TERM_COLOR_CODES = ALL_TERM_COLOR_CODES
  .slice(16, 232) // min:16 max:231
  // .filter(termColorCode => !OMIT_COLOR_CODES.includes(termColorCode))
;

export const FILTERED_TERM_COLOR_CODES = TERM_COLOR_CODES
  .filter((termColorCode) => {
    return !OMIT_COLOR_CODES.includes(termColorCode);
  })
;

// export {
//   TERM_COLOR_CODES,
//   FILTERED_TERM_COLOR_CODE
// };

function getRangeInclusive(start: number, end: number): number[] {
  return Array((end + 1) - start).fill(0).map((v, i) => i + start);
}
