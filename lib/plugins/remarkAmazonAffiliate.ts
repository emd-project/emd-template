/**
 * remarkAmazonAffiliate — NEUTRALISÉ (dé-affiliation).
 *
 * EMD n'a aucune affiliation. Ce plugin remark ne tague plus les liens : il est
 * conservé comme no-op pour ne pas casser son import dans le pipeline MDX
 * (app/(site)/[article]/page.tsx). Les liens des articles MDX restent intacts.
 */

import type { Node } from 'unist'

export function remarkAmazonAffiliate() {
  return (_tree: Node) => {
    // no-op : aucun tag d'affiliation n'est injecté.
  }
}
