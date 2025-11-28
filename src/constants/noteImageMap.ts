/**
 * 音符名から画像パスを取得するマッピング
 */
export const NOTE_IMAGE_MAP: Record<string, string> = {
  体力の音符: '/notes/note_90014_S.png',
  光の音符: '/notes/note_90022_S.png',
  器用の音符: '/notes/note_90016_S.png',
  地の音符: '/notes/note_90021_S.png',
  幸運の音符: '/notes/note_90012_S.png',
  強撃の音符: '/notes/note_90011_S.png',
  必殺の音符: '/notes/note_90017_S.png',
  水の音符: '/notes/note_90018_S.png',
  火の音符: '/notes/note_90019_S.png',
  爆発の音符: '/notes/note_90013_S.png',
  闇の音符: '/notes/note_90023_S.png',
  集中の音符: '/notes/note_90015_S.png',
  風の音符: '/notes/note_90020_S.png',
}

/**
 * 音符名から画像パスを取得する
 */
export function getNoteImagePath(noteName: string): string | null {
  // 完全一致
  if (NOTE_IMAGE_MAP[noteName]) {
    return NOTE_IMAGE_MAP[noteName]
  }
  // 部分一致でフォールバック
  for (const [key, path] of Object.entries(NOTE_IMAGE_MAP)) {
    if (noteName.includes(key.replace('の音符', ''))) {
      return path
    }
  }
  return null
}
