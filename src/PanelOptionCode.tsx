import React from 'react';
import { StandardEditorProps } from '@grafana/data';
import { CodeEditor } from '@grafana/ui';
const { ResizableBox } = require('react-resizable');
import './CSS/panel.css';

// TODO: remove PanelOptionCode and try to remove react-resizable 
export const PanelOptionCode: React.FC<StandardEditorProps<string, any, any, any>> = React.memo(
  ({ value, onChange }) => {
    const language = 'javascript';
    const height = 300;

    const handleBlur = (code: string) => {
      onChange(code);
    };

    const content =
      typeof value === 'string' ? value : language === 'javascript' ? value : JSON.stringify(value, null, 2);

    return (
      <ResizableBox
        height={height}
        minConstraints={[100, 100]}
        maxConstraints={[800, 800]}
        resizeHandles={['se', 's', 'sw']}
      >
        <CodeEditor
          language={language}
          showLineNumbers={language === 'javascript'}
          value={content}
          onBlur={handleBlur}
        />
      </ResizableBox>
    );
  }
);

PanelOptionCode.displayName = 'PanelOptionCode';
