/**
 * スキル説明文のプレースホルダーを置換する
 * @param description - スキル説明（{1}, {2}等のプレースホルダーを含む）
 * @param params - パラメータ配列
 * @returns 置換後の説明文
 */
export function replaceSkillParams(
  description: string,
  params?: string[],
): string {
  if (!params || params.length === 0) {
    return description
  }
  // HTMLカラータグを削除
  let result = description.replace(/<color=[^>]+>|<\/color>/g, '')
  // {N}プレースホルダーを置換
  for (let i = 0; i < params.length; i++) {
    result = result.replaceAll(`{${i + 1}}`, params[i])
  }
  return result
}
