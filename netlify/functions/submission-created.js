/**
 * 立德引擎 — 表单提交后自动推送到飞书群机器人
 *
 * Netlify 在每次表单提交成功后会自动触发这个函数（事件名 submission-created）。
 * 需要在 Netlify 后台设置环境变量 FEISHU_WEBHOOK，值是飞书自定义机器人的 webhook 地址。
 * 未设置时函数直接跳过，不影响表单本身与邮件通知。
 */

const FIELD_LABELS = {
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

const SKIP = new Set(['bot-field', 'form-name', 'consent', 'ip', 'user_agent', 'referrer']);

function buildContent(formName, data, submittedAt) {
  const title = formName === 'chat' ? '在线咨询留言' : '免费诊断申请';

  const lines = [];
  Object.keys(FIELD_LABELS).forEach(function (k) {
    const v = data[k];
    if (v && String(v).trim()) {
      lines.push({ tag: 'text', text: FIELD_LABELS[k] + '：' + String(v).trim() + '\n' });
    }
  });
  // 兜底：把没在标签表里、但确实有值的字段也带上，避免以后加字段忘了改这里
  Object.keys(data).forEach(function (k) {
    if (FIELD_LABELS[k] || SKIP.has(k)) return;
    const v = data[k];
    if (v && String(v).trim()) {
      lines.push({ tag: 'text', text: k + '：' + String(v).trim() + '\n' });
    }
  });

  const content = lines.map(function (l) { return [l]; });
  content.push([{ tag: 'text', text: '\n提交时间：' + submittedAt }]);
  content.push([
    { tag: 'text', text: '\n' },
    { tag: 'a', text: '在 Netlify 后台查看全部询盘', href: 'https://app.netlify.com/projects/lide-engine/forms' },
  ]);

  return {
    msg_type: 'post',
    content: { post: { zh_cn: { title: '【立德引擎官网】' + title, content: content } } },
  };
}

export default async (req) => {
  const hook = process.env.FEISHU_WEBHOOK;
  if (!hook) {
    console.log('FEISHU_WEBHOOK 未配置，跳过推送');
    return new Response('skipped: no webhook configured', { status: 200 });
  }

  let payload;
  try {
    payload = await req.json();
  } catch (e) {
    console.error('解析提交内容失败', e);
    return new Response('bad payload', { status: 400 });
  }

  const sub = (payload && payload.payload) || {};
  const data = sub.data || {};
  const formName = sub.form_name || data['form-name'] || 'unknown';
  const submittedAt = sub.created_at
    ? new Date(sub.created_at).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
    : new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const body = buildContent(formName, data, submittedAt);

  try {
    const r = await fetch(hook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await r.text();
    console.log('飞书推送返回', r.status, text);
    return new Response('ok', { status: 200 });
  } catch (e) {
    // 推送失败不能影响表单本身——邮件通知与 Netlify 后台记录都还在
    console.error('飞书推送失败', e);
    return new Response('push failed but submission is safe', { status: 200 });
  }
};
