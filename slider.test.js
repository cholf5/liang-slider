const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clamp,
  getPercentage,
  getThumbLeft,
  preventNativeDrag,
} = require('./slider.js');

test('clamp 将数值限制在起止范围内', () => {
  assert.equal(clamp(-10, 0, 100), 0);
  assert.equal(clamp(50, 0, 100), 50);
  assert.equal(clamp(120, 0, 100), 100);
});

test('getThumbLeft 让旋钮按住位置跟随指针并限制在轨道内', () => {
  assert.equal(getThumbLeft(100, 20, 40, 300), 80);
  assert.equal(getThumbLeft(0, 20, 40, 300), 40);
  assert.equal(getThumbLeft(400, 20, 40, 300), 300);
});

test('getPercentage 将旋钮位置转换为 0 到 100 的百分比', () => {
  assert.equal(getPercentage(40, 40, 300), 0);
  assert.equal(getPercentage(170, 40, 300), 50);
  assert.equal(getPercentage(300, 40, 300), 100);
});

test('preventNativeDrag 禁止图片触发浏览器原生拖拽', () => {
  const listeners = {};
  const image = {
    draggable: true,
    addEventListener(type, handler) {
      listeners[type] = handler;
    },
  };

  preventNativeDrag(image);

  const event = {
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
  listeners.dragstart(event);

  assert.equal(image.draggable, false);
  assert.equal(event.defaultPrevented, true);
});
