[English](README.md) | 日本語

# cat-skills

[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-11-8B5CF6)](https://skills.sh/catcatcatstudio/cat-skills)

AIコーディングエージェント向けのスキルパッケージです。Claude Code、Cursor、Codex をはじめ、40以上のエージェントに対応しています。

スキルは、AIエージェントに専門的な能力を追加する独立した命令セットです。ナレッジ抽出、段階的ビルド、自律ワークループ、テスト基盤など、それぞれが単体で動作します。スキル間の依存関係はありません。

[catcatcat](https://catcatcat.ai) が開発しています。

## クイックスタート

1. すべてのスキルをインストール:
   ```bash
   npx skills add catcatcatstudio/cat-skills
   ```
2. コマンドを入力して使用（例: `/notebook`、`/architect`、`/eat`）

**Claude Code プラグインで個別にインストールする場合:**

```
/plugin marketplace add catcatcatstudio/cat-skills
/plugin install notebook@catcatcat
```

## 概要

| スキル | コマンド | 機能 |
|-------|---------|------|
| [Notebook](#notebook--プロジェクトノート) | `/notebook` | プロジェクトノート。コンテキスト消失と推論ループを防止 |
| [Architect](#architect--段階的ビルド) | `/architect` | 段階的ビルド。スパイク、設計、計画、実装のライフサイクル管理 |
| [Eat](#eat--ナレッジ抽出) | `/eat` | あらゆるURLからナレッジを抽出。YouTube、記事、ポッドキャスト、Xスレッド対応 |
| [Recon](#recon--事前調査) | `/recon` | ビルド前のリサーチ。ベストプラクティス、落とし穴、アーキテクチャ調査 |
| [Xray](#xray--xtwitter-コンテンツインテリジェンス) | `/xray` | X/Twitter分析。スカウト、パルスチェック、トラッキング、ミラー、プロスペクト |
| [Elevate](#elevate--エキスパート昇格) | `/elevate` | モデルを実行者からクリティカルなエキスパートアドバイザーに切り替え |
| [Prodev](#prodev--エンジニアリング基準) | `/prodev` | エンジニアリング基準の強制。オーナーシップ、影響範囲思考、反追従性 |
| [Memento](#memento--コンテキスト引き継ぎ) | `/memento` | セッション知識を保存し、新しいチャットへの引き継ぎブロックを生成 |
| [Liquid Cat Physics](#liquid-cat-physics--自律ディープワークループ) | `/liquid-cat-physics` | 信頼度ゲート付きの自律ディープワークループ |
| [Fortify](#fortify--テスト基盤) | `/fortify` | スタック検出、テスト導入、カバレッジ監査、ミューテーションテスト |
| [No-Stubs](#no-stubs--スタブ検出と除去) | `/no-stubs` | スタブ実装とデッドコードを検出して修正 |

---

## スキル詳細

### Notebook — プロジェクトノート

コンテキスト消失と推論ループを防ぎます。意思決定、失敗、学びの記録を管理します。

| コマンド | 機能 |
|---------|------|
| `/notebook` | 初期化またはステータス表示 |
| `/notebook save` | ノートを即座に書き込み。タイプと内容を自動推論 |
| `/notebook recover` | 既存ノートからコンテキストを再構築 |
| `/notebook migrate` | 既存のメモをnotebook形式に変換 |

**ソース:** [`skills/notebook/SKILL.md`](./skills/notebook/SKILL.md)

### Architect — 段階的ビルド

ソフトウェアプロジェクトを構造化されたライフサイクルで進めます。AIコーディングで最も多い失敗パターン、大きな計画のコンテキストを見失って抜け漏れが発生する問題を解決します。

| フェーズ | 内容 |
|---------|------|
| 0 | テクニカルスパイク。最もリスクの高い制約を検証 |
| 1 | 設計ノート。ドメインごとに1つ、コードなし |
| 1.5 | ビルド順序。依存グラフとステージの順序決定 |
| 2+ | ステージを書き、ビルド、検証、繰り返し |

**ソース:** [`skills/architect/SKILL.md`](./skills/architect/SKILL.md)

### Eat — ナレッジ抽出

あらゆるURLやコンテンツから、転用可能なナレッジを抽出します。YouTube、Instagram、TikTok、Xの動画、ポッドキャスト、記事、Xスレッド、PDFに対応しています。

パイプライン: ダウンロード → 文字起こし (Whisper/Groq) → フレーム抽出 → ビジュアル評価 → ナレッジ統合

広告、フィラー、自己宣伝などのノイズを除去し、フレームワーク、メソッド、具体的な数値、実践者の本音といったシグナルを保持します。

| ソース | 方法 |
|--------|------|
| YouTube | 字幕 → Groq → ローカルWhisper |
| Instagram / TikTok / X動画 | yt-dlp + cookies → Whisper → フレーム抽出 |
| ポッドキャスト / 音声 | yt-dlp → Groq / Whisper |
| X/Twitterスレッド | X API v2 |
| Web記事 | defuddle → WebFetchフォールバック |
| ローカルファイル / PDF | 直接読み込み |

**必須:** yt-dlp、ffmpeg **文字起こし:** whisper (ローカル) または GROQ_API_KEY **オプション:** defuddle、X_BEARER_TOKEN、SNS用ブラウザcookies。[セットアップ手順](./skills/eat/SKILL.md#setup--dependencies)を参照してください。

**ソース:** [`skills/eat/SKILL.md`](./skills/eat/SKILL.md)

### Recon — 事前調査

ビルドを始める前に、ベストプラクティス、よくある落とし穴、アーキテクチャの判断、セキュリティ上の懸念、ユーザーの期待を調査します。シニアエンジニアが最初の1週間でコードを書く前に聞く質問を網羅しています。

**ソース:** [`skills/recon/SKILL.md`](./skills/recon/SKILL.md)

### Xray — X/Twitter コンテンツインテリジェンス

グラフベースのX分析ツールです。関わりのあるアカウントのソーシャルグラフを構築し、リプライ機会のスカウト、トピックレーンのパルスチェック、競合のトラッキング、自アカウントのパフォーマンスミラー、クライアント候補のプロスペクトを実行します。

| コマンド | 機能 |
|---------|------|
| `scout` | リプライ機会を鮮度、エンゲージメント、競合度でスコアリング |
| `pulse <lane>` | 特定トピックレーンの現在のトレンド |
| `track` | ウォッチしているアカウントのトップ投稿 |
| `mirror` | 自アカウントのパフォーマンス分析 |
| `prospect` | ローンチしたばかりのファウンダー（クライアント候補） |

セットアップインタビュー、8つのレーンプリセット、フルアーカイブ検索、コストトラッキングを含みます。

**ソース:** [`skills/xray/`](./skills/xray/) · [README](./skills/xray/README.md)

### Elevate — エキスパート昇格

メタ認知スキルです。モデルを従順な実行者からクリティカルなエキスパートアドバイザーに切り替えます。ドメインを特定し、トップレベルの実践者の視点を採用して、現在の作業を引き上げるための提案をランク付きで出力します。

UI/UX、コピーライティング、アーキテクチャ、コード、戦略、ブランディングなど、あらゆるドメインで機能します。

**ソース:** [`skills/elevate/SKILL.md`](./skills/elevate/SKILL.md)

### Prodev — エンジニアリング基準

Claudeをシニアエンジニアとして動作させます。すべての判断、すべてのコード行、すべての仮定に対する評価基準を具体的に変えるスキルです。

根本原因の追究、レイヤー意識、リサーチプロトコル、最新パターンの採用、影響範囲思考、呼び出し元視点のAPI設計、反追従性、セルフレビューをカバーするフィールドマニュアルを読み込みます。

「もっと頑張れ」ではなく、セッション内のすべてのインタラクションで挙動を変える具体的な基準です。

**ソース:** [`skills/prodev/SKILL.md`](./skills/prodev/SKILL.md)

### Memento — コンテキスト引き継ぎ

未保存のセッション知識をnotebookに保存し、新しいチャット用のコンパクトなオリエンテーションブロックを生成します。Claude Codeのコンテキストウィンドウがいっぱいになった際に、会話コンテキストを保存して再注入する自動コンパクションセーフティネットも含まれています。

| コマンド | 機能 |
|---------|------|
| `/memento` | Notebookトリアージ + 引き継ぎ生成 |
| `/memento auto on` | 自動コンパクションセーフティネットを有効化 |
| `/memento auto off` | 自動モードを無効化 |

**ソース:** [`skills/memento/`](./skills/memento/) · [README](./skills/memento/README.md)

### Liquid Cat Physics — 自律ディープワークループ

Claudeを自身のプロジェクトマネージャーにします。プロジェクト状態を読み取り、エキスパートの視点で次のアクションを判断し、信頼度チェックを通過したものだけを実行し、すべてを永続化して10分ごとにループします。

| コマンド | 機能 |
|---------|------|
| `/liquid-cat-physics` | ループを開始（デフォルト10分間隔） |
| `/liquid-cat-physics status` | 現在の状態を表示 |
| `/liquid-cat-physics stop` | ループを一時停止 |

3段階の信頼度ゲート（GREEN/YELLOW/RED）、2ストライクのアンチスラッシングルール、自動チェックポイント、組み込みエキスパートレンズを備えています。デフォルトでmemento autoを有効にします。

**ソース:** [`skills/liquid-cat-physics/`](./skills/liquid-cat-physics/) · [README](./skills/liquid-cat-physics/README.md)

### Fortify — テスト基盤

スタックを自動検出し、テストエコシステム全体を導入します。未テストのクリティカルパスを監査し、エラーパスを重視したテストを作成、実行後にミューテーションテストでバグ検出力を検証します。

| コマンド | 機能 |
|---------|------|
| `/fortify setup` | テスト基盤のみインストール |
| `/fortify check` | カバレッジ監査、ギャップの検出 |
| `/fortify` | フルセットアップ + テスト作成 + 検証 |

**ソース:** [`skills/fortify/SKILL.md`](./skills/fortify/SKILL.md)

### No-Stubs — スタブ検出と除去

コードベースからスタブ実装、フェイクコード、デッドワイヤリングをスキャンします。ハードコードされた戻り値、TODOプレースホルダー、未接続のモジュール、常にパスする認証などを検出し、影響範囲でトリアージした上で、本物の実装に置き換えるかクリーンに削除します。

| コマンド | 機能 |
|---------|------|
| `/no-stubs scan` | 検出とレポートのみ |
| `/no-stubs fix` | 検出されたスタブをすべて修正 |
| `/no-stubs` | フルスキャン + 修正 |

**ソース:** [`skills/no-stubs/SKILL.md`](./skills/no-stubs/SKILL.md)

---

## おすすめの組み合わせ

**`architect` + `notebook`** — Architectはnotebook形式でネイティブに書き込みます。Notebookはその上にプロアクティブな保存、コンテキスト回復、レッスントラッキングを追加します。同じストレージ形式を共有しつつ、独立して動作します。

**`liquid-cat-physics` + `memento`** — LCPはセッション間の永続化（PROJECT_STATE.md、notebook）を担当し、Mementoはコンパクション間の永続化（会話トレース）を担当します。組み合わせることで、あらゆる境界でコンテキストを失わない永続的な自律ループが実現します。

---

## コントリビュート

コントリビュート大歓迎です。詳しくは [CONTRIBUTING.ja.md](CONTRIBUTING.ja.md) をご覧ください。

## ライセンス

[MIT](LICENSE) © catcatcat
