# ビルドスコア計算機能

ステラソラの編成（ビルド）の性能を数値化する機能です。

## 概要

キャラクター3人とロスレコ3つの編成に対して、各素質・スキルの効果を分析し、総合的な性能スコアを算出します。

## 主な機能

### 1. LLMによる効果解析

Google Gemini AI を使用して、スキルや素質の説明文から効果情報を自動抽出します。

- **対応する効果タイプ**: 14種類
  - ダメージ増加系: 全体、通常攻撃、スキル、必殺技、印、属性、追撃
  - ステータス増加系: 攻撃力、速度、会心率、会心ダメージ
  - デバフ系: 被ダメージ増加、防御力減少
  - その他: クールダウン減少

### 2. 戦闘シミュレーション

120秒間の戦闘をシミュレートし、各効果の稼働率を計算します。

- **通常攻撃**: 0.5秒間隔
- **スキル**: クールダウンベース
- **必殺技**: 60秒時点で発動
- **効果の稼働時間**: クールダウンと持続時間を考慮

### 3. スコア計算

効果を種類別に集計し、総合スコアを算出します。

- **加算効果**: ダメージ増加系は合算
- **乗算効果**: 攻撃力、会心率、速度などは乗算
- **総合スコア**: 全ての効果を統合した最終的なダメージ増加率

## 使用方法

### Server Actionの呼び出し

```typescript
import { calculateBuildPerformance } from 'actions/calculateBuildScore'

const buildInput = {
  characterIds: [125, 126, 127], // キャラクターID（3人）
  discIds: [214031, 214032, 214033], // ロスレコID（3つ）
}

const score = await calculateBuildPerformance(buildInput)

console.log(`総合スコア: ${score.totalScore.toFixed(2)}%`)
```

### スコアの解釈

```typescript
// 各効果の貢献度を確認
for (const contribution of score.effectContributions) {
  console.log(`${contribution.name}: +${contribution.averageIncrease.toFixed(2)}%`)
  console.log(`稼働率: ${(contribution.uptimeCoverage * 100).toFixed(1)}%`)
}

// 人間が読みやすい形式で出力
import { formatBuildScore } from 'lib/build-score-calculator'
console.log(formatBuildScore(score))
```

## 環境変数

### 必須

- `GEMINI_API_KEY`: Google Gemini AI API キー

### 設定方法

1. `.env.local` ファイルを作成
2. 以下を追加:

```bash
GEMINI_API_KEY=your-api-key-here
```

## キャッシュ戦略

### LLM結果のキャッシュ

- **期間**: 7日間
- **理由**: 効果情報は頻繁に変わらないため長期間キャッシュ可能

### APIデータのキャッシュ

- **期間**: 4時間
- **理由**: キャラクター・ロスレコデータは定期的に更新される可能性がある

## テスト

```bash
# 個別のテストを実行
yarn test src/lib/gemini-effect-parser.test.ts
yarn test src/lib/combat-simulation.test.ts
yarn test src/lib/build-score-calculator.test.ts

# 全てのテストを実行
yarn test:run
```

## アーキテクチャ

```
calculateBuildPerformance (Server Action)
├── fetchCharacterDetail (API)
├── fetchDiscDetail (API)
├── convertTalentsToEffectInfo (LLM)
│   └── Gemini AI (効果情報の抽出)
├── convertDiscSkillsToEffectInfo (LLM)
│   └── Gemini AI (効果情報の抽出)
├── simulateCombat (戦闘シミュレーション)
│   └── 120秒間のアクション実行
└── calculateBuildScore (スコア計算)
    └── 加算・乗算ルールに基づく総合評価
```

## 制限事項

### 現在の実装

- 主力スキルは簡易的に定義されている（実際のゲームデータに基づいた調整が必要）
- シミュレーションは理想的な状況を仮定している
- 一部の複雑な効果（条件付き発動など）は簡略化されている

### 今後の改善点

- 実際のゲームデータに基づいたスキルクールダウンの設定
- より詳細な戦闘ロジックの実装
- 条件付き効果の正確な処理
- ダメージ計算式の精密化

## トラブルシューティング

### GEMINI_API_KEYが設定されていない

エラーメッセージ:
```
GEMINI_API_KEY is not configured
```

解決方法:
1. `.env.local` に `GEMINI_API_KEY` を設定
2. アプリケーションを再起動

### API呼び出しの失敗

エラーメッセージ:
```
Failed to fetch character detail: 404
```

解決方法:
- キャラクターIDまたはロスレコIDが正しいか確認
- StellaSora API が利用可能か確認

### LLM変換の失敗

エラーメッセージ:
```
効果情報の変換に失敗しました
```

解決方法:
- API キーが正しいか確認
- Gemini AI の利用制限に達していないか確認
- ネットワーク接続を確認

## 参考資料

- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [StellaSora API Documentation](https://github.com/torikushiii/StellaSoraAPI)
- [Next.js unstable_cache](https://nextjs.org/docs/app/api-reference/functions/unstable_cache)
