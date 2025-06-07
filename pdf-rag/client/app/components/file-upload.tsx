/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import * as React from 'react';
import { Upload, CheckCircle, Loader2, FileText, Trash2, Activity } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FileUploadComponent: React.FC = () => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [currentDocument, setCurrentDocument] = React.useState<string | null>(null);

  const handleFileUploadButtonClick = () => {
    const el = document.createElement('input');
    el.setAttribute('type', 'file');
    el.setAttribute('accept', 'application/pdf');
    el.addEventListener('change', async (ev) => {
      if (el.files && el.files.length > 0) {
        const file = el.files.item(0);
        if (file) {
          setIsUploading(true);
          try {
            const formData = new FormData();
            formData.append('pdf', file);

            const response = await fetch('http://localhost:8000/upload/pdf', {
              method: 'POST',
              body: formData,
            });

            if (response.ok) {
              const data = await response.json();
              setCurrentDocument(data.filename || file.name);
              console.log('Medical document uploaded successfully');
            } else {
              console.error('Medical document upload failed');
            }
          } catch (error) {
            console.error('Upload error:', error);
          } finally {
            setIsUploading(false);
          }
        }
      }
    });
    el.click();
  };

  const handleClearDocument = async () => {
    try {
      const response = await fetch('http://localhost:8000/clear-document', {
        method: 'DELETE',
      });
      if (response.ok) {
        setCurrentDocument(null);
        console.log('Medical document cleared');
      }
    } catch (error) {
      console.error('Clear error:', error);
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Upload Area */}
      <Card className="border-2 border-dashed border-gray-300 hover:border-black transition-colors bg-white">
        <CardContent className="p-6">
          <div
            onClick={handleFileUploadButtonClick}
            className="flex flex-col items-center justify-center cursor-pointer text-center space-y-4"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 text-black animate-spin" />
                <div>
                  <h3 className="text-base font-semibold text-black">Processing Medical Document</h3>
                  <p className="text-sm text-gray-600">Analyzing clinical content...</p>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400" />
                <div>
                  <h3 className="text-base font-semibold text-black">Upload Medical Document</h3>
                  <p className="text-sm text-gray-600">Patient records • Clinical notes • Research papers</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Document */}
      {currentDocument && (
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-black">Active Medical Document</p>
                  <p className="text-xs text-gray-600 truncate">{currentDocument}</p>
                </div>
              </div>
              <Button
                onClick={handleClearDocument}
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-gray-300 hover:bg-red-50 hover:border-red-300"
              >
                <Trash2 className="h-3 w-3 text-gray-500 hover:text-red-500" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Document Types */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-black">Supported Medical Documents</h4>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border border-gray-200">
            <FileText className="h-4 w-4 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-black">Patient Records</p>
              <p className="text-xs text-gray-600">Medical histories, lab results, imaging reports</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border border-gray-200">
            <FileText className="h-4 w-4 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-black">Clinical Notes</p>
              <p className="text-xs text-gray-600">Progress notes, discharge summaries, consultations</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded border border-gray-200">
            <FileText className="h-4 w-4 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-black">Research Papers</p>
              <p className="text-xs text-gray-600">Medical journals, clinical studies, guidelines</p>
            </div>
          </div>
        </div>
      </div>

      {/* Security Notice */}
      <div className="p-3 bg-gray-50 rounded border border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-xs">🔒</span>
          </div>
          <p className="text-xs text-gray-600">
            All medical documents are processed securely and comply with healthcare privacy standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploadComponent;
