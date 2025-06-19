# charites-ai

<a href="https://stackblitz.com/~/github/yuiseki/charites-ai">
  <img
    alt="Open in StackBlitz"
    src="https://developer.stackblitz.com/img/open_in_stackblitz.svg"
  />
</a>
<a href="https://app.codeanywhere.com/#https://github.com/yuiseki/charites-ai">
  <img
    alt="Open in Codeanywhere"
    src="https://codeanywhere.com/img/open-in-codeanywhere-btn.svg"
  />
</a>

## これは何？

- `charites-ai` は、自然言語による指示に基づいて、Mapbox style specification に従った json ファイルを生成することができる AI です
- この AI は、[@unvt/charites](https://github.com/unvt/charites)を活用しています

## Demo

[![Image from Gyazo](https://i.gyazo.com/b26f7803974e840f5706cf5ae6c7d1e6.gif)](https://gyazo.com/b26f7803974e840f5706cf5ae6c7d1e6)

## 環境構築

- Node.js がインストールされていることが前提です
- npm がインストールされていることも前提です
- 以下のコマンドを実行してください

```bash
export OPENAI_API_KEY=*****
git clone ...
cd charites-ai
npm ci
npm run dev
```

- ブラウザで `http://localhost:5173/` にアクセスしてください
- 地図が表示されていることを確認してください

## charites-ai の使い方

- `npm run dev` は実行したままの状態で、以下のようなコマンドを実行してください

```bash
npm run instruct -- 国の名前を黄色で表示して
```

- ブラウザで `http://localhost:5173/` にアクセスしてください
- 国の名前が黄色になった地図が表示されていることを確認してください
- 以下のようなコマンドを実行してください

```bash
npm run instruct -- 国の名前を青色で表示して
```

- ブラウザで `http://localhost:5173/` にアクセスしてください
- 国の名前が青色に変化した地図が表示されていることを確認してください

## charites-ai の仕組み

- Mapbox style specification に従った json ファイルは非常に巨大なものであるため、2023 年 12 月現在、LLMs で扱うことが困難です
- charites は、複数に分割された YAML ファイルを結合して、Mapbox style specification に従った json ファイルを生成することができます
- charites-ai は、charites の機能を活用して、自然言語による指示に基づいて、それぞれの YAML ファイルを編集することができます
- これを実現するために、それぞれの YAML ファイルに対して、詳細なコメントを追加しました
- そして、それらのコメントを解析する処理を実装しました
- 自然言語による指示が与えられたとき、charites-ai は、その指示に最も適した YAML ファイルを選択し、それを編集します
- そして、charites が、編集された YAML ファイルを結合して、Mapbox style specification に従った json ファイルを生成します
