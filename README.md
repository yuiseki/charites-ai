# charites-ai

## これは何？

- `charites-ai` は、自然言語による指示に基づいて、Mapbox style specification に従った json ファイルを生成することができる AI です
- この AI は、[@unvt/charites](https://github.com/unvt/charites)を活用しています

## 環境構築

- Node.js がインストールされていることが前提です
- npm がインストールされていることも前提です
- 以下のコマンドを実行してください

```bash
export OPEN_AI_API_KEY=*****
git clone ...
cd charites-ai
npm ci
npm run build
cd docs
npx http-server
```

- ブラウザで `http://localhost:8080` にアクセスしてください
- 地図が表示されていることを確認してください

## charites-ai の使い方

- `npx http-server` は実行したままの状態で、以下のようなコマンドを実行してください

```bash
npm run embed -- 国の背景を青色で表示してください && npm run build
```

- ブラウザで `http://localhost:8080` にアクセスしてください
- 国が青色で地図が表示されていることを確認してください
- 以下のようなコマンドを実行してください

```bash
npm run embed -- 国の背景を黄色で表示してください && npm run build
```

- ブラウザで `http://localhost:8080` にアクセスしてください
- 国が黄色で地図が表示されていることを確認してください

## charites-ai の仕組み

- Mapbox style specification に従った json ファイルは非常に巨大なものであるため、2023 年 12 月現在、LLMs で扱うことが困難です
- charites は、複数に分割された YAML ファイルを結合して、Mapbox style specification に従った json ファイルを生成することができます
- charites-ai は、charites の機能を活用して、自然言語による指示に基づいて、それぞれの YAML ファイルを編集することができます
- これを実現するために、それぞれの YAML ファイルに対して、詳細なコメントを追加しました
- そして、それらのコメントを解析する処理を実装しました
- 自然言語による指示が与えられたとき、charites-ai は、その指示に最も適した YAML ファイルを選択し、それを編集します
- そして、charites が、編集された YAML ファイルを結合して、Mapbox style specification に従った json ファイルを生成します
