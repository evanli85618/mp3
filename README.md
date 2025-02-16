
> 在 [https://evanli85618.github.io/mp3/](https://evanli85618.github.io/mp3/) 打开此页面

## 用作扩展

此仓库可以作为 **插件** 添加到 MakeCode 中。

* 打开 [https://makecode.microbit.org/](https://makecode.microbit.org/)
* 点击 **新项目**
* 点击齿轮图标菜单下的 **扩展**
* 搜索 **https://github.com/evanli85618/mp3** 并导入

## 编辑此项目

在 MakeCode 中编辑此仓库。

* 打开 [https://makecode.microbit.org/](https://makecode.microbit.org/)
* 点击 **导入**，然后点击 **导入 URL**
* 粘贴 **https://github.com/evanli85618/mp3** 并点击导入

#### 元数据（用于搜索、渲染）

* for PXT/microbit
<script src="https://makecode.com/gh-pages-embed.js"></script><script>makeCodeRender("{{ site.makecode.home_url }}", "{{ site.github.owner_name }}/{{ site.github.repository_name }}");</script>

## 模块特色
1. 普通IO可驱动，不占串口
2. 自带U盘，电脑可直接拷贝音乐
3. 喇叭声音大
4. 模块自带灯按键可快速测试模块

## 模块介绍
1. 这是一个神奇的mp3模块，不需要占用宝贵的串口，只需要普通的IO口就能驱动它,接口淘宝通用模块接口PH2.0 3PIN，引脚顺序见实物
2. 通过普通IO口驱动可以两个或者两个以上的mp3模块，让你的项目制作更加方便——特色
3. 模块自带MicroUSB口，可以通过数据线直接拷贝MP3或者WAV文件到模块中
4. 模块自带128M内存卡
5. 模块上有一个按键，短按播放，长按播放下一曲
6. 按键上有指示灯
7. 模块喇叭声音很大声，使用8欧0.5W喇叭，通电，默认音量最大。编程插件中初始化引脚定义时，默认设置一半音量（15），音量范围是0-30

## 使用场景
1. Micorbit串口被占，但是又要使用mp3模块，使用mp3可以使用普通IO驱动
2. 需要2个或者2个MP3以上的项目场景

## 使用注意事项
1. 因为使是普通IO控制，因此播放歌曲是定义序号的形式进行播放。序号是指拷贝到MP3的U盘的先后次序（因此建议现在自己电脑上将MP3文件统一命名好，再统一拷贝到U盘的根目录下）
   例如：格式一般为序号+名称+.mp3,序号格式为（001-999），名称无要求
   001apple.mp3
   002hello123.mp3
   003孤勇者.mp3

  例如：如果后续需要再增加一些新的音乐，可以在电脑上先进行命名序号（跟着U盘内的序号+1），再一起复制到MP3的U盘上
  004小苹果.mp3
  005Yesterday Once More.mp3

2. 模块支持3-5V电源，音量最大时电流大概200mA，峰值电流为500mA，和其他耗电传感器使用时，需要注意整个供电系统的电流是否足够
3. 模块在插上USB与电脑连接时，按键播放无效，此时处于U盘模式
4. 当插上USB数据线前，需要先断开PH2.0接口，防止电脑中的5V电源供到Microibt引脚上

