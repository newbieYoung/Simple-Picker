# SimplePicker

移动端滑动选取组件；

### 示例一

<img src="https://raw.githubusercontent.com/newbieYoung/Simple-Picker/master/img/demo0.jpg">

可以扫描二维码体验：

<img src="https://raw.githubusercontent.com/newbieYoung/Simple-Picker/master/img/demo0-code.png">

或者访问以下链接：

[https://newbieyoung.github.io/Simple-Picker/examples/demo0.html](https://newbieyoung.github.io/Simple-Picker/examples/demo0.html)

相关样式及示例代码如下：

```
<link rel="stylesheet" href="../template0.css"/>
```

```
var dataset = [];
//加入月份
dataset.push([]);
for(var i=1;i<=12;i++){
    dataset[0].push({
        title:i+'月',
        value:i
    })
}
//加入日期
dataset.push([]);
for(var i=1;i<=31;i++){
    dataset[1].push({
        title:i+'日',
        value:i
    })
}

var $picker = new SimplePicker({
    itemHeight: 36,
    data: dataset,
    default :[1, 2],
    itemStyle:[[{
        'property':'padding-right',
        'value':'33px'
    },{
        'property':'text-align',
        'value':'right'
    }],[{
        'property':'padding-left',
        'value':'33px'
    },{
        'property':'text-align',
        'value':'left'
    }]],
    onChangeEnd: function(res){
        console.log(res);
    },
    onConfirm : function (res) {
        console.log(res);
    }
})

$picker.show();
```

相关参数及函数说明如下：

<table style="word-break: normal;">
	<tr>
		<td>参数</td>
		<td>说明</td>
	</tr>
	<tr>
		<td>itemHeight</td>
		<td>选项高度（单位px）</td>
	</tr>
	<tr>
		<td>data</td>
		<td>选项列表数组</td>
	</tr>
	<tr>
		<td>default</td>
		<td>默认值（默认值数组中的元素和选项列表数组一一对应）</td>
	</tr>
	<tr>
        <td>itemStyle</td>
        <td>自定义选项 CSS 样式</td>
    </tr>
	<tr>
		<td>onChangeEnd()</td>
		<td>选项改变回调函数</td>
	</tr>
	<tr>
		<td>onConfirm()</td>
		<td>确定选项值回调函数</td>
	</tr>
	<tr>
        <td>show()</td>
        <td>显示组件</td>
    </tr>
    <tr>
        <td>hide()</td>
        <td>隐藏组件</td>
    </tr>
</table>

### 示例二

<img src="https://raw.githubusercontent.com/newbieYoung/Simple-Picker/master/img/demo1.jpg">

可以扫描二维码体验：

<img src="https://raw.githubusercontent.com/newbieYoung/Simple-Picker/master/img/demo1-code.png">

或者访问以下链接：

[https://newbieyoung.github.io/Simple-Picker/examples/demo1.html](https://newbieyoung.github.io/Simple-Picker/examples/demo1.html)

相关样式及示例代码如下：

```
<link rel="stylesheet" href="./template0.css"/>
```

```
var dataset = [];
//加入日期
dataset.push([{
    title:'4月7日 周日',
    value:'040707'
},{
    title:'4月8日 周一',
    value:'040801'
},{
    title:'4月9日 周二',
    value:'040902'
},{
    title:'今天',
    value:'041003'
},{
    title:'4月11日 周四',
    value:'041104'
},{
    title:'4月12日 周五',
    value:'041205'
},{
    title:'4月13日 周六',
    value:'041306'
}]);

var $picker = new SimplePicker({
    itemHeight: 36,
    data: dataset,
    default :['041003'],
    headVisible:false,
    maskVisible:false,
    listHeight:300,
    topGapHeight:100,
    bottomGapHeight:100,
    onChangeEnd: function(res){
        console.log(res);
    },
    onConfirm : function (res) {
        console.log(res);
    }
})

$picker.show();
```

相关参数及函数说明如下：

<table style="word-break: normal;">
	<tr>
		<td>参数</td>
		<td>说明</td>
	</tr>
	<tr>
		<td>headVisible</td>
		<td>是否显示头部按钮区域</td>
	</tr>
	<tr>
        <td>maskVisible</td>
        <td>是否显示遮罩</td>
    </tr>
    <tr>
        <td>listHeight</td>
        <td>选项列表高度（单位px）</td>
    </tr>
    <tr>
        <td>topGapHeight</td>
        <td>顶部占位区域高度（单位px）</td>
    </tr>
    <tr>
        <td>bottomGapHeight</td>
        <td>底部占位区域高度（单位px）</td>
    </tr>
    <tr>
        <td>setListHeight()</td>
        <td>动态设置选项列表高度</td>
    </tr>
</table>
