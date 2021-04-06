# tournament_overlay
ビーセイ大会用オーバーレイです。

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

## 主な特徴
- 曲時間、スコア、精度、コンボ数、ミス数のみのシンプルで見やすい表示 (曲名などの譜面情報は主催者側で用意)
- プレイ終了後も非表示しないため、結果の確認が容易
- Fail後もスコア値が1/2にならなず、Fail有無同士でもスコア比較が可能
- NFを付けずにプレイ開始した場合に **No NF!** と表示

index.html, bsdp-like_d.html, bsdp-like.css は[BSDP-Overlay](https://github.com/kOFReadie/BSDP-Overlay)を元に改造しています。
