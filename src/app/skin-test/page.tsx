'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Sparkles } from 'lucide-react';
import { ImageUpload } from '@/components/image-upload';
import { AnalysisResult } from '@/components/analysis-result';
import { mockSkinResults } from '@/lib/mock-data';

export default function SkinTestPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [hasImage, setHasImage] = useState(false);

  const handleImageSelect = () => {
    setHasImage(true);
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis delay
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 2000);
  };

  return (
    <div className="container-app py-8 sm:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
          <Camera className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">AI 肤质测试</h1>
        <p className="text-muted max-w-md mx-auto">
          上传你的面部照片，AI 将智能分析你的肤质类型并给出个性化建议
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Upload Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card">
            <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">1</span>
              上传照片
            </h2>
            <ImageUpload onImageSelect={handleImageSelect} />
            {hasImage && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="btn-primary w-full mt-4 gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    AI 分析中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    开始分析
                  </>
                )}
              </motion.button>
            )}

            {/* Tips */}
            <div className="mt-6 p-4 rounded-lg bg-surface-hover">
              <h3 className="text-xs font-semibold text-white mb-2">拍摄提示</h3>
              <ul className="text-xs text-muted space-y-1">
                <li>• 在自然光下拍摄效果最佳</li>
                <li>• 保持面部清洁，不要化妆</li>
                <li>• 正面拍摄，表情自然</li>
                <li>• 确保面部占照片的主要部分</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          {analysisComplete ? (
            <AnalysisResult result={mockSkinResults.combination} />
          ) : (
            <div className="card flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-muted/30" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                等待分析
              </h3>
              <p className="text-sm text-muted max-w-xs">
                上传照片并点击"开始分析"，AI 将为你生成详细的肤质报告
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
