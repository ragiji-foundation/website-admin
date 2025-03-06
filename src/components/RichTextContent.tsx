import React from 'react';

interface RichTextContentProps {
  content: string | {
    type: string;
    content?: any[];
  };
}

export const RichTextContent: React.FC<RichTextContentProps> = ({ content }) => {
  if (!content) {
    return <p>No content to display.</p>;
  }

  // Handle both string and object content
  const htmlContent = typeof content === 'string'
    ? content
    : JSON.stringify(content); // You may need a proper renderer for object content

  return (
    <div
      className="rich-text-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};

// Add global styles for proper image rendering
if (typeof document !== 'undefined') {
  // Only run in browser environment
  const style = document.createElement('style');
  style.textContent = `
    .rich-text-content img {
      max-width: 100%;
      height: auto;
    }
    
    .rich-text-content [style*="text-align: left"] img {
      margin-right: auto;
      margin-left: 0;
    }
    
    .rich-text-content [style*="text-align: center"] img {
      margin-left: auto;
      margin-right: auto;
    }
    
    .rich-text-content [style*="text-align: right"] img {
      margin-left: auto;
      margin-right: 0;
    }
  `;
  document.head.appendChild(style);
}
