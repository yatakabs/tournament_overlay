# tournament_overlay
ビーセイ大会用オーバーレイです。

![preview](https://rynan4818.github.io/tournament_overlay1.png)

## 主な特徴
- 曲時間、スコア、精度、コンボ数、ミス数のみのシンプルで見やすい表示です (曲名などの譜面情報は主催者側で用意)
- プレイ終了後も非表示しないため、結果の確認が容易です
- Fail後もスコアが50%にならず、Fail有無同士でもスコア比較が可能です
- NFを付けずにプレイ開始した場合に **No NF!** と表示します

![preview](https://rynan4818.github.io/tournament_overlay2.png)

## 使用方法

[Beat Saber HTTP Status](https://github.com/opl-/beatsaber-http-status)または、[HttpSiraStatus](https://github.com/denpadokei/beatsaber-http-status)を使用して、下記URLをOBSのブラウザソースに設定して使用可能です。

※プログラム修正時に自動反映させるため、ダウンロードせずに下記URLでお使い下さい。

## 720p(1280x720)用
```
https://rynan4818.github.io/tournament_overlay/
```
## 1080p(1920x1080)用 (上記の1.5倍スケール)
```
https://rynan4818.github.io/tournament_overlay/?modifiers=scale
```

## 初めての方向けの詳しい説明

1. HTTP Statusのインストール

    Beat Saberからオーバーレイにデータを送信するために下記のmodをインストールしてください。

   ModAssistantを使用する場合は依存modが自動的にインストールされるため簡単です。

   - [Beat Saber HTTP Status](https://github.com/opl-/beatsaber-http-status)

      ![image](https://rynan4818.github.io/beatsaber-overlay-httpstatus.png)
	
   もし、BeatSaberのバージョンアップ直後などでModAssistantに登録が無い時は、手動でインストールが必要です。

   その場合は、ModAssistantにある**websocket-sharpのインストールが必須**です。入れ忘れトラブルが多いので注意して下さい。

   ![image](https://rynan4818.github.io/beatsaber-overlay-websocket-sharp.png)

2. OBSのソースにブラウザを追加します。

   ![image](https://rynan4818.github.io/beatsaber-overlay-obs-setting1.png)

3. 新規作成を選択して、適当にソースの名前を設定して、OKを押します。

   ![image](https://rynan4818.github.io/beatsaber-overlay-obs-setting2.png)

4. 上記のアドレスを、OBSのURL欄に貼り付けます。

   ![image](https://rynan4818.github.io/tournament_overlay3.png)

   ※画面サイズに合わせてサイズを設定します。(1280x720等)
  
   1080p(1920x1080)サイズの場合、1.5倍に拡大するため末尾に `?modifiers=scale` を追加して下さい。

   ![image](https://rynan4818.github.io/tournament_overlay4.png)

5. オーバーレイのソースの順序をゲームのソースよりも優先度を上げて、オーバーレイがゲーム画面に重ねて表示されるようにします。

    ![image](https://rynan4818.github.io/beatsaber-overlay-obs-setting8.png)

## 動作しない場合
もしも動作しない場合は、Beat Saber Overlay 改良版の[トラブルシューティング](https://github.com/rynan4818/beat-saber-overlay/blob/master/Troubleshooting.md)を参照してください。

## 備考
index.html, bsdp-like_d.html, bsdp-like.css は[BSDP-Overlay](https://github.com/kOFReadie/BSDP-Overlay)を元に改造しています。
