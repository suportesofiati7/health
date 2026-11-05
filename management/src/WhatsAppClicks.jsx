import React, { useCallback, useEffect, useState } from 'react';
import { MessageCircle, RefreshCw, CheckCircle2, AlertCircle, Download, MousePointer2 } from 'lucide-react';
import { db } from './lib';
import { useT } from './i18n';
import { brazilDay, shiftDay, summarizeClicks } from './whatsappStats';
import './whatsapp-clicks.css';

export default function WhatsAppClicks({ preview = false }) {
  const t = useT();
  const localPreview = import.meta.env.DEV && preview;
  const [report, setReport] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(true);
  const [period, setPeriod] = useState(30);
  const load = useCallback(async () => {
    setBusy(true); setError('');
    try {
      let data;
      if (localPreview) {
        const response = await fetch('/__whatsapp/report', { cache: 'no-store' });
        if (!response.ok) throw Error('unavailable');
        data = await response.json();
      } else {
        const response = await db.rpc('whatsapp_widget_report');
        if (response.error) throw response.error;
        data = response.data;
      }
      if (!data?.started_at || !Array.isArray(data.days)) throw Error('unavailable');
      setReport(data);
    } catch {
      setError(t('Não foi possível carregar o contador. Tente novamente. Se esta for a primeira instalação, publique o contador no servidor.', 'Could not load the counter. Try again. On a new installation, publish the counter to the server first.'));
    } finally { setBusy(false); }
  }, [localPreview]);
  useEffect(() => { load(); const timer = setInterval(load, 30000); return () => clearInterval(timer); }, [load]);
  const summary = summarizeClicks(report);
  const days = summary.days.filter(row => row.day >= shiftDay(summary.today, 1 - period));
  const maximum = Math.max(1, ...days.map(row => row.available ? row.clicks : 0));
  const total = days.reduce((sum, row) => sum + (row.available ? row.clicks : 0), 0);
  const number = value => new Intl.NumberFormat('pt-BR').format(value);
  const shortDay = day => day.slice(8, 10) + '/' + day.slice(5, 7);
  function exportCSV() {
    const csv = '\uFEFFData,Cliques,Status\n' + days.map(row => `${row.day},${row.available ? row.clicks : ''},${row.available ? 'Registrado' : 'Sem histórico'}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `whatsapp-${summary.today}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <div className="wa-dashboard" aria-busy={busy}>
    {localPreview && <div className="wa-preview-banner"><MousePointer2 size={18} /><span><strong>{t('Prévia local', 'Local preview')}</strong> · {t('Os cliques de teste ficam neste computador. Não são dados do site publicado.', 'Test clicks stay on this computer. These are not live website results.')}</span></div>}
    <header className="wa-heading"><div><p className="eyebrow">{t('Seu site em números', 'Your website in numbers')}</p><h1><MessageCircle aria-hidden="true" />{t('Cliques no WhatsApp', 'WhatsApp clicks')}</h1><p>{t('Veja quantas vezes as pessoas clicaram nos botões de WhatsApp do site.', 'See how often people clicked your website’s WhatsApp buttons.')}</p></div><button onClick={load} disabled={busy}><RefreshCw size={16} className={busy ? 'spin' : ''} />{t('Atualizar', 'Refresh')}</button></header>
    {error && <div className="wa-error" role="alert"><AlertCircle size={20} /><div><strong>{t('Contador indisponível', 'Counter unavailable')}</strong><p>{error}</p>{report && <p>{t('Os números abaixo são da última atualização bem-sucedida.', 'Numbers below are from the last successful update.')}</p>}</div><button onClick={load} disabled={busy}>{t('Tentar novamente', 'Retry')}</button></div>}
    <div className="wa-metrics" aria-live="polite">{[
      [t('Hoje', 'Today'), summary.todayClicks, t('Desde a meia-noite', 'Since midnight')],
      [t('Últimos 7 dias', 'Last 7 days'), summary.weekClicks, t('Incluindo hoje', 'Including today')],
      [t('Este mês', 'This month'), summary.monthClicks, t('Do dia 1 até hoje', 'From the 1st through today')]
    ].map(([title, value, detail]) => <section className="wa-metric" key={title}><p>{title}</p><strong>{report ? number(value) : '—'}</strong><span>{detail}</span></section>)}</div>
    <section className="wa-chart-card"><div className="wa-chart-heading"><div><h2>{t('Cliques por dia', 'Daily clicks')}</h2><p>{report ? `${number(total)} ${t('cliques registrados no período', 'recorded clicks in this period')}` : t('Aguardando dados do contador', 'Waiting for counter data')}</p></div><div className="wa-period" aria-label={t('Período do gráfico', 'Chart period')}>{[7, 30].map(n => <button key={n} aria-pressed={period === n} onClick={() => setPeriod(n)}>{n} {t('dias', 'days')}</button>)}</div></div>
      {report ? <><div className="wa-chart" role="img" aria-label={t('Gráfico diário; os valores também estão na tabela abaixo.', 'Daily chart; values are also listed in the table below.')}>
        {days.map((row, index) => <div className={`wa-chart-column ${row.day === summary.today ? 'is-today' : ''} ${row.available ? '' : 'unavailable'}`} key={row.day} title={`${shortDay(row.day)}: ${row.available ? number(row.clicks) : t('Sem histórico', 'No history')}`}><div className="wa-bar-track">{row.clicks > 0 && row.available && <span className="wa-bar-value">{number(row.clicks)}</span>}<div className="wa-bar" style={{ height: row.available && row.clicks ? `${Math.max(2, row.clicks / maximum * 88)}%` : '2px' }} /></div><span className="wa-axis-label">{period === 7 || index % 5 === 0 || index === days.length - 1 ? shortDay(row.day) : ''}</span></div>)}
      </div>{total === 0 && <p className="wa-zero">{t('Nenhum clique registrado ainda. Os próximos cliques aparecerão aqui.', 'No clicks recorded yet. New clicks will appear here.')}</p>}</> : <div className="wa-chart-placeholder">{busy ? t('Carregando…', 'Loading…') : t('Os números aparecerão quando o contador estiver conectado.', 'Numbers will appear when the counter is connected.')}</div>}
      <div className="wa-chart-footer"><span>{report && !error ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}{report ? `${t('Atualizado às', 'Updated at')} ${new Date(report.updated_at).toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' })}` : t('Sem conexão com o contador', 'Counter not connected')}</span><span>{t('Horário de Brasília · atualização automática a cada 30 segundos', 'Brasília time · refreshes every 30 seconds')}</span></div>
    </section>
    {localPreview && <section className="wa-test"><div><h2>{t('Experimente o contador', 'Try the counter')}</h2><p>{t('Aceite a medição abaixo, clique no botão e depois em “Atualizar”.', 'Accept measurement below, click the button, then press “Refresh”.')}</p></div><iframe title={t('Teste local do botão WhatsApp', 'Local WhatsApp button test')} src="/__whatsapp/widget" /></section>}
    <div className="wa-explainer"><MessageCircle size={22} /><div><strong>{t('Um clique é uma tentativa de contato', 'A click is an attempt to get in touch')}</strong><p>{t('Este painel conta cliques, não mensagens enviadas nem pessoas únicas. Cliques repetidos contam novamente. Só medimos após a pessoa aceitar os cookies de análise.', 'This counts clicks, not messages sent or unique people. Repeat clicks count again. Measurement starts only after analytics consent.')}</p><p>{report ? `${t('Contagem iniciada em', 'Counting started on')} ${shortDay(brazilDay(report.started_at))}/${brazilDay(report.started_at).slice(0,4)}. ` : ''}{t('Os dias anteriores ao início da contagem não têm histórico. Os períodos atuais podem estar incompletos.', 'Days before counting started have no history. Current periods may be incomplete.')}</p></div></div>
    {report && <details className="wa-details"><summary>{t('Ver tabela de cliques', 'View click table')}</summary><button onClick={exportCSV}><Download size={16} />{t('Baixar planilha', 'Download CSV')}</button><div className="wa-table-scroll"><table><thead><tr><th>{t('Data', 'Date')}</th><th>{t('Cliques', 'Clicks')}</th></tr></thead><tbody>{[...days].reverse().map(row => <tr key={row.day}><td>{shortDay(row.day)}{row.day === summary.today ? ` · ${t('hoje', 'today')}` : ''}</td><td>{row.available ? number(row.clicks) : t('Sem histórico', 'No history')}</td></tr>)}</tbody></table></div></details>}
  </div>;
}
