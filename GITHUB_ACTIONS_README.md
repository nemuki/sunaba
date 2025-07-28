# GitHub Actions: developマージ済みPR一覧自動表示機能

## 概要

このGitHub Actionsワークフローは、`main` → `release` のPR作成時に、`develop`ブランチにマージ済みのPR一覧を自動でPR説明に表示する機能を実装します。

## 実装内容

### 1. ファイル構成

```
.github/
├── workflows/
│   └── update-release-pr.yml  # メインワークフロー
└── pull_request_template.md   # PRテンプレート
```

### 2. 機能仕様

#### ワークフロートリガー
- `main` → `release` または `release-v2` へのPR作成時に自動実行
- PR更新時も実行

#### 自動取得するPR情報
- PR番号
- タイトル  
- 作成者
- マージ日時

#### 出力例
```markdown
## developブランチからのマージ済みPR一覧
- #123 新機能A実装 (@user1) - 2025-07-25
- #124 バグ修正B (@user2) - 2025-07-26
- #125 UI改善C (@user3) - 2025-07-27
```

### 3. エラーハンドリング

- `develop`ブランチが存在しない場合は`main`ブランチをフォールバックとして使用
- マージ済みPRが見つからない場合は適切なメッセージを表示
- GitHub API エラー時の適切な処理

## 使用方法

### 1. 自動実行
通常の`main` → `release`のPR作成時に自動で実行されます。

### 2. 手動実行
```bash
# ワークフローを手動トリガーする場合
gh workflow run update-release-pr.yml
```

## 技術詳細

### 権限設定
```yaml
permissions:
  contents: read
  pull-requests: write
  issues: write
```

### 主要ステップ
1. **リポジトリチェックアウト**: 履歴を含めて取得
2. **マージ済みPR取得**: GitHub CLI を使用してAPIから取得
3. **PR説明更新**: プレースホルダーを置き換えて更新
4. **通知コメント**: 更新完了をPRにコメント

### フォールバック機能
- `develop`ブランチ不存在時は`main`ブランチを使用
- 共通履歴がない場合は過去30日のPRを取得

## テスト

### 基本テスト
```bash
# ワークフローの構文チェック
python -c "import yaml; yaml.safe_load(open('.github/workflows/update-release-pr.yml'))"

# PRテンプレートの確認
grep -q "<!-- MERGED_PRS_LIST -->" .github/pull_request_template.md
```

### 統合テスト
1. `main` → `release` のPRを作成
2. ワークフローの実行を確認
3. PR説明の自動更新を確認

## カスタマイズ

### ブランチ名の変更
`update-release-pr.yml`の以下の部分を修正:
```yaml
branches:
  - release        # ターゲットブランチ
  - release-v2     # 追加のリリースブランチ
```

### 表示形式の変更
`jq`クエリを修正してPR情報の表示形式をカスタマイズ可能:
```bash
--jq '.[] | "- #\(.number) \(.title) (@\(.author.login)) - \(.mergedAt | strptime("%Y-%m-%dT%H:%M:%SZ") | strftime("%Y-%m-%d"))"'
```

## トラブルシューティング

### よくある問題

1. **ワークフローが実行されない**
   - PRのベースブランチが`release`または`release-v2`であることを確認
   - ヘッドブランチが`main`であることを確認

2. **PR一覧が表示されない** 
   - `develop`ブランチの存在を確認
   - GitHubトークンの権限を確認

3. **プレースホルダーが更新されない**
   - PRテンプレートに`<!-- MERGED_PRS_LIST -->`マーカーが存在することを確認

## セキュリティ

- `GITHUB_TOKEN`を使用してGitHub APIにアクセス
- 最小権限の原則に従った権限設定
- `pull_request_target`イベントの安全な使用