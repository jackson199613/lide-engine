/**
 * 立德引擎 — 表单提交后自动推送到飞书群机器人
 *
 * Netlify 在每次表单提交成功后自动触发本函数（事件名 submission-created）。
 * 需在 Netlify 后台设置环境变量 FEISHU_WEBHOOK。未设置时直接跳过，
 * 不影响表单本身、邮件通知与后台记录。
 *
 * 注意：本文件必须是 CommonJS（exports.handler）。Netlify 默认按 CJS 加载 .js，
 * 用 ESM 的 export default 会直接抛 Runtime.UserCodeSyntaxError。
 */

var FIELD_LABELS = {
  // 联系页 · 免费诊断表单
  name: '姓名',
  company: '公司',
  contact: '联系方式',
  category: '产品品类',
  market: '目标市场',
  competitors: '主要竞对 / 对标型号',
  diagnosis: '希望诊断的内容',
  // 在线咨询挂件
  topic: '咨询主题',
  message: '留言内容',
  page: '来源页面',
};

var SKIP = ['bot-field', 'form-name', 'consent', 'ip', 'user_agent', 'referrer'];

function buildMessage(formName, data, submittedAt) {
  var title = formName === 'chat' ? '在线咨询留言' : '免费诊断申请';
  var content = [];

  function push(label, value) {
    if (value && String(value).trim()) {
      content.push([{ tag: 'text', text: label + '：' + String(value).trim() }]);
    }
  }

  Object.keys(FIELD_LABELS).forEach(function (k) {
    push(FIELD_LABELS[k], data[k]);
  });
  // 兜底：以后表单加了新字段也不会漏
  Object.keys(data).forEach(function (k) {
    if (FIELD_LABELS[k] || SKIP.indexOf(k) !== -1) return;
    push(k, data[k]);
  });

  content.push([{ tag: 'text', text: '' }]);
  content.push([{ tag: 'text', text: '提交时间：' + submittedAt }]);
  content.push([
    { tag: 'a', text: '→ 在 Netlify 后台查看全部询盘', href: 'https://app.netlify.com/projects/lide-engine/forms' },
  ]);

  return {
    msg_type: 'post',
    content: { post: { zh_cn: { title: '【立德引擎官网】' + title, content: content } } },
  };
}

exports.handler = async function (event) {
  var hook = process.env.FEISHU_WEBHOOK;
  if (!hook) {
    console.log('FEISHU_WEBHOOK 未配置，跳过推送');
    return { statusCode: 200, body: 'skipped: no webhook configured' };
  }

  var sub = {};
  try {
    var parsed = JSON.parse(event.body || '{}');
    sub = parsed.payload || parsed || {};
  } catch (e) {
    console.error('解析提交内容失败：', e && e.message);
    return { statusCode: 200, body: 'bad payload' };
  }

  var data = sub.data || {};
  var formName = sub.form_name || data['form-name'] || 'unknown';
  var submittedAt = sub.created_at
    ? new Date(sub.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    : new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  console.log('收到提交，表单：' + formName + '，字段数：' + Object.keys(data).length);

  try {
    var r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildMessage(formName, data, submittedAt)),
    });
    var text = await r.text();
    console.log('飞书返回 ' + r.status + ' ' + text);
  } catch (e) {
    // 推送失败绝不能影响表单本身
    console.error('飞书推送失败：', e && e.message);
  }

  return { statusCode: 200, body: 'ok' };
};
