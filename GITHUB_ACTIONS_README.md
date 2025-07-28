# GitHub Actions: developマージ済みPR一覧自動表示機能

## 概要

このGitHub Actionsワークフローは、`main` → `release` のPR作成時に、`develop`ブランチにマージ済みでまだ`release`ブランチにマージされていないPR一覧を自動でPR説明に表示する機能を実装します。

## 実装内容

### 1. ファイル構成

```
.github/
├── actions/
│   └── update-release-pr/
│       └── action.yml          # Composite Action
├── workflows/
│   └── update-release-pr.yml   # メインワークフロー
└── pull_request_template.md    # PRテンプレート
```

### 2. 機能仕様

#### ワークフロートリガー
- `main` → `release` または `release-v2` へのPR作成時に自動実行
- PR更新時も実行

#### Composite Action の入力パラメータ
- `base-branch`: 比較対象のベースブランチ (例: `release`)
- `head-branch`: PR一覧を取得するヘッドブランチ (例: `develop`)
- `exclude-labels`: 除外するラベルのカンマ区切りリスト (例: `deploy,test`)
- `pr-template-file-path`: PRテンプレートファイルのパス (例: `./.github/release-pr.md`)
- `github-token`: GitHub API アクセス用トークン

#### 自動取得するPR情報
- PR番号 (`$PR_NUMBER`)
- タイトル (`$PR_TITLE`) 
- 作成者 (`$PR_USER`)

#### 出力例
```markdown
## developブランチからのマージ済みPR一覧
- $PR_NUMBER #123 $PR_TITLE 新機能A実装 $PR_USER @user1
- $PR_NUMBER #124 $PR_TITLE バグ修正B $PR_USER @user2
- $PR_NUMBER #125 $PR_TITLE UI改善C $PR_USER @user3
```

### 3. エラーハンドリング

- `develop`ブランチが存在しない場合は`main`ブランチをフォールバックとして使用
- ベースブランチが存在しない場合はエラーで終了
- マージ済みPRが見つからない場合は適切なメッセージを表示
- 指定されたラベルを持つPRは除外
- GitHub API エラー時の適切な処理

## 使用方法

### 1. 自動実行
通常の`main` → `release`のPR作成時に自動で実行されます。

### 2. Composite Action の直接利用
```yaml
- name: Update Release PR
  uses: ./.github/actions/update-release-pr
  with:
    base-branch: 'release'
    head-branch: 'develop'
    exclude-labels: 'deploy,test,skip-release'
    pr-template-file-path: './.github/release-pr.md'
    github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 3. 手動実行
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
2. **マージ済みPR取得**: git log を使用してベースブランチにない merge commit を特定
3. **PR詳細取得**: GitHub CLI を使用してPR詳細を取得
4. **ラベルフィルタリング**: 除外ラベルを持つPRを除外
5. **PR説明更新**: プレースホルダーを置き換えて更新

### ブランチ比較ロジック
```bash
# ヘッドブランチにあってベースブランチにないマージコミットを取得
git log --oneline origin/$HEAD_BRANCH ^origin/$BASE_BRANCH --merges --format="%H"
```

### フォールバック機能
- `head-branch`不存在時は`main`ブランチを使用
- `base-branch`不存在時はエラーで終了

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
2. **マージ済みPR取得**: git log を使用してベースブランチにない merge commit を特定
3. **PR詳細取得**: GitHub CLI を使用してPR詳細を取得
4. **ラベルフィルタリング**: 除外ラベルを持つPRを除外
5. **PR説明更新**: プレースホルダーを置き換えて更新

### フォールバック機能
- `head-branch`不存在時は`main`ブランチを使用
- `base-branch`不存在時はエラーで終了

## テスト

### 基本テスト
```bash
# ワークフローの構文チェック
python -c "import yaml; yaml.safe_load(open('.github/workflows/update-release-pr.yml'))"

# Composite Action の構文チェック  
python -c "import yaml; yaml.safe_load(open('.github/actions/update-release-pr/action.yml'))"

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

### 除外ラベルの変更
Composite Action の入力パラメータを変更:
```yaml
with:
  exclude-labels: 'deploy,test,skip-release'
```

### 表示形式の変更
Composite Action の実装を修正してPR情報の表示形式をカスタマイズ可能:
```bash
PR_LINE="- \$PR_NUMBER #$PR_NUMBER \$PR_TITLE $PR_TITLE \$PR_USER @$PR_AUTHOR"
```

## トラブルシューティング

### よくある問題

1. **ワークフローが実行されない**
   - PRのベースブランチが`release`または`release-v2`であることを確認
   - ヘッドブランチが`main`であることを確認

2. **PR一覧が表示されない** 
   - `head-branch`ブランチの存在を確認
   - GitHubトークンの権限を確認
   - 除外ラベルの設定を確認

3. **プレースホルダーが更新されない**
   - PRテンプレートに`<!-- MERGED_PRS_LIST -->`マーカーが存在することを確認

4. **特定のPRが除外されない**
   - `exclude-labels`の設定を確認
   - PRに正しいラベルが設定されているかを確認

## セキュリティ

- `GITHUB_TOKEN`を使用してGitHub APIにアクセス
- 最小権限の原則に従った権限設定
- `pull_request_target`イベントの安全な使用
- Composite Action による機能のモジュール化