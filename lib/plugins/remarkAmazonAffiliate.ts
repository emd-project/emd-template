import { visit } from 'unist-util-visit'
import type { Node } from 'unist'
import { addAffiliateTag } from '@/lib/utils/affiliate'

interface LinkNode extends Node {
  type: 'link'
  url: string
}

export function remarkAmazonAffiliate() {
  return (tree: Node) => {
    visit(tree, 'link', (node: LinkNode) => {
      node.url = addAffiliateTag(node.url)
    })
  }
}
