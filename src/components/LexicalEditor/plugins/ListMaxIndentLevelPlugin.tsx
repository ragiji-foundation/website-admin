import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useEffect } from 'react';
import { $getSelection, $isRangeSelection } from 'lexical';
import { $isListNode, ListNode } from '@lexical/list';

interface Props {
  maxDepth: number;
}

export default function ListMaxIndentLevelPlugin({ maxDepth }: Props): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(ListNode, (node) => {
      if ($isListNode(node)) {
        const indent = (node as ListNode).getIndent();
        if (indent > maxDepth) {
          (node as ListNode).setIndent(maxDepth);
        }
      }
    });
  }, [editor, maxDepth]);

  return null;
}
