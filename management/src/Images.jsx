import React, { useEffect, useState } from "react";
import { db, checked } from "./lib";
import { useT } from "./i18n";
const initials = (name) => String(name || "").split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join("").toUpperCase();
export function usePrivateImage(bucket, path) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let live = true;
    let objectUrl = "";
    setUrl("");
    if (!path) return () => { live = false; };
    checked(db.storage.from(bucket).download(path))
      .then((blob) => {
        if (!live) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => { if (live) setUrl(""); });
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [bucket, path]);
  return url;
}
export function Avatar({ person, className = "avatar", size = 40, onReplace }) {
  const t = useT(), url = usePrivateImage("profile-photos", person?.avatar_path);
  const name = person?.preferred_name || person?.name || person?.full_name || person?.email || "";
  return <span className={className} style={{ width: size, height: size }} aria-label={name || t("Pessoa", "Person")} onContextMenu={(event) => { if (onReplace) { event.preventDefault(); onReplace(); } }} title={onReplace ? t("Clique com o botão direito para substituir a imagem", "Right-click to replace this image") : undefined}>
    {url ? <img src={url} alt="" /> : initials(name)}
  </span>;
}
function procedureImageSlug(procedure) {
  const name = `${procedure?.name || ""} ${procedure?.category || ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/₂/g, "2");
  const matches = [["terco inferior", "toxina-botulinica-platisma-e-terco-inferior"], ["platisma", "toxina-botulinica-platisma-e-terco-inferior"], ["botox", "toxina-botulinica-terco-superior-da-face"], ["toxina", "toxina-botulinica-terco-superior-da-face"], ["peeling ata", "peeling-de-ata"], ["ultraformer", "ultraformer-mpt"], ["light sheer", "reducao-de-pelos-a-laser-com-lightsheer-duet"], ["lightsheer", "reducao-de-pelos-a-laser-com-lightsheer-duet"], ["depilacao", "reducao-de-pelos-a-laser-com-lightsheer-duet"], ["hair removal", "reducao-de-pelos-a-laser-com-lightsheer-duet"], ["pelos", "reducao-de-pelos-a-laser-com-lightsheer-duet"], ["co2", "laser-acupulse-co2"], ["acu", "laser-acupulse-co2"], ["mmp", "mmp-microinfusao-de-medicamentos-na-pele"], ["microagul", "microagulhamento"], ["capilar", "mesoterapia-capilar"], ["limpeza", "limpeza-de-pele-profunda"], ["cleansing", "limpeza-de-pele-profunda"], ["jessner", "peeling-de-jessner"], ["cristal", "peeling-de-cristal-microdermoabrasao"], ["diamante", "peeling-de-diamante"], ["ultrasson", "peeling-ultrassonico"], ["retino", "peeling-retinoico"], ["vasinho", "peim-tratamento-estetico-para-microvasos"], ["microvaso", "peim-tratamento-estetico-para-microvasos"], ["peim", "peim-tratamento-estetico-para-microvasos"], ["plasma", "tecnologia-de-plasma"], ["radiofrequencia", "radiofrequencia"], ["melasma", "protocolo-profissional-de-despigmentacao"], ["pigment", "protocolo-profissional-de-despigmentacao"], ["mancha", "protocolo-profissional-de-despigmentacao"], ["harmony", "plataforma-harmony-de-laser-e-luz"], ["laser", "plataforma-harmony-de-laser-e-luz"], ["peeling", "peeling-retinoico"]];
  return matches.find(([term]) => name.includes(term))?.[1] || "limpeza-de-pele-profunda";
}
function procedureOnlineImageUrl(procedure) {
  const sourceNames = {
    "peeling-de-ata": "peeling-ata",
    "peeling-de-jessner": "peeling-jessner",
    "protocolo-profissional-de-despigmentacao": "protocolo-despigmentacao",
    "toxina-botulinica-terco-superior-da-face": "toxina-botulinica-terco-superior",
    "peim-tratamento-estetico-para-microvasos": "peim-microvasos",
    "plataforma-harmony-de-laser-e-luz": "plataforma-harmony-laser-luz",
    "mmp-microinfusao-de-medicamentos-na-pele": "mmp-microinfusao",
    "tecnologia-de-plasma": "tecnologia-plasma-jet",
    "reducao-de-pelos-a-laser-com-lightsheer-duet": "lightsheer-duet-depilacao-laser",
    "toxina-botulinica-platisma-e-terco-inferior": "toxina-botulinica-platisma-terco-inferior",
  };
  const slug = procedureImageSlug(procedure);
  return `https://francielesofiati.com/assets/treatments/services/${sourceNames[slug] || slug}.png`;
}
export function ProcedureImage({ procedure, className = "", onError }) {
  const storedPath = procedure?.image_url?.startsWith("storage://")
    ? procedure.image_url.slice("storage://".length)
    : "";
  const storedUrl = usePrivateImage("profile-photos", storedPath);
  const onlineSource = procedureOnlineImageUrl(procedure);
  const localFallback = `/procedure-images/${procedureImageSlug(procedure)}.png`;
  const primary = storedPath ? storedUrl : procedure?.image_url || onlineSource;
  const fallbacks = [...new Set([onlineSource, localFallback])].filter((source) => source !== primary);
  return <img className={className} src={primary || undefined} alt={procedure?.name || ""} loading="lazy" onError={(event) => { const next = fallbacks.shift(); if (next) event.currentTarget.src = next; else onError?.(event); }} />;
}
