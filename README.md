# tournament_overlay
ビーセイ大会用オーバーレイです。

![preview](https://rynan4818.github.io/tournament_overlay1.png)

## 主な特徴
- 曲時間、スコア、精度、コンボ数、ミス数のみのシンプルで見やすい表示です (曲名などの譜面情報は主催者側で用意)
- プレイ終了後も非表示しないため、結果の確認が容易です
- Fail後もスコアが50%にならず、Fail有無同士でもスコア比較が可能です
- NFを付けずにプレイ開始した場合に **No NF!** と表示します。また、Failしたときに **Failed** と表示します

![preview](https://rynan4818.github.io/tournament_overlay2.png)

## 使用方法

[Beat Saber HTTP Status](https://github.com/opl-/beatsaber-http-status)または、[HttpSiraStatus](https://github.com/denpadokei/beatsaber-http-status)を使用して、下記URLをOBSのブラウザソースに設定して使用可能です。

※プログラム修正時に自動反映させるため、ダウンロードせずに下記URLでお使い下さい。

※表示位置はデフォルトで上部になっています。OBSの設定で好きな位置に移動可能ですが、大会では視聴者は頻繁に見比べることになるため上部で統一されている方が見やすいと思います。

## 720p(1280x720)用
```
https://rynan4818.github.io/tournament_overlay/
```
## 1080p(1920x1080)用 (上記の1.5倍スケール)
```
https://rynan4818.github.io/tournament_overlay/?modifiers=scale
```

## 初めての方向けの詳しい説明

1. HTTP Status または HttpSiraStatus のインストール

    Beat Saberからオーバーレイにデータを送信するために下記のどちらか一方のmodをインストールしてください。

   - [Beat Saber HTTP Status](https://github.com/opl-/beatsaber-http-status) (2022/4/29現在 BeatSaber1.19.1まで対応)

       ModAssistantからインストールします。
       
      ![image](https://rynan4818.github.io/beatsaber-overlay-httpstatus.png)
  
   - [HttpSiraStatus](https://github.com/denpadokei/HttpSiraStatus/releases)  (2022/4/29現在 BeatSaber1.20.0以降の方はこちらのみ対応)
   
       上記からダウンロードして解凍した`HttpSiraStatus.dll`をBeatSaberのインストールフォルダの`Plugins`フォルダにコピーします。
       
       ダウンロードするzipファイル名の`bs*.**.**`の部分が自分の使用しているBeatSaberのバージョンと同じか、小さくて一番近いものを使用してください。
   
      ![image](https://rynan4818.github.io/beatsaber-overlay-denpadokei.png)

   HTTP Status、HttpSiraStatus どちらも、ModAssistantにある**websocket-sharpのインストールが必須**です。
   
   入れ忘れトラブルが多いので注意して下さい。

   ![image](https://rynan4818.github.io/beatsaber-overlay-websocket-sharp.png)
   
   ModAssistantにもwebsocket-sharpが未登録な場合は[BEATMODS](https://beatmods.com/#/mods)で、1つ前の`Game Version`から`websocket-sharp`を`Download Zip`してインストールも可能です。websocket-sharpはBeatSaberのアップデートと無関係なため旧Game Version用を使用しても基本的に問題ありません。

2. OBSのソースにブラウザを追加します。

   ![image](https://rynan4818.github.io/beatsaber-overlay-obs-setting1.png)

3. 新規作成を選択して、適当にソースの名前を設定して、OKを押します。

   ![image](https://rynan4818.github.io/beatsaber-overlay-obs-setting2.png)

4. 上記アドレス `https://rynan4818.github.io/tournament_overlay/` を、OBSのURL欄に貼り付けます。

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
