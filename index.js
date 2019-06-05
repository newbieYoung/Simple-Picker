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
    window.requestAnimFrame = (function() {
        return window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.webkitRequestAnimationFrame;
    })();

    var transformProperty = Prefix.prefix('transform');
    var transitionProperty = Prefix.prefix('transition');

    //常用方法名简化
    function on (el, evt, callback) {
        el.addEventListener(evt, callback);
    }
    function off (el, evt, callback) {
        el.removeEventListener(evt, callback);
    }
    function qs (str) {
        return document.querySelector(str);
    }
    function qsa (str) {
        return document.querySelectorAll(str);
    }
    function getIndex (val, array) {
        var res = 0;
        for (var i = 0, len = array.length;i < len;i++) {
            if (array[i].value === val) {
                res = i;
            }
        }
        return res;
    }

    /**
     * data 数据
     * default 默认值
     * result 选取值
     * itemHeight 选项高度
     * onChange 正在改变选项监听
     * onChangeEnd 选项已经改变监听
     * onConfirm 确定监听
     */
    function SimplePicker(config) {
        if (!config || typeof (config) !== 'object') {
            console.error('配置文件有误');
            return;
        }
        this.data = config.data;
        this.default = config.default || null;
        this.result = this.default;
        this.onChange = config.onChange || function() {};
        this.onChangeEnd = config.onChangeEnd || function () {};
        this.onConfirm = config.onConfirm || function () {};

        this.id = 'picker-'+new Date().getTime();
        this.itemHeight = config.itemHeight || 36;
        this.listHeight = config.listHeight || this.itemHeight * 6;

        this.className = config.className || '';
        this._aniId = 0;
        this._selected = [];

        //this._renderPop();
        this.init();
    };

    //构建html结构
    SimplePicker.prototype.constructor = function(){
        var html = '';
        html += '<div class="picker-component">';
            html += '<div class="pk-cover"></div>';
            html += '<div class="pk-target">';
                html += '<div class="pt-header"><span class="ph-cancel">取消</span><span class="ph-confirm">确定</span></div>';
                html += '<div class="pt-list">';
                    html += '<div class="pl-top-cover"></div>';
                    html += this.renderCols();
                    html += '<div class="pl-bottom-cover"></div>';
                html += '</div>';
            html += '</div>';
        html += '</div>';


        this.$target = document.createElement('div');
        this.$target.id = this.id;
        this.$target.innerHTML = html;
        document.body.appendChild(this.$target);
    };

    //初始化
    SimplePicker.prototype.init = function(){
        this.constructor();

        this.$cover = qs('#'+this.id+' .pk-cover');
        this.$picker = qs('#'+this.id+' .pk-target');

        //设置选项列表高度
        this.$list = qs('#'+this.id+' .pt-list');
        this.$list.style.height = this.listHeight+'px';

        //设置上下遮罩高度
        this.$topCover = qs('#'+this.id+' .pl-top-cover');
        this.$bottomCover = qs('#'+this.id+' .pl-bottom-cover');
        var coverHeight = (this.listHeight - this.itemHeight)/2;
        this.$topCover.style.height = coverHeight+'px';
        this.$bottomCover.style.height = coverHeight+'px';

        //设置默认值偏移
        this.$cols = qsa('#'+this.id+' .pl-col');
        for(var i=0;i<this.data.length;i++){
            var offsetHeight = getIndex(this.default[i], this.data[i]) * this.itemHeight;
            this.setOffset(i,offsetHeight);
            this.moveListener(i,offsetHeight);
        }

        this.show();
    };

    //渲染选项列表数据
    SimplePicker.prototype.renderCols = function(){
        var html = '';
        for(var i=0;i<this.data.length;i++){
            var col = this.data[i];
            html += '<div class="pl-col">';
            html += '<ul>';
            for(var j=0;j<col.length;j++){
                html += '<li>'+col[j].title+'</li>'
            }
            html += '</ul>';
            html += '</div>';
        }

        return html;
    };

    //显示
    SimplePicker.prototype.show = function(){
        var self = this;
        setTimeout(function () {
            self.$cover.classList.add('pc-show');
            self.$picker.classList.add('pc-show');
        }, 20);
    };

    //设置偏移
    SimplePicker.prototype.setOffset = function(colNo,offsetHeight,isTouchEnd){
        var time = isTouchEnd ? '.5s' : '0s';
        var el = this.$cols[colNo];
        el.style[transitionProperty] = time;
        el.style[transformProperty] = 'translateY('+(this.listHeight / 2 - this.itemHeight / 2 - offsetHeight)+'px)';
    };

    //获取结束偏移距离
    SimplePicker.prototype.getEndOffset = function(offset){
        //超过一半进一，没超过舍去
        offset = offset % this.itemHeight > this.itemHeight / 2 ? Math.ceil(offset / this.itemHeight) * this.itemHeight : Math.floor(offset / this.itemHeight) * this.itemHeight;
        return offset;
    };

    //滑动监听
    SimplePicker.prototype.moveListener = function(colNo,offsetHeight){
        var self = this;
        var touchStartY = 0;//触摸开始Y值
        var touchMovedY = offsetHeight;//已偏移距离
        var curColNum = colNo;//当前滑动行序号
        var element = this.$cols[curColNum];

        //触摸开始
        function touchstartHandler (e) {
            touchStartY = e.touches[0].pageY;
        }

        //触摸移动
        function touchmoveHandler (e) {
            e.preventDefault();
            var touchMoveY = e.touches[0].pageY;
            var _touchMovedY = touchStartY - touchMoveY + touchMovedY;//总偏移距离
            self.setOffset(curColNum, _touchMovedY);
        }

        //触摸结束
        function touchendtHandler (e) {
            var toucheEndY = e.changedTouches[0].pageY;
            var _touchMovedY = touchStartY - toucheEndY + touchMovedY;//总偏移距离
            _touchMovedY = self.getEndOffset(_touchMovedY);

            if (_touchMovedY < 0) {
                _touchMovedY = 0;
                self.setOffset(curColNum, _touchMovedY, true);
                return;
            }
            if (_touchMovedY > self.data[curColNum].length * self.itemHeight - self.itemHeight) {
                _touchMovedY = self.data[curColNum].length * self.itemHeight - self.itemHeight;
                self.setOffset(curColNum, _touchMovedY, true);
                return;
            }
        }

        off(element, 'touchstart', touchstartHandler);
        off(element, 'touchmove', touchmoveHandler);
        off(element, 'touchend', touchendtHandler);
        on(element, 'touchstart', touchstartHandler);
        on(element, 'touchmove', touchmoveHandler);
        on(element, 'touchend', touchendtHandler);
    };

    /* ------- */

    // 事件监听
    SimplePicker.prototype._listener = function (el, index, offsetNum) {
        //console.log(offsetNum);
        var self = this;
        var touchStartY = 0, touchMovedY = offsetNum, thisIndex = 0;
        var lastMoveTime = 0, lastMoveStart = 0, stopInertiaMove = false;
        function touchstartHandler (e) {
            touchStartY = e.touches[0].pageY;
            thisIndex = index;
            console.log(index);
            // 惯性
            lastMoveStart = touchStartY;
            lastMoveTime = Date.now();
            stopInertiaMove = true;
        }
        function touchmoveHandler (e) {
            e.preventDefault();
            var touchMoveY = e.touches[0].pageY,
                _touchMovedY = touchStartY - touchMoveY + touchMovedY;

            // 没必要限制最远距离
            //console.log(_touchMovedY+' '+(-self.itemHeight));
            // if (_touchMovedY < -self.itemHeight) {
            //     console.log(_touchMovedY+' '+(-self.itemHeight));
            //     _touchMovedY = -self.itemHeight;
            //     console.log(_touchMovedY);
            // }
            // if (_touchMovedY > self.data[thisIndex].length * self.itemHeight) {
            //     _touchMovedY = self.data[thisIndex].length * self.itemHeight;
            // }

            self._setOffset(this, thisIndex, _touchMovedY);
            // 惯性
            var nowTime = Date.now();
            stopInertiaMove = true;

            // 没必要处理滑动间隔
            // if (nowTime - lastMoveTime > 300) {
            //     console.log('222');
            //     lastMoveTime = nowTime;
            //     lastMoveStart = touchMoveY;
            // }
        }
        function touchendtHandler (e) {
            var toucheEndY = e.changedTouches[0].pageY;
            var touchChangedY = touchStartY - toucheEndY + touchMovedY;
            var _this = this;
            touchMovedY = touchChangedY % self.itemHeight > self.itemHeight / 2 ? Math.ceil(touchChangedY / self.itemHeight) * self.itemHeight : Math.floor(touchChangedY / self.itemHeight) * self.itemHeight;
            //console.log(touchMovedY);
            if (touchMovedY < 0) {
                touchMovedY = 0;
                self._setOffset(_this, thisIndex, touchMovedY, true);
                return;
            }
            if (touchMovedY > self.data[thisIndex].length * self.itemHeight - self.itemHeight) {
                touchMovedY = self.data[thisIndex].length * self.itemHeight - self.itemHeight;
                self._setOffset(_this, thisIndex, touchMovedY, true);
                return;
            }
            // 惯性
            var nowTime = Date.now();
            console.log(toucheEndY+' '+lastMoveStart);
            var v = (toucheEndY - lastMoveStart) / (nowTime - lastMoveTime); // 滑动平均速度
            stopInertiaMove = false;
            var dir = v > 0 ? -1 : 1;
            var deceleration = dir * 0.01;
            var duration = v / deceleration;
            var dist = v * duration / 2;
            function inertiaMove () {
                if (stopInertiaMove) {
                    return;
                }
                if (Math.abs(dist) < 0.5) {
                    touchMovedY = touchMovedY % self.itemHeight > self.itemHeight / 2 ? Math.ceil(touchMovedY / self.itemHeight) * self.itemHeight : Math.floor(touchMovedY / self.itemHeight) * self.itemHeight;
                    self._setOffset(_this, thisIndex, touchMovedY, true);
                    return;
                }
                console.log(dist)
                self._setOffset(_this, thisIndex, touchMovedY + dist);
                dist /= 1.1;
                touchMovedY += dist;
                if (touchMovedY < 0) {
                    touchMovedY = 0;
                }
                if (touchMovedY > self.data[thisIndex].length * self.itemHeight - self.itemHeight) {
                    touchMovedY = self.data[thisIndex].length * self.itemHeight - self.itemHeight;
                }
                self._aniId = window.requestAnimationFrame(inertiaMove);
            }
            inertiaMove();
        }
        off(el, 'touchstart', touchstartHandler);
        off(el, 'touchmove', touchmoveHandler);
        off(el, 'touchend', touchendtHandler);
        on(el, 'touchstart', touchstartHandler);
        on(el, 'touchmove', touchmoveHandler);
        on(el, 'touchend', touchendtHandler);
    };

    // 设置偏移
    SimplePicker.prototype._setOffset = function (el, index, n, isTouchEnd) {
        var time = isTouchEnd ? '.5s' : '0s';
        el.querySelector('.picker-items-col-wrapper').style.cssText = transitionProperty + ':' + time + '; ' + transformProperty + ': translateY(' + (this.itemHeight * 6 / 2 - this.itemHeight / 2 - n) + 'px);'
        for (var i = 0, len = this.data[index].length;i < len;i++) {
            if (-i * this.itemHeight + n > -9 && -i * this.itemHeight + n <= 9) {
                var res = {
                    title: this.data[index][i].title,
                    value: this.data[index][i].value,
                    index: index
                };
                this.onChange(res);
                if (isTouchEnd) {
                    this.onChangeEnd(res);
                    this._selected[index] = res;
                }
            }
        }
    };

    // 渲染列表数据
    SimplePicker.prototype._renderCol = function () {
        var group = '';
        for (var i = 0, len = this.data.length;i < len;i++) {
            var item = '';
            for (var j = 0, len2 = this.data[i].length;j < len2;j++) {
                item += '<div class="picker-item">' + this.data[i][j].title + '</div>';
            }
            group += '<div class="picker-items-col"><div class="picker-items-col-wrapper">' + item + '</div></div>';
        }
        return group;
    };

    //渲染弹出层
    SimplePicker.prototype._renderPop = function(){
        var cols = this._renderCol(this.data);
        if (cols && !qs('#cover') && !qs('#picker')) {
            this.cover = document.createElement('div');
            this.cover.id = 'cover';
            this.picker = document.createElement('div');
            this.picker.id = 'picker';
            this.picker.className = this.className;
            this.picker.innerHTML = '<div class="picker-header"><span class="cancel">取消</span><span class="confirm">确定</span></div><div class="picker-items">' + cols + '<div class="picker-line picker-line-top"></div><div class="picker-line picker-line-bottom"></div></div>';
            document.body.appendChild(this.cover);
            document.body.appendChild(this.picker);
            var self = this;
            setTimeout(function () {
                self.cover.classList.add('show');
                self.picker.classList.add('show');
            }, 20);
            //this._event();
            // 回显数据
            for (var i = 0;i < this.data.length;i++) {
                var offsetNum = 0;
                if (this.default && typeof (this.default) === 'object' && this.default[i]) {
                    var _index = getIndex(this.default[i], this.data[i]);
                    offsetNum = _index * this.itemHeight;
                    this._selected[i] = {
                        title: this.data[i][_index].title,
                        value: this.data[i][_index].value,
                        index: i
                    };
                } else {
                    this._selected[i] = {
                        title: this.data[i][0].title,
                        value: this.data[i][0].value,
                        index: i
                    };
                }
                var el = qsa('.picker-items-col')[i];
                this._setOffset(el, i, offsetNum);
                this._listener(el, i, offsetNum);
            }
        }
    };

    SimplePicker.prototype._renderItem = function (config) {
        var _item = '';
        this.data[config.index] = config.data;
        for (var i = 0, len = config.data.length;i < len;i++) {
            _item += '<div class="picker-item">' + config.data[i].title + '</div>';
        }
        var el = qsa('.picker-items-col')[config.index];
        el.innerHTML = '<div class="picker-items-col-wrapper">' + _item + '</div>';
        this._setOffset(el, config.index, getIndex(config.default, config.data) * this.itemHeight || 0, true);
        console.log(config.index);
        this._listener(el, config.index, getIndex(config.default, config.data) * this.itemHeight ||   0, true);
    };

    SimplePicker.prototype.setItem = function (config) {
        if (typeof (config) !== 'object') {
            console.error('setItem参数有误');
            return;
        }
        this._renderItem(config);
    };


    SimplePicker.prototype.open = function () {
        this._renderPop();
    };


    SimplePicker.prototype.remove = function () {
        var self = this;
        self.cover.classList.remove('show');
        self.picker.classList.remove('show');
        self.picker.addEventListener('transitionend', function () {
            if (!self.picker) {
                return;
            }
            self.cover.parentNode.removeChild(self.cover);
            self.picker.parentNode.removeChild(self.picker);
            self.picker = null;
        });
    };

    // 设置偏移
    SimplePicker.prototype._setOffset = function (el, index, n, isTouchEnd) {
        var time = isTouchEnd ? '.5s' : '0s';
        //console.log(time);
        //console.log((this.itemHeight * 6 / 2 - this.itemHeight / 2 - n));
        el.querySelector('.picker-items-col-wrapper').style.cssText = transitionProperty + ':' + time + '; ' + transformProperty + ': translateY(' + (this.itemHeight * 6 / 2 - this.itemHeight / 2 - n) + 'px);'
        for (var i = 0, len = this.data[index].length;i < len;i++) {
            if (-i * this.itemHeight + n > -9 && -i * this.itemHeight + n <= 9) {
                var res = {
                    title: this.data[index][i].title,
                    value: this.data[index][i].value,
                    index: index
                };
                this.onChange(res);
                if (isTouchEnd) {
                    this.onChangeEnd(res);
                    this._selected[index] = res;
                }
            }
        }
    };

    //事件监听
    SimplePicker.prototype._event = function(){
        var self = this;
        self.cover.onclick = function () {
            self.remove();
        };
        self.picker.querySelector('.cancel').onclick = function () {
            self.remove();
        };
        self.picker.querySelector('.confirm').onclick = function () {
            self.onConfirm(self._selected);
            self.remove();
        };
    };


    return SimplePicker;
}));
