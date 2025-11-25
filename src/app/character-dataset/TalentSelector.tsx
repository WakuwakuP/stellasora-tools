'use client'

import { Card, CardContent } from 'components/ui/card'
import { Input } from 'components/ui/input'
import { Label } from 'components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'components/ui/select'
import { type FC } from 'react'

/** 素質レベル選択肢 */
const TALENT_LEVELS = [
  { label: '未選択', value: '0' },
  { label: 'Lv.1', value: '1' },
  { label: 'Lv.2', value: '2' },
  { label: 'Lv.3', value: '3' },
  { label: 'Lv.4', value: '4' },
  { label: 'Lv.5', value: '5' },
  { label: 'Lv.6', value: '6' },
]

interface TalentData {
  id: number
  level: number
  name: string
}

interface TalentSelectorProps {
  index: number
  onLevelChange: (value: number) => void
  onNameChange: (value: string) => void
  talent: TalentData
}

export const TalentSelector: FC<TalentSelectorProps> = ({
  index,
  onLevelChange,
  onNameChange,
  talent,
}) => {
  const isActive = talent.level > 0

  return (
    <Card
      className={`transition-colors ${isActive ? 'border-primary/50 bg-primary/5' : ''}`}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <Label className="text-muted-foreground text-sm">
            素質 {index + 1}
          </Label>
          <Select
            onValueChange={(v) => onLevelChange(Number(v))}
            value={talent.level.toString()}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="レベル" />
            </SelectTrigger>
            <SelectContent>
              {TALENT_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          disabled={talent.level === 0}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="素質名を入力"
          value={talent.name}
        />
      </CardContent>
    </Card>
  )
}
