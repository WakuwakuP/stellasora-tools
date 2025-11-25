import { type Metadata } from 'next'
import { type FC } from 'react'

import { CharacterDatasetForm } from './CharacterDatasetForm'

export const metadata: Metadata = {
  description: 'ゲームのスクリーンショットからキャラクターの素質データを登録',
  title: 'キャラクターデータセット作成',
}

const CharacterDatasetPage: FC = () => (
  <div className="min-h-screen bg-background">
    <div className="mx-auto max-w-4xl p-4">
      <header className="mb-8 text-center">
        <h1 className="font-bold text-2xl">キャラクターデータセット作成</h1>
        <p className="mt-2 text-muted-foreground">
          ゲームのスクリーンショットを参照しながらキャラクターの素質データを入力してください
        </p>
      </header>
      <CharacterDatasetForm />
    </div>
  </div>
)

export default CharacterDatasetPage
