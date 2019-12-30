(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['prefix-umd'], factory);
    } else if (typeof module === 'object' && module.exports) {
        // Node/CommonJS
        module.exports = factory(require('prefix-umd'));
    } else {
        // Browser globals
        window.SimplePicker = factory(window.Prefix);
    }
}(function (Prefix) {
    //兼容性处理
    window.requestAnimFrame = (function () {
        return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame;
    })();

    var transformProperty = Prefix.prefix('transform');
    var transitionDurationPro = Prefix.prefix('transitionDuration');

    //常用方法名简化
    function on(el, evt, callback) {
        el.addEventListener(evt, callback);
    }

    function off(el, evt, callback) {
        el.removeEventListener(evt, callback);
    }

    function qs(str) {
        return document.querySelector(str);
    }

    function qsa(str) {
        return document.querySelectorAll(str);
    }

    function getIndex(val, array) {
        var res = 0;
        for (var i = 0, len = array.length; i < len; i++) {
            if (array[i].value === val) {
                res = i;
            }
        }
        return res;
    }

    /**
     * data 数据
     * zIndex 组件层级
     * position 组件定位
     * default 默认值
     * result 选取值
     * headVisible 是否显示头部按钮区域
     * maskVisible 是否显示遮罩
     * itemHeight 选项高度
     * listHeight 选项列表高度
     * itemStyle 选项样式
     * onChangeEnd 选项已经改变监听
     * onConfirm 确定监听
     * topGapHeight 头部占位元素高度
     * bottomGapHeight 底部占位元素高度
     */
    function SimplePicker(config) {
        if (!config || typeof (config) !== 'object') {
            console.error('参数异常');
            return;
        }
        this.data = config.data;
        this.default = config.default || null;
        this.result = this.default;
        this.onChangeEnd = config.onChangeEnd || function () {};
        this.onConfirm = config.onConfirm || function () {};

        this.id = 'picker-' + new Date().getTime();
        this.itemHeight = config.itemHeight || 36;
        this.listHeight = config.listHeight || this.itemHeight * 6;
        this.topGapHeight = config.topGapHeight || 0;
        this.bottomGapHeight = config.bottomGapHeight || 0;
        this.itemStyle = config.itemStyle || null;
        this.zIndex = config.zIndex || 1000;
        this.position = config.position || 'relative';
        this.headVisible = config.headVisible != null ? config.headVisible : true;
        this.maskVisible = config.maskVisible != null ? config.maskVisible : true;

        this.init();
    }

    //构建html结构
    SimplePicker.prototype.constructor = function () {
        var html = '';
        html += '<div class="picker-component">';

        //遮罩
        if (this.maskVisible) {
            html += '<div class="pk-cover"></div>';
        }

        html += '<div class="pk-target">';

        //头部按钮区域
        if (this.headVisible) {
            html += '<div class="pt-header"><span class="ph-cancel">取消</span><span class="ph-confirm">确定</span></div>';
        }

        //头部占位元素
        if (this.topGapHeight > 0) {
            html += '<div class="pt-top-gap"></div>';
        }

        html += '<div class="pt-list">';
        html += '<div class="pl-top-cover"></div>';
        html += this.renderCols();
        html += '<div class="pl-bottom-cover"></div>';
        html += '</div>';

        //底部占位元素
        if (this.bottomGapHeight > 0) {
            html += '<div class="pt-bottom-gap"></div>';
        }

        html += '</div>';
        html += '</div>';

        this.$target = document.createElement('div');
        this.$target.id = this.id;
        this.$target.style.zIndex = this.zIndex;
        this.$target.style.position = this.position;
        this.$target.innerHTML = html;
        document.body.appendChild(this.$target);
    };

    //初始化
    SimplePicker.prototype.init = function () {
        this.constructor();
        this.$picker = qs('#' + this.id + ' .pk-target');

        //遮罩
        if (this.maskVisible) {
            this.$cover = qs('#' + this.id + ' .pk-cover');
        }

        //头部按钮区域
        if (this.headVisible) {
            this.$cancel = qs('#' + this.id + ' .ph-cancel');
            this.$confirm = qs('#' + this.id + ' .ph-confirm');
            this.btnEvent();
        }

        //头部占位元素
        if (this.topGapHeight > 0) {
            this.$topGap = qs('#' + this.id + ' .pt-top-gap');
            this.$topGap.style.height = this.topGapHeight + 'px';
        }

        //底部占位元素
        if (this.bottomGapHeight > 0) {
            this.$bottomGap = qs('#' + this.id + ' .pt-bottom-gap');
            this.$bottomGap.style.height = this.bottomGapHeight + 'px';
        }

        //设置选项列表高度
        this.$list = qs('#' + this.id + ' .pt-list');
        this.$list.style.height = this.listHeight + 'px';

        //设置上下遮罩高度
        this.$topCover = qs('#' + this.id + ' .pl-top-cover');
        this.$bottomCover = qs('#' + this.id + ' .pl-bottom-cover');
        var coverHeight = (this.listHeight - this.itemHeight) / 2;
        this.$topCover.style.height = coverHeight + 'px';
        this.$bottomCover.style.height = coverHeight + 'px';

        //设置默认值偏移
        this.$colParents = qsa('#' + this.id + ' .pl-col');
        this.$cols = qsa('#' + this.id + ' .pl-col ul');
        for (var i = 0; i < this.data.length; i++) {
            var offsetHeight = getIndex(this.default[i], this.data[i]) * this.itemHeight;
            this.setOffset(i, offsetHeight);
            this.moveListener(i, offsetHeight); //初始化滑动监听
        }
    };

    //渲染选项列表数据
    SimplePicker.prototype.renderCols = function () {
        var html = '';
        var cssTexts = [];
        if (this.itemStyle) {
            for (var i = 0; i < this.itemStyle.length; i++) {
                cssTexts[i] = '';
                var styles = this.itemStyle[i];
                for (var j = 0; j < styles.length; j++) {
                    cssTexts[i] += styles[j].property + ':' + styles[j].value + ';';
                }
            }
        }

        for (var i = 0; i < this.data.length; i++) {
            var col = this.data[i];
            var cssText = cssTexts[i] || '';
            html += '<div class="pl-col">';
            html += '<ul>';
            for (var j = 0; j < col.length; j++) {
                html += '<li style="' + cssText + '">' + col[j].title + '</li>'
            }
            html += '</ul>';
            html += '</div>';
        }

        return html;
    };

    //设置列表选项高度
    SimplePicker.prototype.setListHeight = function (height) {
        this.listHeight = height;
        this.$list.style.height = this.listHeight + 'px';

        //重置上下cover高度
        var coverHeight = (this.listHeight - this.itemHeight) / 2;
        this.$topCover.style.height = coverHeight + 'px';
        this.$bottomCover.style.height = coverHeight + 'px';

        //重置结果偏移高度
        for (var i = 0; i < this.data.length; i++) {
            var offsetHeight = getIndex(this.result[i], this.data[i]) * this.itemHeight;
            this.setOffset(i, offsetHeight);
        }
    };

    //显示
    SimplePicker.prototype.show = function () {
        var self = this;
        setTimeout(function () {
            if (self.maskVisible) {
                self.$cover.classList.add('pc-show');
            }
            self.$picker.classList.add('pc-show');
        }, 20);
    };

    //隐藏
    SimplePicker.prototype.hide = function () {
        if (this.maskVisible) {
            this.$cover.classList.remove('pc-show');
        }
        this.$picker.classList.remove('pc-show');
    };

    //计算选取结果
    SimplePicker.prototype.getResult = function (translateY) {
        var initOffset = (this.listHeight - this.itemHeight) / 2;
        var startIndex = parseInt(initOffset / this.itemHeight);
        var startOffset = initOffset - this.itemHeight * startIndex;
        var result = startIndex - (translateY - startOffset) / this.itemHeight;
        return result;
    };

    //设置偏移
    SimplePicker.prototype.setOffset = function (colNo, offsetHeight, touchEndDuration) {
        //过渡时长最长不超过 0.4 秒，最短不小于 0.2 秒
        var minDuration = 0.2;
        var maxDuration = 0.4;
        var time = touchEndDuration > 0 ? touchEndDuration : 0;
        if (time > 0) {
            if (time > maxDuration) {
                time = maxDuration;
            } else if (time < minDuration) {
                time = minDuration;
            }
        }

        var el = this.$cols[colNo];
        var translateY = this.listHeight / 2 - this.itemHeight / 2 - offsetHeight;
        el.style[transitionDurationPro] = time + 's';
        el.style[transformProperty] = 'translateY(' + translateY + 'px)';

        if (time > 0) {
            var lineNo = this.getResult(translateY);
            this.result[colNo] = this.data[colNo][lineNo].value;
            this.onChangeEnd(this.result);
        }
    };

    //获取结束偏移距离
    SimplePicker.prototype.getEndOffset = function (offset) {
        //超过一半进一，没超过舍去
        offset = offset % this.itemHeight > this.itemHeight / 2 ? Math.ceil(offset / this.itemHeight) * this.itemHeight : Math.floor(offset / this.itemHeight) * this.itemHeight;
        return offset;
    };

    //按钮事件
    SimplePicker.prototype.btnEvent = function () {
        var self = this;

        on(this.$cancel, 'click', function () { //取消
            self.hide();
        });

        on(this.$confirm, 'click', function () { //确定
            self.hide();
            self.onConfirm(self.result);
        });
    };

    //滑动监听
    SimplePicker.prototype.moveListener = function (colNo, offsetHeight) {
        var self = this;
        var touchStartY = 0; //触摸开始Y值
        var touchStartTime = 0; //触摸开始时间
        var touchMovedY = offsetHeight; //偏移距离，默认为初始偏移距离
        var curColNum = colNo; //当前滑动行序号
        var element = this.$colParents[curColNum];
        var stopInertiaMove = false; //是否停止惯性移动

        //触摸开始
        function touchstartHandler(e) {
            touchStartY = e.touches[0].pageY;
            touchStartTime = new Date().getTime();
            stopInertiaMove = true;
        }

        //触摸移动
        function touchmoveHandler(e) {
            e.preventDefault();
            var touchMoveY = e.touches[0].pageY;
            var _touchMovedY = touchStartY - touchMoveY + touchMovedY; //当前移动偏移距离
            self.setOffset(curColNum, _touchMovedY);
            stopInertiaMove = true;
        }

        //触摸结束
        function touchendtHandler(e) {
            var toucheEndY = e.changedTouches[0].pageY;
            touchMovedY = touchStartY - toucheEndY + touchMovedY; //最终偏移距离

            //惯性移动
            stopInertiaMove = false;
            var nowTime = new Date().getTime();
            var vec = (toucheEndY - touchStartY) / (nowTime - touchStartTime); //惯性滑动平均速度
            var initVec = vec * 100; //毫秒速度转换为秒速度

            //越界
            if (touchMovedY < 0) {
                var duration = Math.abs(touchMovedY / initVec);
                touchMovedY = 0;
                self.setOffset(curColNum, touchMovedY, duration);
                return;
            }
            if (touchMovedY > self.data[curColNum].length * self.itemHeight - self.itemHeight) {
                var maxMovedY = self.data[curColNum].length * self.itemHeight - self.itemHeight; //最大偏移距离
                var duration = Math.abs((touchMovedY - maxMovedY) / initVec);
                touchMovedY = maxMovedY;
                self.setOffset(curColNum, maxMovedY, duration);
                return;
            }

            function inertiaMove(curstamp, laststamp) {
                if (stopInertiaMove) {
                    return;
                }
                var dist = vec * (laststamp - curstamp);
                if (Math.abs(vec) < 0.05) {
                    //越界
                    if (touchMovedY < 0) {
                        var duration = Math.abs(touchMovedY / initVec);
                        touchMovedY = 0;
                        self.setOffset(curColNum, touchMovedY, duration);
                        return;
                    }
                    if (touchMovedY > self.data[curColNum].length * self.itemHeight - self.itemHeight) {
                        var maxMovedY = self.data[curColNum].length * self.itemHeight - self.itemHeight; //最大偏移距离
                        var duration = Math.abs((touchMovedY - maxMovedY) / initVec);
                        touchMovedY = maxMovedY;
                        self.setOffset(curColNum, maxMovedY, duration);
                        return;
                    }

                    //回归
                    var cacheMovedY = touchMovedY;
                    touchMovedY = self.getEndOffset(touchMovedY);
                    var duration = Math.abs((touchMovedY - cacheMovedY) / initVec);
                    self.setOffset(curColNum, touchMovedY, duration);
                    return;
                }
                touchMovedY += dist;
                self.setOffset(curColNum, touchMovedY);
                vec /= 1.1; //惯性移动阻力系数

                window.requestAnimFrame(function (timestamp) {
                    inertiaMove(timestamp, curstamp);
                });
            }
            window.requestAnimFrame(function (timestamp) {
                inertiaMove(timestamp, timestamp)
            });
        }

        off(element, 'touchstart', touchstartHandler);
        off(element, 'touchmove', touchmoveHandler);
        off(element, 'touchend', touchendtHandler);
        on(element, 'touchstart', touchstartHandler);
        on(element, 'touchmove', touchmoveHandler);
        on(element, 'touchend', touchendtHandler);
    };

    return SimplePicker;
}));