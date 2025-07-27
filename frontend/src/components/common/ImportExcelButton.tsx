import React, { useRef } from 'react';
import { Button, Tooltip } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export const ImportExcelButton: React.FC<{
  onImport: (file: File) => void;
  label?: string;
}> = ({ onImport, label = 'Импорт из Excel' }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Tooltip title={label}>
      <span>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => inputRef.current?.click()}
        >
          {label}
        </Button>
        <input
          type="file"
          accept=".xlsx,.xls"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              onImport(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />
      </span>
    </Tooltip>
  );
};