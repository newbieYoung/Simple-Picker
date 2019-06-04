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
     *
     */
    function SimplePicker(config) {
        if (!config || typeof (config) !== 'object') {
            console.error('配置文件有误');
            return;
        }
        this.data = config.data;
        this.default = config.default || null;
        this._height = config.itemHeight || 36;
        this.beforeInit = config.beforeInit || function () {};
        this.onInit = config.onInit || function () {};
        this.onChange = config.onChange || function() {};
        this.onChangeEnd = config.onChangeEnd || function () {};
        this.onConfirm = config.onConfirm || function () {};
        this.className = config.className || '';
        this._aniId = 0;
        this._selected = [];
        this._renderPop();
    };


    SimplePicker.prototype._renderItem = function (config) {
        var _item = '';
        this.data[config.index] = config.data;
        for (var i = 0, len = config.data.length;i < len;i++) {
            _item += '<div class="picker-item">' + config.data[i].title + '</div>';
        }
        var el = qsa('.picker-items-col')[config.index];
        el.innerHTML = '<div class="picker-items-col-wrapper">' + _item + '</div>';
        this._setOffset(el, config.index, getIndex(config.default, config.data) * this._height || 0, true);
        this._listener(el, config.index, getIndex(config.default, config.data) * this._height ||   0, true);
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

    // 事件监听
    SimplePicker.prototype._listener = function (el, index, offsetNum) {
        var self = this;
        var touchStartY = 0, touchMovedY = offsetNum, thisIndex = 0;
        var lastMoveTime = 0, lastMoveStart = 0, stopInertiaMove = false;
        function touchstartHandler (e) {
            touchStartY = e.touches[0].pageY;
            thisIndex = index;
            // 惯性
            lastMoveStart = touchStartY;
            lastMoveTime = Date.now();
            stopInertiaMove = true;
        }
        function touchmoveHandler (e) {
            e.preventDefault();
            var touchMoveY = e.touches[0].pageY,
                _touchMovedY = touchStartY - touchMoveY + touchMovedY;
            if (_touchMovedY < -this._height) {
                _touchMovedY = -this._height;
            }
            if (_touchMovedY > self.data[thisIndex].length * this._height) {
                _touchMovedY = self.data[thisIndex].length * this._height;
            }
            self._setOffset(this, thisIndex, _touchMovedY);
            // 惯性
            var nowTime = Date.now();
            stopInertiaMove = true;
            if (nowTime - lastMoveTime > 300) {
                lastMoveTime = nowTime;
                lastMoveStart = touchMoveY;
            }
        }
        function touchendtHandler (e) {
            var toucheEndY = e.changedTouches[0].pageY;
            var touchChangedY = touchStartY - toucheEndY + touchMovedY;
            var _this = this;
            touchMovedY = touchChangedY % self._height > self._height / 2 ? Math.ceil(touchChangedY / self._height) * self._height : Math.floor(touchChangedY / self._height) * self._height;
            if (touchMovedY < 0) {
                touchMovedY = 0;
                self._setOffset(_this, thisIndex, touchMovedY, true);
                return;
            }
            if (touchMovedY > self.data[thisIndex].length * self._height - self._height) {
                touchMovedY = self.data[thisIndex].length * self._height - self._height;
                self._setOffset(_this, thisIndex, touchMovedY, true);
                return;
            }
            // 惯性
            var nowTime = Date.now();
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
                    touchMovedY = touchMovedY % self._height > self._height / 2 ? Math.ceil(touchMovedY / self._height) * self._height : Math.floor(touchMovedY / self._height) * self._height;
                    self._setOffset(_this, thisIndex, touchMovedY, true);
                    return;
                }
                self._setOffset(_this, thisIndex, touchMovedY + dist);
                dist /= 1.1;
                touchMovedY += dist;
                if (touchMovedY < 0) {
                    touchMovedY = 0;
                }
                if (touchMovedY > self.data[thisIndex].length * self._height - self._height) {
                    touchMovedY = self.data[thisIndex].length * self._height - self._height;
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
        el.querySelector('.picker-items-col-wrapper').style.cssText = transitionProperty + ':' + time + '; ' + transformProperty + ': translateY(' + (this._height * 6 / 2 - this._height / 2 - n) + 'px);'
        for (var i = 0, len = this.data[index].length;i < len;i++) {
            if (-i * this._height + n > -9 && -i * this._height + n <= 9) {
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
            this._event();
            // 回显数据
            for (var i = 0;i < this.data.length;i++) {
                var offsetNum = 0;
                if (this.default && typeof (this.default) === 'object' && this.default[i]) {
                    var _index = getIndex(this.default[i], this.data[i]);
                    offsetNum = _index * this._height;
                    this.onInit({
                        title: this.data[i][_index].title,
                        value: this.data[i][_index].value,
                        index: i
                    });
                    this._selected[i] = {
                        title: this.data[i][_index].title,
                        value: this.data[i][_index].value,
                        index: i
                    };
                } else {
                    this.onInit({
                        title: this.data[i][0].title,
                        value: this.data[i][0].value,
                        index: i
                    });
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

    return SimplePicker;
}));
