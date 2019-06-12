# SimplePicker

移动端滑动选取组件

### 示例一



可以扫描二维码体验：

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-crop-1.png">

或者访问以下链接：

[https://newbieyoung.github.io/Simple-Crop/test-2.html](https://newbieyoung.github.io/Simple-Crop/test-2.html)

相关配置参数以及样式适用于移动端；

```
<link rel="stylesheet" href="./dist/template-2.css">
```

```
var offsetTop = document.documentElement.clientHeight*0.04;
var offsetLeft = document.documentElement.clientWidth*0.02;

var simpleCrop = new SimpleCrop({
    src:'./img/test1.jpg',
    size:{
        width:1000,
        height:600
    },
    borderWidth:1,
    cropSizePercent:0.9,
    controller:['touch'],
    positionOffset:{left:offsetLeft,top:offsetTop},
    coverColor:'rgba(0,0,0,.3)',
    funcBtns:['close','crop','around','reset'],
    scaleSlider:false,
    rotateSlider:true,
    cropCallback:function(){
        this.$resultCanvas.style.marginRight = '10px';
        this.$resultCanvas.style.width = '50%';
        document.body.appendChild(this.$resultCanvas);
    }
});
```

因为需要用到多指触摸操作，目前使用[AlloyFinger](https://github.com/AlloyTeam/AlloyFinger)

```
<script src="./lib/alloy_finger.js"></script>
```

<table style="word-break: normal;">
	<tr>
		<td>参数</td>
		<td>说明</td>
	</tr>
	<tr>
		<td>src</td>
		<td>素材图片地址</td>
	</tr>
	<tr>
		<td>size</td>
		<td>裁剪图片尺寸</td>
	</tr>
	<tr>
		<td>borderWidth</td>
		<td>裁剪框边框宽度</td>
	</tr>
	<tr>
		<td>cropSizePercent</td>
		<td>裁剪框占裁剪显示区域的比例，0.9表示所占比例为90%</td>
	</tr>
	<tr>
		<td>controller</td>
		<td>控制方式，取值有两种，分别为<b>touch</b>表示触摸操作适用于移动端；<b>mouse</b>表示鼠标操作适用于PC</td>
	</tr>
	<tr>
		<td>positionOffset</td>
		<td>裁剪框偏移，一般默认裁剪框在画布中心，如果不想在中心则需要设置这个属性来对其位置进行一定的偏移</td>
	</tr>
	<tr>
        <td>coverColor</td>
        <td>非裁剪框区域遮罩颜色</td>
    </tr>
	<tr>
		<td>funcBtns</td>
		<td>功能按钮设置，取值有四种，分别为<b>close</b>表示关闭功能按钮、<b>reset</b>表示还原功能按钮、<b>around</b>表示整角90度旋转按钮、<b>crop</b>表示裁剪按钮；属性中的顺序决定其DOM元素的层级顺序</td>
	</tr>
	<tr>
		<td>scaleSlider</td>
		<td>是否开启滑动缩放组件，因为在PC端不支持双指触摸，因此需要设置这个属性为true，来启动控制缩放的滑动组件，移动端没必要则设置为false</td>
	</tr>
	<tr>
		<td>rotateSlider</td>
		<td>是否开启旋转滑动组件，本来双指触摸既可以用来控制缩放也可以用来控制旋转，但是实际体验时感觉不能使用一种操作控制两种功能，因此最终只使用双指触摸控制缩放，旋转使用额外组件来控制</td>
	</tr>
	<tr>
		<td>cropCallback</td>
		<td>图片裁剪回调函数，在函数中通过<b>this.$resultCanvas</b>来获取裁剪结果</td>
	</tr>
</table>

### 示例二

如图：

<img src="https://raw.githubusercontent.com/newbieYoung/NewbieWebArticles/master/images/simple-crop-11.jpg">

请访问以下链接[https://newbieyoung.github.io/Simple-Crop/test-1.html](https://newbieyoung.github.io/Simple-Crop/test-1.html)

相关配置参数以及样式适用于PC端；

```
<link rel="stylesheet" href="./dist/template-1.css">
```

```
var simpleCrop = new SimpleCrop({
    title:'上传图片过大，请裁剪',
    src:'./img/test1.jpg',
    size:{
        width:800,
        height:900
    },
    cropCallback:function(){
        this.$resultCanvas.style.marginRight = '10px';
        this.$resultCanvas.style.width = '50%';
        document.body.appendChild(this.$resultCanvas);
    },
    coverDraw:function(){
        //...
    }
});
```

<table style="word-break: normal;">
	<tr>
		<td>参数</td>
		<td>说明</td>
	</tr>
	<tr>
		<td>title</td>
		<td>标题</td>
	</tr>
	<tr>
		<td>coverDraw</td>
		<td>辅助线绘制函数</td>
	</tr>
</table>

### 其它

相关原理以及实现请查看[SimpleCrop 支持任意角度旋转的图片裁剪组件](https://newbieweb.lione.me/?p=34)
