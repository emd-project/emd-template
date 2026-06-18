/**
 * affiliate.ts — NEUTRALISÉ (dé-affiliation).
 *
 * Le modèle économique EMD n'a AUCUNE affiliation : la monétisation passe par
 * la vente de mentions, pas par des liens affiliés. addAffiliateTag est donc un
 * pass-through : il retourne l'URL telle quelle, sans ajouter de tag.
 *
 * On conserve la fonction (et sa signature) pour ne casser aucun appelant
 * existant (AffiliateLink, AffiliateButton, StickyCTA, article-ctas,
 * remarkAmazonAffiliate). Tout continue de compiler.
 */

/**
 * Retourne l'URL inchangée. Aucun paramètre d'affiliation n'est ajouté.
 * (Anciennement : injectait un tag Amazon `?tag=`.)
 */
export function addAffiliateTag(href: string): string {
  return href
}
