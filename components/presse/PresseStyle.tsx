/**
 * PresseStyle — règles de mise en page de l'identité ÉDITORIALE (`presse`).
 *
 * Injecté en <style> (même pattern que `PermutationStyle`) plutôt qu'ajouté au CSS
 * global : les composants presse sont majoritairement inline-stylés (comme la maquette),
 * seules les GRILLES et les points de rupture ont besoin de vraies règles CSS.
 * Aucune couleur ici — uniquement de la structure. Monté par le layout quand la
 * variante presse est active.
 */
const CSS = `
/* La une : lead + colonne de brèves */
.presse-une { display:grid; grid-template-columns:1.35fr 1fr; gap:22px; }

/* Corps + colonne sticky */
.presse-body { display:grid; grid-template-columns:1fr 320px; gap:56px; align-items:start; }
.presse-aside { display:flex; flex-direction:column; gap:34px; position:sticky; top:72px; }

/* Section catégorie : lead + brèves */
.presse-cat { display:grid; grid-template-columns:1.1fr 1fr; gap:28px; }

/* Article vedette d'un listing (hub blog, catégorie) : cover + texte */
.presse-lead { display:grid; grid-template-columns:1.1fr 1fr; gap:34px; align-items:center; }

/* Grilles d'articles (hub blog, catégorie) */
.presse-grid3 { display:grid; grid-template-columns:repeat(3, 1fr); gap:32px 28px; }

/* Explorer par thème */
.presse-themes { display:grid; grid-template-columns:repeat(5, 1fr); gap:16px; }

/* Article : sommaire sticky + corps */
.presse-article { display:grid; grid-template-columns:220px 1fr; gap:48px; align-items:start; }
.presse-toc { position:sticky; top:72px; }

/* Deux colonnes (pour/contre, etc.) */
.presse-2col { display:grid; grid-template-columns:1fr 1fr; gap:0; }

/* Le masthead ne doit jamais déborder */
.presse-lang { font-size:11px; letter-spacing:0.1em; text-transform:uppercase; }

@media (max-width: 1000px) {
  .presse-body { grid-template-columns:1fr; gap:40px; }
  .presse-aside { position:static; }
}
@media (max-width: 900px) {
  .presse-une { grid-template-columns:1fr; gap:28px; }
  .presse-article { grid-template-columns:1fr; gap:28px; }
  .presse-toc { position:static; }
  .presse-grid3 { grid-template-columns:repeat(2, 1fr); }
  .presse-themes { grid-template-columns:repeat(3, 1fr); }
  .presse-lead { grid-template-columns:1fr; gap:22px; }
}
@media (max-width: 760px) {
  .presse-cat { grid-template-columns:1fr; gap:22px; }
}
@media (max-width: 600px) {
  .presse-grid3 { grid-template-columns:1fr; }
  .presse-themes { grid-template-columns:repeat(2, 1fr); }
  .presse-2col { grid-template-columns:1fr; }
}
`

export function PresseStyle() {
  return <style dangerouslySetInnerHTML={{ __html: CSS }} />
}
