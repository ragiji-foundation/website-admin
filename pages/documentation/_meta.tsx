import { ReactNode } from 'react';

export interface MetaItem {
  type?: string;
  title?: string;
  theme?: {
    breadcrumb?: boolean;
  };
}

export interface Meta {
  [key: string]: MetaItem | string;
}

const meta: Meta = {
  '*': {
    theme: {
      breadcrumb: false
    }
  },
  index: 'Home',
  docs: {
    title: 'Documentation',
    type: 'page'
  }
};

export default function DocumentationMeta(): ReactNode {
  return null;
}

export { meta };
