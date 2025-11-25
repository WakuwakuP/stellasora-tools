'use client'

import { Card, CardContent, CardHeader, CardTitle } from 'components/ui/card'
import { Separator } from 'components/ui/separator'
import { type FC } from 'react'
import { type Build, type Character, type Talent } from 'types/build'

interface BuildViewProps {
  build: Build
  url: string
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

const CharacterCard: FC<{ character: Character; characterRole: string }> = ({
  character,
  characterRole,
}) => (
  <Card>
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-lg">
        <span className="rounded bg-gray-100 px-2 py-1 font-medium text-sm dark:bg-gray-800">
          {character.name}
        </span>
        <span className="text-muted-foreground text-sm">{characterRole}</span>
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

export const BuildView: FC<BuildViewProps> = ({ build, url }) => (
  <div className="min-h-screen bg-background p-4">
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h1 className="font-bold text-2xl">ビルド詳細</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          URL: <code className="rounded bg-muted px-2 py-1">{url}</code>
        </p>
      </div>

      <Separator />

      <section>
        <h2 className="mb-4 font-semibold text-xl">キャラクター編成</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <CharacterCard character={build.main} characterRole="主力" />
          <CharacterCard character={build.supports[0]} characterRole="支援1" />
          <CharacterCard character={build.supports[1]} characterRole="支援2" />
        </div>
      </section>
    </div>
  </div>
)
