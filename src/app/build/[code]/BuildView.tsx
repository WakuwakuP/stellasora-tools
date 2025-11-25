'use client'

import { type FC } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Separator } from 'components/ui/separator'
import type { Build, Character, Talent } from 'types/build'

interface BuildViewProps {
  build: Build
  code: string
}

const TalentBadge: FC<{ talent: Talent; type: 'core' | 'sub' }> = ({
  talent,
  type,
}) => {
  const baseClass =
    'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium'
  const typeClass =
    type === 'core'
      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'

  return (
    <span className={`${baseClass} ${typeClass}`}>
      #{talent.id + 1} Lv.{talent.level}
    </span>
  )
}

const CharacterCard: FC<{ character: Character; role: string }> = ({
  character,
  role,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <span className="rounded bg-gray-100 px-2 py-1 font-mono text-sm dark:bg-gray-800">
            ID: {character.id}
          </span>
          <span className="text-muted-foreground text-sm">{role}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="mb-2 font-medium text-sm">コア素質</h4>
          <div className="flex flex-wrap gap-2">
            {character.talents.core.length > 0 ? (
              character.talents.core.map((talent) => (
                <TalentBadge
                  key={`core-${talent.id}`}
                  talent={talent}
                  type="core"
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm">なし</span>
            )}
          </div>
        </div>
        <div>
          <h4 className="mb-2 font-medium text-sm">サブ素質</h4>
          <div className="flex flex-wrap gap-2">
            {character.talents.sub.length > 0 ? (
              character.talents.sub.map((talent) => (
                <TalentBadge
                  key={`sub-${talent.id}`}
                  talent={talent}
                  type="sub"
                />
              ))
            ) : (
              <span className="text-muted-foreground text-sm">なし</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const LossRecordCard: FC<{ main: number[]; sub: number[] }> = ({
  main,
  sub,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">ロスレコ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="mb-2 font-medium text-sm">メイン</h4>
          <div className="flex flex-wrap gap-2">
            {main.map((id, index) => (
              <span
                key={`main-${index}-${id}`}
                className="inline-flex items-center rounded-full bg-purple-100 px-2 py-1 font-medium text-purple-800 text-xs dark:bg-purple-900 dark:text-purple-200"
              >
                #{id + 1}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-2 font-medium text-sm">サブ</h4>
          <div className="flex flex-wrap gap-2">
            {sub.map((id, index) => (
              <span
                key={`sub-${index}-${id}`}
                className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 font-medium text-green-800 text-xs dark:bg-green-900 dark:text-green-200"
              >
                #{id + 1}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export const BuildView: FC<BuildViewProps> = ({ build, code }) => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center">
          <h1 className="font-bold text-2xl">ビルド詳細</h1>
          <p className="mt-2 text-muted-foreground text-sm">
            共有コード:{' '}
            <code className="rounded bg-muted px-2 py-1">{code}</code>
          </p>
        </div>

        <Separator />

        <section>
          <h2 className="mb-4 font-semibold text-xl">キャラクター編成</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <CharacterCard character={build.main} role="主力" />
            <CharacterCard character={build.supports[0]} role="支援1" />
            <CharacterCard character={build.supports[1]} role="支援2" />
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="mb-4 font-semibold text-xl">ロスレコ</h2>
          <LossRecordCard
            main={build.lossRecord.main}
            sub={build.lossRecord.sub}
          />
        </section>
      </div>
    </div>
  )
}
