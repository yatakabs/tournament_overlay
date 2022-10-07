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

[HttpSiraStatus](https://github.com/denpadokei/beatsaber-http-status)を使用して、下記URLをOBS等の配信ツールにブラウザソースとして設定して使用可能です。

※以下の配信ツールで動作確認済みです
- OBS Studio
- Streamlabs Desktop
- XSplit Broadcaster
- Twitch Studio Beta

※プログラム修正時に自動反映させるため、ダウンロードせずに下記URLでお使い下さい。

※表示位置はデフォルトで上部になっています。OBSの設定で好きな位置に移動可能ですが、大会では視聴者は頻繁に見比べることになるため上部で統一されている方が見やすいと思います。

## 大会用オーバーレイ表示用URL(スケール自動調整：通常はこちらを使用)
```
https://rynan4818.github.io/tournament_overlay/
```
### 1080p(1920x1080)用 (1.5倍スケール固定)※従来の互換用
```
https://rynan4818.github.io/tournament_overlay/?modifiers=scale
```

## シーンコントロール使用時の注意点
[obs-control](https://github.com/rynan4818/obs-control)等でOBSのシーンコントロールを使用している場合は、メニュー用シーンとゲームプレイ用シーンの両方に大会用オーバーレイの追加をお願いします。（ゲームプレイ用シーンのみだと、プレイ終了時に消えてしまうため）

## 初めての方向けの詳しいインストール方法

1. HttpSiraStatus のインストール

    Beat Saberからオーバーレイにデータを送信するためにHttpSiraStatusをインストールしてください。

   - [HttpSiraStatus](https://github.com/denpadokei/HttpSiraStatus/releases)
   
       上記からダウンロードして解凍した`HttpSiraStatus.dll`をBeatSaberのインストールフォルダの`Plugins`フォルダにコピーします。
       
       ダウンロードするzipファイル名の`bs*.**.**`の部分が自分の使用しているBeatSaberのバージョンと同じか、小さくて一番近いものを使用してください。
   
   HttpSiraStatusを使用するには、ModAssistantにある**websocket-sharpのインストールが必須**です。
   
   入れ忘れトラブルが多いので注意して下さい。

   ![image](https://user-images.githubusercontent.com/14249877/194671405-950cdf45-1e9c-4fb3-b198-15404a5145eb.png)
   
   ModAssistantに登録が無い場合は[BEATMODS](https://beatmods.com/#/mods)で、Game Versionを`Any`にして`websocket-sharp`を検索してダウンロードして下さい。

   ![image](https://user-images.githubusercontent.com/14249877/194671490-6ef3e6e9-de3f-4ff7-8e36-40a22145e2e9.png)
   
   ※websocket-sharpはBeatSaberのバージョンに関係なく動作するので、HttpSiraStatusが対応していれば古いバージョンでも動作します。

2. OBSのソースにブラウザを追加します。

   ![image](https://rynan4818.github.io/beatsaber-overlay-obs-setting1.png)

3. 新規作成を選択して、適当にソースの名前を設定して、OKを押します。

   ![image](https://rynan4818.github.io/beatsaber-overlay-obs-setting2.png)

4. 大会用オーバーレイ表示用URL `https://rynan4818.github.io/tournament_overlay/` を、OBSのURL欄に貼り付けます。

   また、画面サイズに合わせて幅・高さを設定します。(1920x1080等)

   幅に合わせてオーバーレイの表示倍率が自動的に調整されます。

   ![image](https://rynan4818.github.io/tournament_overlay3.png)

5. オーバーレイのソースの順序をゲームのソースよりも優先度を上げて、オーバーレイがゲーム画面に重ねて表示されるようにします。

    ![image](https://rynan4818.github.io/beatsaber-overlay-obs-setting8.png)

## 動作しない場合
もしも動作しない場合は、Beat Saber Overlay 改良版の[トラブルシューティング](https://github.com/rynan4818/beat-saber-overlay/blob/master/Troubleshooting.md)を参照してください。

## 備考
index.html, bsdp-like_d.html, bsdp-like.css は[BSDP-Overlay](https://github.com/kOFReadie/BSDP-Overlay)を元に改造しています。
