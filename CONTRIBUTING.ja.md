[English](CONTRIBUTING.md) | 日本語

# コントリビュートガイド

cat-skillsへの貢献に興味を持っていただきありがとうございます。

## 参加方法

### バグ報告

バグ報告テンプレートを使ってIssueを作成してください。以下の情報を含めてください。

- 対象のスキル名
- 再現手順
- 期待される動作と実際の動作
- 使用しているエージェント（Claude Code、Cursor、Codexなど）とバージョン

### 機能の提案

機能リクエストテンプレートを使ってIssueを作成してください。

- 解決したい課題
- 提案する解決方法
- 対象のスキル（または新しいスキルのアイデア）

### コードの提出

1. リポジトリをフォーク
2. ブランチを作成 (`git checkout -b feat/your-feature`)
3. 変更を加える
4. エージェント上でスキルを手動テスト
5. [Conventional Commits](https://www.conventionalcommits.org/) に従ってコミット:
   - `feat:` 新機能・新スキル
   - `fix:` バグ修正
   - `docs:` ドキュメント
   - `chore:` メンテナンス
   - `refactor:` リファクタリング
6. プッシュしてPRを作成

### 新しいスキルの作成

各スキルは `skills/<name>/` に配置し、以下のファイルが必要です。

- `SKILL.md` — YAMLフロントマター付きのスキル定義（`name`、`status`、`description`、`trigger`）
- `.claude-plugin/plugin.json` — マーケットプレイスメタデータ

開発中は、フロントマターで `status: dev` を設定し、`.gitignore` に `skills/<name>/` を追加してください。公開時に `status: published` に変更し、gitignoreのエントリを削除します。

既存のスキルディレクトリを参考にしてください。

### PRガイドライン

- 1つのPRにつき1つのスキルまたは1つの修正に絞る
- スキルの追加・名前変更時はREADMEを更新する
- AGENTS.mdに新しいスキルのエントリを追加する
- 公開スキルの場合は `.claude-plugin/marketplace.json` も更新する
- PRテンプレートをすべて記入する

## コードスタイル

スキルはコードではなくMarkdownの命令セットです。品質基準は以下の通りです。

- **巧妙さより明確さ。** 初見のLLMが曖昧さなく理解できること。
- **スタブ禁止。** 記述されたワークフローはすべて完全で実行可能であること。
- **テストすること。** 提出前に、少なくとも1つのエージェントでスキルを実行すること。

## バージョニングとリリース

cat-skills は [セマンティックバージョニング](https://semver.org/lang/ja/)（`vMAJOR.MINOR.PATCH`）に従い、リリースボットは使わず手動でバージョンを上げます。パッケージレジストリには公開していないため、バージョン番号は自動化された契約ではなく、人間が読むためのシグナルです。

| 上げ方 | タイミング |
|-------|-----------|
| **MAJOR** | スキルの削除・リネーム、または既存のインストールが対応を迫られるマーケットプレイス構造の変更 |
| **MINOR** | 新しいスキルの追加、または既存スキルへの大きな機能追加 |
| **PATCH** | バグ修正、ドキュメント・文言の変更、プラットフォームフォルダの再ビルド |

バージョンの正本は `.claude-plugin/marketplace.json` の `metadata.version` です。リリースの手順:

1. `marketplace.json` の `metadata.version` を新しいタグに合わせて更新
2. その変更をコミット
3. タグを付ける: `git tag v2.1.0 && git push --tags`
4. GitHub リリースを作成: `gh release create v2.1.0 --notes "..."`

リリースノートは手書きです。ラベル付きのPR経由でコントリビュートされた場合、`.github/release.yml` が項目を自動分類します（New Skills、Features、Bug Fixes など）。スキルを追加するPRには `new-skill` ラベルを付けてください。

## ライセンス

コントリビュートされたコードは [MITライセンス](LICENSE) の下でライセンスされます。
