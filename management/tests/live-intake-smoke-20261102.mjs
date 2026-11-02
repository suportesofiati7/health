import { randomUUID, createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import assert from "node:assert/strict";

const api = "https://naypgbhwnlbyqqqfftgn.supabase.co/functions/v1/formulario";
const mark = "TESTE AUTOMATIZADO - DESCARTAR - SEM PACIENTE REAL";
function validCpf() {
  let digits = [..."826401735"].map(Number);
  for (let length of [9,10]) {
    const sum=digits.reduce((a,d,i)=>a+d*(length+1-i),0);
    digits.push(((sum*10)%11)%10);
  }
  return digits.join("");
}
function crc32(buffer) {
 let crc=0xffffffff;
 for(const b of buffer) {crc ^= b;for(let i=0;i<8;i++)crc=(crc>>>1)^(crc&1?0xedb88320:0);}
 return (crc^0xffffffff)>>>0;
}
function chunk(type,data) {
 const typeBytes=Buffer.from(type), length=Buffer.alloc(4), crc=Buffer.alloc(4);
 length.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(Buffer.concat([typeBytes,data])));
 return Buffer.concat([length,typeBytes,data,crc]);
}
function png() {
 const header=Buffer.from("89504e470d0a1a0a","hex");
 const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(8,0);ihdr.writeUInt32BE(8,4);ihdr[8]=8;ihdr[9]=2;
 const pixels=Buffer.alloc(8*(1+8*3));
 for(let y=0;y<8;y++){const off=y*25;pixels[off]=0;for(let x=0;x<8;x++){pixels[off+1+x*3]=85+y*10;pixels[off+2+x*3]=110+x*10;pixels[off+3+x*3]=70;}}
 return Buffer.concat([header,chunk("IHDR",ihdr),chunk("IDAT",deflateSync(pixels)),chunk("IEND",Buffer.alloc(0))]);
}
function pdf() {
 const parts=["%PDF-1.4\n"];let offsets=[];
 const objects=[
 "<< /Type /Catalog /Pages 2 0 R >>",
 "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
 "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 300] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
 "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
 "<< /Length 84 >>\nstream\nBT /F1 14 Tf 40 220 Td (TESTE AUTOMATIZADO - SEM PACIENTE REAL) Tj ET\nendstream"
 ];
 for(let i=0;i<objects.length;i++) {offsets.push(Buffer.byteLength(parts.join("")));parts.push(`${i+1} 0 obj\n${objects[i]}\nendobj\n`);}
 const begin=Buffer.byteLength(parts.join(""));
 parts.push(`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`);
 for(const o of offsets)parts.push(String(o).padStart(10,"0")+" 00000 n \n");
 parts.push(`trailer\n<< /Root 1 0 R /Size ${objects.length+1} >>\nstartxref\n${begin}\n%%EOF\n`);
 return Buffer.from(parts.join(""));
}
const jpeg=Buffer.from("/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAoHBwgHBgoICAgLCgoLDhgQDg0NDh0VFhEYIx8lJCIfIiEmKzcvJik0KSEiMEExNDk7Pj4+JS5ESUM8SDc9Pjv/2wBDAQoLCw4NDhwQEBw7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozv/wAARCAAIAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDYooorxT0T/9k=","base64");
const files=[
 {field_name:"identity_upload",name:"TESTE-documento-ficticio.pdf",type:"application/pdf",buffer:pdf()},
 {field_name:"booking_payment_receipt",name:"TESTE-comprovante-ficticio.png",type:"image/png",buffer:png()},
 {field_name:"supporting_attachments",name:"TESTE-imagem-ficticia.jpg",type:"image/jpeg",buffer:jpeg},
];
const yes=["initial_acknowledgement","booking_fee_acknowledgement","general_risk_acknowledgement","truth_declaration","marketing_revocation_acknowledgement","lgpd_personal_data_consent","lgpd_sensitive_data_consent","final_acceptance"];
const payload={
 form_version:"2026-11-02", language:"pt-BR", full_name:mark,
 preferred_name:"TESTE", email:"clinical-test@example.invalid", phone:"43990000000",
 cpf:validCpf(),identity_document:"TESTE-000",identity_issuer:"TESTE",identity_letter:"A",
 birth_date:"1990-01-01",address:"Endereço fictício - sem paciente real",postal_code:"86000000",
 adult_status:"adult",guardian_details:"Não se aplica",
 selected_procedures:["toxina"],selected_procedure:"toxina",accepted_term_toxina:"yes",
 "treatment_área":"Região fictícia de teste",
 appointment_date:"2026-11-15",appointment_time:"10:30",
 health_notes:"DADOS SINTÉTICOS, nenhum paciente real",
 technical_image_authorisation:"no",marketing_image_authorisation:"no",
 promotional_communication:"no",signature_name:mark,signature_method:"typed_name",
 consent_texts:{toxina:"TESTE AUTOMATIZADO: termo não vinculante; sem paciente real"},
};
for(const k of yes)payload[k]="yes";
const manifests=files.map(f=>({field_name:f.field_name,name:f.name,size:f.buffer.length,type:f.type,sha256:createHash("sha256").update(f.buffer).digest("hex")}));
const request_id=randomUUID();
async function post(body) {
 const response=await fetch(api,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:AbortSignal.timeout(30000)});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(`Form ${body.action}: HTTP ${response.status}, error=${data.error||"unknown"}`);
 return data;
}
console.log("Starting real production form smoke test; all data synthetic; request_id:",request_id);
console.log("Synthetic file types:",manifests.map(x=>x.type).join(", "));
const prepared=await post({action:"prepare",request_id,payload,attachments:manifests});
assert.equal(prepared.prepared,true);
assert.equal(prepared.files.length,files.length);
console.log("PREPARE OK");
for(let i=0;i<files.length;i++){
 const item=prepared.files[i];
 if(item.uploaded)continue;
 const response=await fetch(item.upload_url,{method:"PUT",headers:{"Content-Type":files[i].type},body:files[i].buffer,signal:AbortSignal.timeout(60000)});
 if(!response.ok){const err=(await response.text()).slice(0,300);throw Error(`Upload ${i}: HTTP ${response.status} ${err}`);}
 console.log("UPLOAD OK",files[i].type);
}
const completed=await post({action:"complete",session:prepared.session});
assert.equal(completed.received,true);
assert.equal(completed.attachments,files.length);
console.log("LIVE TEST COMPLETE",JSON.stringify({request_id,attachmentCount:completed.attachments,types:manifests.map(x=>x.type)}));
