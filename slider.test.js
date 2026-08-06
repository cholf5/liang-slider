const test = require('node:test');
const assert = require('node:assert/strict');
const {
  clamp,
  getPercentage,
  getThumbLeft,
  getLiangStatus,
  getStatusMessage,
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

test('getLiangStatus 将祖率映射到四种梁氏状态', () => {
  assert.equal(getLiangStatus(0), '梁神');
  assert.equal(getLiangStatus(25), '梁圣');
  assert.equal(getLiangStatus(49), '梁圣');
  assert.equal(getLiangStatus(50), '梁子');
  assert.equal(getLiangStatus(74), '梁子');
  assert.equal(getLiangStatus(75), '牢梁');
  assert.equal(getLiangStatus(100), '牢梁');
});

test('getStatusMessage 生成包含祖率和梁氏状态的提示', () => {
  assert.equal(getStatusMessage(42, '正在调整祖率'), '正在调整祖率：42% · 梁圣');
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
