import { useState, useEffect, useRef } from 'react';
import { engine } from '../engine/CerebralEngine';
import { fetchUserAssessments } from '../data/api';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard({ user, scores = {} }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const pdfRef = useRef();

  const generatePDF = async () => {
    const element = pdfRef.current;
    const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#050510' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`CerebralIQ_Report_${user?.email || 'Anonymous'}.pdf`);
  };

  useEffect(() => {
    if (user && user.id) {
      setLoading(true);
      fetchUserAssessments(user.id)
        .then(data => {
          setHistory(data);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const processSubtest = (raw, domain) => {
    if (raw === undefined) return { scaled: '--', qualitative: 'Pending' };
    const z = engine.calculateZ(raw, domain);
    const scaled = engine.getScaledScore(z);
    const qualitative = engine.getQualitativeCategory(scaled);
    return { z, scaled, qualitative };
  };

  const calculatePsychometrics = (profile) => {
    const keys = ['gf', 'gc', 'gc_info', 'gwm', 'gfq', 'gv', 'gs'];
    const validKeys = keys.filter(k => profile[k] !== undefined);
    
    if (validKeys.length >= 4) {
      const zs = validKeys.map(k => engine.calculateZ(profile[k], k));
      const avgZ = zs.reduce((a, b) => a + b) / zs.length;
      const iq = engine.getDeviationIQ(avgZ);
      const percentile = engine.getPercentile(avgZ);
      const ci = engine.getConfidenceInterval(iq);
      return { iq, percentile, ci, z: avgZ };
    }
    return { iq: '--', percentile: '--', ci: { low: '--', high: '--' }, z: null };
  };

  const results = {
    gf: processSubtest(scores.gf, 'gf'),
    gc: processSubtest(scores.gc, 'gc'),
    gc_info: processSubtest(scores.gc_info, 'gc_info'),
    gwm: processSubtest(scores.gwm, 'gwm'),
    gfq: processSubtest(scores.gfq, 'gfq'),
    gs: processSubtest(scores.gs, 'gs'),
    gv: processSubtest(scores.gv, 'gv')
  };

  const psych = calculatePsychometrics(scores);

  const radarData = [
    { subject: 'Fluid', A: results.gf.scaled === '--' ? 10 : results.gf.scaled },
    { subject: 'Verbal', A: results.gc.scaled === '--' ? 10 : results.gc.scaled },
    { subject: 'Info', A: results.gc_info.scaled === '--' ? 10 : results.gc_info.scaled },
    { subject: 'Memory', A: results.gwm.scaled === '--' ? 10 : results.gwm.scaled },
    { subject: 'Quant', A: results.gfq.scaled === '--' ? 10 : results.gfq.scaled },
    { subject: 'Visual', A: results.gv.scaled === '--' ? 10 : results.gv.scaled },
    { subject: 'Speed', A: results.gs.scaled === '--' ? 10 : results.gs.scaled }
  ];

  const renderStatCard = (title, domainKey, data) => (
    <div key={domainKey} className="dashboard-card" style={{ opacity: data.scaled === '--' ? 0.5 : 1 }}>
      <div className="muted text-xs uppercase">{title}</div>
      <div className="font-bold text-lg">{data.scaled}</div>
      <div className="accent text-xs">{data.qualitative}</div>
    </div>
  );

  return (
    <div className="w-full" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="dashboard-header">
        <div className="text-left">
           <h2 className="text-3xl gradient-text" style={{ marginBottom: '0.2rem' }}>Cognitive Intelligence Profile</h2>
           <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Scientific Clinical Assessment • CHC Standard</p>
        </div>
        <button onClick={generatePDF} className="btn-primary" style={{ padding: '0.8rem 1.5rem', fontSize: '0.8rem' }}>
           Download Clinical Report (PDF)
        </button>
      </div>
      
      <div ref={pdfRef} style={{ background: '#050510', padding: '2rem', borderRadius: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Full Scale IQ (G)</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', margin: '1rem 0' }}>
               <div>
                  <h1 style={{ fontSize: '5rem', margin: 0 }}>{psych.iq}</h1>
                  <span style={{ color: 'var(--color-primary)', fontSize: '0.8rem' }}>Interval: {psych.ci.low} - {psych.ci.high}</span>
               </div>
               <div style={{ borderLeft: '1px solid var(--color-border)', paddingLeft: '2rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '2rem', color: 'var(--color-accent)' }}>{psych.percentile}th</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Percentile Rank</div>
               </div>
            </div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>Psychometrically derived estimate based on {Object.keys(scores).length} factors.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.8rem', textAlign: 'left' }}>
            {renderStatCard('Fluid Reasoning', 'gf', results.gf)}
            {renderStatCard('Verbal Comp', 'gc', results.gc)}
            {renderStatCard('Information', 'gc_info', results.gc_info)}
            {renderStatCard('Working Memory', 'gwm', results.gwm)}
            {renderStatCard('Quantitative', 'gfq', results.gfq)}
            {renderStatCard('Visual Patterns', 'gv', results.gv)}
            {renderStatCard('Processing Speed', 'gs', results.gs)}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '400px' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>CHC COGNITIVE MAP (G)</h3>
          <div style={{ width: '100%', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 19]} tick={false} axisLine={false} />
                <Radar
                  dataKey="A"
                  stroke="var(--color-primary)"
                  fill="var(--color-primary)"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>Values represent Standard Scaled Scores (M=10, SD=3)</p>
        </div>
      </div>
    </div>

      {user && user.id && (
        <div className="glass-panel" style={{ marginTop: '2rem', padding: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Clinical History</h3>
          {loading ? (
             <p style={{color: 'var(--color-text-muted)'}}>Retrieving vault...</p>
          ) : history.length > 0 ? (
             <div style={{ overflowX: 'auto' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                 <thead>
                   <tr style={{ color: 'var(--color-primary)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                     <th style={{ padding: '0.8rem', textAlign: 'left' }}>Date</th>
                     <th style={{ padding: '0.8rem' }}>FSIQ</th>
                     <th style={{ padding: '0.8rem' }}>PR</th>
                     <th style={{ padding: '0.8rem' }}>Gf</th>
                     <th style={{ padding: '0.8rem' }}>Gc</th>
                     <th style={{ padding: '0.8rem' }}>Gwm</th>
                     <th style={{ padding: '0.8rem' }}>Gfq</th>
                     <th style={{ padding: '0.8rem' }}>Gv</th>
                     <th style={{ padding: '0.8rem' }}>Gs</th>
                   </tr>
                 </thead>
                 <tbody>
                   {history.map(item => {
                     const p = calculatePsychometrics(item.profile);
                     return (
                       <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                         <td style={{ padding: '0.8rem' }}>{new Date(item.created_at).toLocaleDateString()}</td>
                         <td style={{ padding: '0.8rem', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>{p.iq}</td>
                         <td style={{ padding: '0.8rem', textAlign: 'center' }}>{p.percentile}</td>
                         <td style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{engine.getScaledScore(engine.calculateZ(item.profile.gf, 'gf'))}</td>
                         <td style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{engine.getScaledScore(engine.calculateZ(item.profile.gc, 'gc'))}</td>
                         <td style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{engine.getScaledScore(engine.calculateZ(item.profile.gwm, 'gwm'))}</td>
                         <td style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{engine.getScaledScore(engine.calculateZ(item.profile.gfq, 'gfq'))}</td>
                         <td style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{engine.getScaledScore(engine.calculateZ(item.profile.gv, 'gv'))}</td>
                         <td style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{engine.getScaledScore(engine.calculateZ(item.profile.gs, 'gs'))}</td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
             </div>
          ) : (
            <p style={{color: 'var(--color-text-muted)'}}>No prior data stored.</p>
          )}
        </div>
      )}
    </div>
  );
}


