'use client';
import { useState, useEffect } from 'react';
import classes from './RichTextContent.module.css';

interface RichTextContentProps {
  content: string;
  className?: string;
  containerClassName?: string;
  truncate?: boolean;
  maxLength?: number;
}

export function RichTextContent({
  content,
  className,
  containerClassName,
  truncate = false,
  maxLength = 150
}: RichTextContentProps) {
  const [mounted, setMounted] = useState(false);
  const [processedContent, setProcessedContent] = useState('');

  // Process content to handle TipTap HTML, truncation, etc.
  useEffect(() => {
    if (!content) {
      setProcessedContent('');
      return;
    }

    console.log('Processing raw content:', content.substring(0, 100));

    // For the specific case where HTML tags are visible as text rather than being parsed
    if (content.includes('<p>') || content.includes('</p>')) {
      // Check if the content has HTML tags that are being displayed as text
      // This happens when the HTML is escaped, so we need to parse it
      try {
        // Create a temporary DOM element to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');

        // If the parsing created a valid document with content, use it
        if (doc.body.textContent) {
          // Preserve the HTML structure but ensure it's properly rendered
          setProcessedContent(doc.body.innerHTML);
          return;
        }
      } catch (e) {
        console.log('Error parsing HTML:', e);
      }
    }

    // If we get here, try the regular content handling
    let htmlContent = content;

    // Try to handle various content formats
    try {
      // If it's JSON or looks like JSON, try to parse it
      if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('['))) {
        const parsed = JSON.parse(content);

        // Handle Lexical JSON format
        if (parsed.root?.children) {
          htmlContent = parsed.root.children
            .map((paragraph: any) => {
              if (!paragraph.children) return '';
              return `<p>${paragraph.children.map((node: any) => node.text || '').join('')}</p>`;
            })
            .join('');
        }
        // Handle TipTap JSON format
        else if (parsed.type === 'doc' && parsed.content) {
          htmlContent = parsed.content
            .map((node: any) => {
              if (node.type === 'paragraph') {
                return `<p>${node.content?.map((textNode: any) => textNode.text || '').join('') || ''}</p>`;
              }
              return '';
            })
            .join('');
        }
      }
    } catch (e) {
      // Not valid JSON or couldn't parse - just use the original content as is
      console.log('Not JSON or parse error:', e);
    }

    // Handle truncation if needed
    if (truncate && htmlContent.length > maxLength) {
      htmlContent = htmlContent.substring(0, maxLength) + '...';
    }

    // Set the processed content
    setProcessedContent(htmlContent);
  }, [content, truncate, maxLength]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render on server to avoid hydration issues
  if (!mounted) {
    return (
      <div className={containerClassName}>
        <div className={`${classes.placeholder} ${className || ''}`}>
          Loading content...
        </div>
      </div>
    );
  }

  if (!processedContent) {
    return (
      <div className={containerClassName}>
        <div className={`${classes.placeholder} ${className || ''}`}>
          No content available
        </div>
      </div>
    );
  }

  // Add debug information in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('Rendering processed content:', processedContent.substring(0, 100));
  }

  return (
    <div className={containerClassName}>
      <div
        className={`${classes.content} ${className || ''}`}
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
    </div>
  );
}
