export const procedureNames = {
 harmony:'Harmony', lightsheer:'LightSheer', toxina:'Toxina botulínica', co2:'Laser de CO₂', ultraformer:'Ultraformer', radiofrequencia:'Radiofrequência', plasma:'Jato de plasma', mmp_capilar:'MMP capilar', mmp_pele:'MMP da pele', peim:'PEIM', peeling_mecanico:'Peeling mecânico', peeling_quimico:'Peeling químico', peeling_ultrassonico:'Peeling ultrassônico', peeling_cristal:'Peeling de cristal', peeling_diamante:'Peeling de diamante', enzimas:'Enzimas', limpeza_pele:'Limpeza de pele',
};
export function procedureSummary(value) {
 const values = Array.isArray(value) ? value : String(value || '').split(',').map(item=>item.trim()).filter(Boolean);
 return values.map(item=>procedureNames[item] || item).join(', ');
}
