import {
  getAvailableCharacters as getAvailableCharactersAction,
  getQualitiesData as getQualitiesDataAction,
} from 'actions/getCharacterData'
import { getLossRecordData as getLossRecordDataAction } from 'actions/getLossRecordData'

/**
 * StellaSoraAPIから素質データを取得する Server Action
 * 4時間キャッシュで結果を保持
 */
export const getQualitiesData = getQualitiesDataAction

/**
 * 利用可能なキャラクターデータのみを抽出する Server Action
 * APIから取得したデータはすべて有効なキャラクターデータなので、そのまま返す
 */
export const getAvailableCharacters = getAvailableCharactersAction

/**
 * StellaSoraAPIからロスレコデータを取得する Server Action
 * 4時間キャッシュで結果を保持
 */
export const getLossRecordData = getLossRecordDataAction

/**
 * ビルドクリエイター読み込み中のフォールバックUI
 */
export function BuildCreatorFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-lg">読み込み中...</div>
    </div>
  )
}
