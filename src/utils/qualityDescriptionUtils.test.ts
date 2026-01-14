import { describe, expect, it } from 'vitest'
import {
  processQualityDescription,
  replaceDescriptionWithLevel,
} from './qualityDescriptionUtils'

describe('processQualityDescription', () => {
  describe('パラメータ置換', () => {
    it('&Param1& を params[0] のレベル1の値で置換する', () => {
      const description = '攻撃速度が&Param1&上昇する'
      const params = ['2.7%/3.6%/4.5%/5.4%/6.3%/7.2%/8.1%/9%/10%']
      const result = processQualityDescription(description, params, 1)
      expect(result).toBe('攻撃速度が2.7%上昇する')
    })

    it('&Param2& を params[1] のレベル1の値で置換する', () => {
      const description = 'ダメージが&Param1&増加し、速度が&Param2&上昇する'
      const params = [
        '10%/12%/14%/16%/18%/20%/22%/24%/26%',
        '5%/6%/7%/8%/9%/10%/11%/12%/13%',
      ]
      const result = processQualityDescription(description, params, 1)
      expect(result).toBe('ダメージが10%増加し、速度が5%上昇する')
    })

    it('指定したレベルの値を使用する', () => {
      const description = '攻撃速度が&Param1&上昇する'
      const params = ['2.7%/3.6%/4.5%/5.4%/6.3%/7.2%/8.1%/9%/10%']
      const result = processQualityDescription(description, params, 5)
      expect(result).toBe('攻撃速度が6.3%上昇する')
    })

    it('レベルが最大値を超える場合は最後の値を使用する', () => {
      const description = '攻撃速度が&Param1&上昇する'
      const params = ['2.7%/3.6%/4.5%']
      const result = processQualityDescription(description, params, 10)
      expect(result).toBe('攻撃速度が4.5%上昇する')
    })

    it('/ 区切りではないパラメータはそのまま使用する', () => {
      const description = '&Param1&秒間効果が持続する'
      const params = ['5']
      const result = processQualityDescription(description, params, 1)
      expect(result).toBe('5秒間効果が持続する')
    })

    it('params が undefined の場合はプレースホルダーをそのまま残す', () => {
      const description = '攻撃速度が&Param1&上昇する'
      const result = processQualityDescription(description, undefined, 1)
      expect(result).toBe('攻撃速度が&Param1&上昇する')
    })

    it('params が空配列の場合はプレースホルダーをそのまま残す', () => {
      const description = '攻撃速度が&Param1&上昇する'
      const result = processQualityDescription(description, [], 1)
      expect(result).toBe('攻撃速度が&Param1&上昇する')
    })

    it('params に該当するインデックスがない場合はプレースホルダーをそのまま残す', () => {
      const description = '攻撃速度が&Param1&上昇し、ダメージが&Param5&増加する'
      const params = ['10%']
      const result = processQualityDescription(description, params, 1)
      expect(result).toBe('攻撃速度が10%上昇し、ダメージが&Param5&増加する')
    })
  })

  describe('カラータグの削除', () => {
    it('<color=#...>...</color> タグを削除して内容のみ残す', () => {
      const description = '攻撃速度が<color=#ec6d21>10%</color>上昇する'
      const result = processQualityDescription(description, undefined, 1)
      expect(result).toBe('攻撃速度が10%上昇する')
    })

    it('複数のカラータグを削除する', () => {
      const description =
        '<color=#ec6d21>攻撃速度</color>が上昇し、<color=#21ec6d>防御力</color>が増加する'
      const result = processQualityDescription(description, undefined, 1)
      expect(result).toBe('攻撃速度が上昇し、防御力が増加する')
    })
  })

  describe('リンク表現の変換', () => {
    it('##テキスト#数字# 形式をテキストのみに変換する', () => {
      const description = '##風属性の印#1017#が付与される'
      const result = processQualityDescription(description, undefined, 1)
      expect(result).toBe('風属性の印が付与される')
    })

    it('複数のリンク表現を変換する', () => {
      const description = '##火属性の印#1001#と##水属性の印#1002#が付与される'
      const result = processQualityDescription(description, undefined, 1)
      expect(result).toBe('火属性の印と水属性の印が付与される')
    })
  })

  describe('絵文字の削除', () => {
    it('Unicode絵文字を削除する', () => {
      const description = '火属性の印🔥が付与される'
      const result = processQualityDescription(description, undefined, 1)
      expect(result).toBe('火属性の印が付与される')
    })

    it('複数の絵文字を削除する', () => {
      const description = '炎🔥と雷⚡の力を得る'
      const result = processQualityDescription(description, undefined, 1)
      expect(result).toBe('炎と雷の力を得る')
    })
  })

  describe('複合的な処理', () => {
    it('すべての処理を組み合わせて実行する', () => {
      const description =
        '主力スキルで向日葵手裏剣を投げるたびに、&Param3&秒間、&Param5&が<color=#ec6d21>&Param1&</color>上昇し、&Param6&が<color=#ec6d21>&Param2&</color>増加する。この効果は&Param4&回重複できる。'
      const params = [
        '2.7%/3.6%/4.5%/5.4%/6.3%/7.2%/8.1%/9%/10%',
        '6%/10%/13%/17%/20%/24%/28%/31%/35%',
        '5',
        '3',
        '攻撃速度',
        '通常攻撃ダメージ',
      ]
      const result = processQualityDescription(description, params, 1)
      expect(result).toBe(
        '主力スキルで向日葵手裏剣を投げるたびに、5秒間、攻撃速度が2.7%上昇し、通常攻撃ダメージが6%増加する。この効果は3回重複できる。',
      )
    })

    it('リンク表現と絵文字を含む複合処理', () => {
      const description =
        '##風属性の印#1017#：疾風🌪が付与され、攻撃速度が<color=#ec6d21>&Param1&</color>上昇する'
      const params = ['15%/20%/25%/30%/35%/40%/45%/50%/55%']
      const result = processQualityDescription(description, params, 3)
      expect(result).toBe('風属性の印：疾風が付与され、攻撃速度が25%上昇する')
    })
  })
})

describe('replaceDescriptionWithLevel', () => {
  it('processQualityDescription と同じ動作をする', () => {
    const description = '攻撃速度が&Param1&上昇する'
    const params = ['2.7%/3.6%/4.5%/5.4%/6.3%/7.2%/8.1%/9%/10%']
    const result1 = replaceDescriptionWithLevel(description, params, 3)
    const result2 = processQualityDescription(description, params, 3)
    expect(result1).toBe(result2)
    expect(result1).toBe('攻撃速度が4.5%上昇する')
  })

  it('params が undefined の場合も正しく処理する', () => {
    const description = '攻撃速度が上昇する'
    const result = replaceDescriptionWithLevel(description, undefined, 1)
    expect(result).toBe('攻撃速度が上昇する')
  })
})
