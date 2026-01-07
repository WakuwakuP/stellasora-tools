# Stella Sora ビルド評価システム

## 概要

このシステムは、『Stella Sora』のキャラクタービルドを定量的に評価するためのツール群です。最新のコミュニティ解析に基づいたダメージ計算式を実装し、ビルドの最適化とパフォーマンス比較を可能にします。

## システムアーキテクチャ

```
src/
├── types/
│   ├── damage-calculation.ts  # ダメージ計算の型定義
│   └── harmony-system.ts      # ハーモニーシステムの型定義
└── lib/
    ├── damage-calculator.ts   # コアダメージ計算エンジン
    ├── build-evaluator.ts     # ビルド評価・スコアリング
    └── harmony-optimizer.ts   # ハーモニー最適化アルゴリズム
```

## 主要コンポーネント

### 1. ダメージ計算エンジン (`damage-calculator.ts`)

#### マスターダメージ計算式

```
D_final = D_base × M_crit × defAmend × erAmend
```

参考: [AutumnVN's Stella Sora Damage Analysis](https://gist.github.com/AutumnVN/91afd7a37a9743488419b70f07225950)

#### 主要関数

##### `calculateBaseDamage()`
基礎ダメージを計算します。

```typescript
D_base = ATK_total × (Skill% + Talent%) × (1 + DMG_Bonus%)
```

**重要**: スキル倍率とタレント倍率は**加算関係**です（乗算ではありません）。

##### `calculateCriticalDamage()`
クリティカル補正を適用します。

```typescript
// クリティカル発生時
M_crit = 1 + CritDamage

// 期待値
Expected = (1 - CritRate) × BaseDamage + CritRate × (BaseDamage × M_crit)
```

##### `calculateDefenseAmendment()`
防御力による軽減率を計算します。

```typescript
// 実効防御力の計算
Eff_DEF = (Enemy_DEF × (1 - DefIgnore%)) - DefPenetrate_Flat

// 防御補正係数
defAmend = C / (C + Eff_DEF)
```

**計算順序が重要**: パーセンテージ無視 → 固定値貫通

##### `calculateElementalResistanceAmendment()`
属性耐性補正を計算します（二次曲線モデル）。

```typescript
NetResist = Enemy_Resist - Resist_Shred
erAmend = NetResist / (1 + 0.1 × (NetResist - V_lower)²)
FinalMultiplier = 1 - erAmend
```

#### 使用例

```typescript
import { calculateFinalDamage } from '@/lib/damage-calculator'

const input = {
  totalAtk: 1500,
  skillMultiplier: 200, // 200%
  talentMultiplier: 20, // +20%
  damageBonus: {
    skillDmg: 30,
    normalAtkDmg: 0,
    ultimateDmg: 0,
    elementalDmg: 15,
    totalDmg: 10,
  },
  critRate: 0.5, // 50%
  critDmg: 1.0, // 100%
  defensePen: {
    defIgnore: 0.2, // 20%
    defPenetrate: 100,
  },
  enemyDef: 500,
  elementalRes: {
    resistance: 0.1,
    resistShred: 0.05,
  },
  enemyResistance: 0.1,
}

const result = calculateFinalDamage(input)
console.log('最終ダメージ:', result.finalDamage)
console.log('期待値ダメージ:', result.expectedDamage)
```

### 2. ビルド評価システム (`build-evaluator.ts`)

#### スコアリングメトリクス

ビルドを以下の5つの観点から評価します：

1. **攻撃力スコア** (0-100点)
   - 総合攻撃力を評価
   - 基準値1000に対する相対評価

2. **防御力スコア** (0-100点)
   - 実効HP（EHP）を評価
   - `EHP = HP × (1 + DEF/100)`

3. **クリティカル効率スコア** (0-100点)
   - 会心率と会心ダメージのバランスを評価
   - `CritValue = CritRate × CritDmg`

4. **属性ダメージスコア** (0-100点)
   - ダメージボーナスと防御貫通を総合評価

5. **DPSスコア** (0-100点)
   - 秒間ダメージ出力を評価

#### 主要関数

##### `evaluateBuild()`
ビルドの総合評価を実行します。

```typescript
import { evaluateBuild } from '@/lib/build-evaluator'

const metrics = evaluateBuild(
  stats,      // BaseStats
  damageBonus, // DamageBonus
  defensePen,  // DefensePenetration
  dps,         // number
  weights      // ScoreWeights (オプション)
)

console.log('総合スコア:', metrics.totalScore)
console.log('内訳:', metrics.breakdown)
```

##### `compareBuilds()`
2つのビルドを比較します。

```typescript
import { compareBuilds } from '@/lib/build-evaluator'

const comparison = compareBuilds(metricsA, metricsB)
console.log('優れているビルド:', comparison.winner) // 'A' | 'B' | 'Draw'
console.log('スコア差:', comparison.difference.totalScore)
```

##### `suggestStatPriority()`
次に改善すべきステータスを提案します。

```typescript
import { suggestStatPriority } from '@/lib/build-evaluator'

const suggestion = suggestStatPriority(stats, damageBonus)
console.log('推奨改善ステータス:', suggestion.priority)
console.log('理由:', suggestion.reason)
```

#### スコアの重み設定

デフォルトの重み（DPS重視）:

```typescript
{
  attack: 0.2,         // 20%
  defense: 0.1,        // 10%
  critEfficiency: 0.25, // 25%
  elementalDamage: 0.2, // 20%
  dps: 0.25            // 25%
}
```

カスタム重みを設定することで、用途に応じた評価が可能です：

```typescript
// 生存重視の重み
const tankWeights = {
  attack: 0.15,
  defense: 0.35,
  critEfficiency: 0.15,
  elementalDamage: 0.15,
  dps: 0.2,
}

const metrics = evaluateBuild(stats, damageBonus, defensePen, dps, tankWeights)
```

### 3. ハーモニーシステム最適化 (`harmony-optimizer.ts`)

#### システム概要

『Stella Sora』のディスクシステムでは、**音符（Musical Notes）**を集めて**ハーモニースキル**を発動します。

- **メインスロット（3枠）**: スキルを提供、音符は提供しない
- **サポートスロット（3枠）**: 音符を提供、スキルは発動しない
- **音符提供数**: 3星=1個、4/5星=2個

#### 主要関数

##### `calculateHarmonyActivation()`
現在のディスク構成でのハーモニー発動状態を計算します。

```typescript
import { calculateHarmonyActivation } from '@/lib/harmony-optimizer'

const state = calculateHarmonyActivation(mainDiscs, supportDiscs)
console.log('発動中のハーモニー:', state.activeHarmonies.length)
console.log('音符プール:', state.notePool)
```

##### `optimizeSupportDiscs()`
メインディスクのハーモニー要件を満たす最適なサポートディスクを探索します。

```typescript
import { optimizeSupportDiscs } from '@/lib/harmony-optimizer'

const requirement = {
  mainDiscs: [disc1, disc2, disc3],
  requiredNotes: extractRequiredNotes(mainDiscs),
}

const result = optimizeSupportDiscs(requirement, availableDiscs)
console.log('推奨サポートディスク:', result.recommendedSupports)
console.log('発動可能なハーモニー数:', result.activeHarmonyCount)
console.log('未達成の要件:', result.unmetRequirements)
```

##### `filterDiscs()`
条件に基づいてディスクをフィルタリングします。

```typescript
import { filterDiscs } from '@/lib/harmony-optimizer'

const filtered = filterDiscs(allDiscs, {
  includeElements: ['Ignis', 'Aqua'],
  minRarity: 4,
})
```

#### 最適化アルゴリズム

現在の実装では、全組み合わせを評価する総当たり方式を使用しています。

**スコア計算式**:
```typescript
Score = (ActiveHarmonies / TotalHarmonies) × 100 + ExcessBonus
```

**注意**: 大規模なディスクデータベースでは、遺伝的アルゴリズムなどの最適化手法への移行を推奨します。

## データフロー

```
ユーザー入力
  ↓
[ダメージ計算エンジン]
  ├→ 基礎ダメージ計算
  ├→ クリティカル補正
  ├→ 防御力補正
  └→ 属性耐性補正
  ↓
[ビルド評価システム]
  ├→ 各メトリクスのスコア化
  ├→ 重み付き総合スコア計算
  └→ 改善提案生成
  ↓
[ハーモニー最適化]
  ├→ 音符要件抽出
  ├→ サポートディスク探索
  └→ 最適解の選定
  ↓
評価結果・推奨構成
```

## 今後の拡張予定

### 短期（フェーズ5）
- [ ] ユニットテストの完全実装
- [ ] 計算式の実データによる検証
- [ ] パフォーマンスベンチマーク

### 中期
- [ ] モノリスモード用のモンテカルロシミュレーション
- [ ] ポテンシャル（ランダムバフ）の確率的評価
- [ ] タイムラインシミュレーション（バーストタイミング最適化）

### 長期
- [ ] エンブレム（サブステータス）の厳選シミュレーション
- [ ] チーム編成の相性評価
- [ ] 敵ごとの最適ビルド自動生成

## 参考資料

- [Stella Sora Wiki - Disc](https://stellasora.miraheze.org/wiki/Disc)
- [AutumnVN's Damage Calculation Analysis](https://gist.github.com/AutumnVN/91afd7a37a9743488419b70f07225950)
- [StellaBase Database](https://stella.ennead.cc)
- [StellaSoraAPI](https://github.com/torikushiii/StellaSoraAPI)

## ライセンス

MIT License
