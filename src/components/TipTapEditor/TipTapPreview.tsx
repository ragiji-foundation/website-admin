'use client';
import React from 'react';
import { Paper } from '@mantine/core';
import classes from './TipTapEditor.module.css';

interface TipTapPreviewProps {
  content: string;
  className?: string;
}

const TipTapPreview: React.FC<TipTapPreviewProps> = ({ content, className }) => {
  return (
    <Paper className={`${classes.previewWrapper} ${className || ''}`}>
      <div
        className={classes.editorContent}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Paper>
  );
};

export default TipTapPreview;
