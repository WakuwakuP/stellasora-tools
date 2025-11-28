import { type LossRecordInfo } from 'types/lossRecord'

/** 属性のソート順序定数 */
const ELEMENT_ORDER_FIRE = 0
const ELEMENT_ORDER_WATER = 1
const ELEMENT_ORDER_WIND = 2
const ELEMENT_ORDER_EARTH = 3
const ELEMENT_ORDER_LIGHT = 4
const ELEMENT_ORDER_DARK = 5
const ELEMENT_ORDER_NONE = 6
const ELEMENT_ORDER_UNKNOWN = 99

/** 属性のソート順序を取得する関数 */
function getElementOrder(element: string): number {
  switch (element) {
    case '火':
      return ELEMENT_ORDER_FIRE
    case '水':
      return ELEMENT_ORDER_WATER
    case '風':
      return ELEMENT_ORDER_WIND
    case '地':
      return ELEMENT_ORDER_EARTH
    case '光':
      return ELEMENT_ORDER_LIGHT
    case '闇':
      return ELEMENT_ORDER_DARK
    case 'なし':
      return ELEMENT_ORDER_NONE
    default:
      return ELEMENT_ORDER_UNKNOWN
  }
}

/**
 * ロスレコをソートする関数
 * ソート順: レアリティ降順 → 属性順 → 名前順
 */
export function sortLossRecords(
  lossRecords: LossRecordInfo[],
): LossRecordInfo[] {
  return [...lossRecords].sort((a, b) => {
    // レアリティ降順
    if (b.star !== a.star) return b.star - a.star
    // 属性順
    const elementA = getElementOrder(a.element)
    const elementB = getElementOrder(b.element)
    if (elementA !== elementB) return elementA - elementB
    // 名前順
    return a.name.localeCompare(b.name, 'ja')
  })
}
