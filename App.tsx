import React, { useState, useRef, useCallback } from 'react';
import { 
  UploadCloud, 
  BarChart2, 
  Layout, 
  Settings, 
  MoreHorizontal, 
  CheckCircle,
  AlertCircle,
  Share2,
  Download,
  Image as ImageIcon,
  ChevronLeft,
  Wand2,
  Zap,
  Puzzle,     // Replaces Box (Component)
  Shapes,     // Replaces Smile (Icon)
  Aperture,   // Replaces Hexagon (Logo)
  FileImage,  // Replaces Image (Image)
  ArrowRight,
  Palette,
  ExternalLink
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { analyzeDesignImage } from './services/geminiService';
import { AppView, DesignAnalysis, AssetAlternative } from './types';
import { AnalysisSteps } from './components/AnalysisSteps';
import { RadialProgress } from './components/RadialProgress';

// --- Tooltip Component ---
const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div 
      className="relative block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <div 
        className={`
          absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-72 p-4
          bg-gray-900/95 backdrop-blur-sm text-white text-xs leading-relaxed rounded-xl shadow-2xl z-50 pointer-events-none
          border border-white/10
          transition-all duration-200 ease-out origin-bottom
          ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}
        `}
      >
        <div className="font-semibold mb-1 text-blue-400 uppercase tracking-wider text-[10px]">Why this recommendation?</div>
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-gray-900/95" />
      </div>
    </div>
  );
};

// --- Sidebar Component ---
const Sidebar = () => (
  <aside className="hidden lg:flex w-64 flex-col border-r border-gray-200 bg-white h-screen fixed left-0 top-0 z-20">
    <div className="p-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Wand2 size={20} />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg text-gray-900 leading-none">DesignAI</h1>
          <span className="text-xs text-gray-500">Analyzer Tool</span>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {[
          { icon: Layout, label: 'Dashboard', active: false },
          { icon: ImageIcon, label: 'Projects', active: false },
          { icon: BarChart2, label: 'Analysis', active: true },
          { icon: Settings, label: 'Settings', active: false },
        ].map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              item.active 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>

    <div className="mt-auto p-6 border-t border-gray-100">
      <div className="flex items-center gap-3">
        <img 
          src="https://picsum.photos/100/100" 
          alt="User" 
          className="w-9 h-9 rounded-full bg-gray-200 object-cover ring-2 ring-white shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">Alex Designer</p>
          <p className="text-xs text-gray-500 truncate">Pro Plan</p>
        </div>
        <Settings size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>
    </div>
  </aside>
);

// --- ResultsView Component ---
interface ResultsViewProps {
  analysis: DesignAnalysis | null;
  image: string | null;
  resetApp: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ analysis, image, resetApp }) => {
  const [isExporting, setIsExporting] = useState(false);

  const getIconForType = (type: string) => {
    switch (type.toLowerCase()) {
      case 'component': return <Puzzle size={20} strokeWidth={1.5} />;
      case 'icon': return <Shapes size={20} strokeWidth={1.5} />;
      case 'logo': return <Aperture size={20} strokeWidth={1.5} />;
      case 'image': return <FileImage size={20} strokeWidth={1.5} />;
      default: return <Zap size={20} strokeWidth={1.5} />;
    }
  };

  const handleExportPDF = async () => {
    if (!analysis || !image) return;
    setIsExporting(true);

    try {
      const doc = new jsPDF();
      const primaryColor = [23, 115, 207]; // #1773cf
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      let y = 20;

      // Header Bar
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, pageWidth, 30, 'F');
      
      // Header Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Design Analysis Report", margin, 18);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated by DesignAnalyzer AI • ${new Date().toLocaleDateString()}`, margin, 24);

      y = 45;

      // 1. Overall Score Section
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Overall Score", margin, y);
      y += 10;
      
      // Draw Score Circle (Simplified visual)
      doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.setLineWidth(2);
      doc.circle(margin + 15, y + 10, 15, 'S');
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(analysis.score.toString(), margin + 15, y + 12, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      
      // Add a summary text next to score
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Based on automated visual analysis of harmony,\naccessibility, and modern design standards.`, margin + 40, y + 8);
      
      y += 40;

      // 2. Image Preview
      try {
        // Calculate aspect ratio
        const imgProps = doc.getImageProperties(image);
        const imgWidth = 80;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        
        if (y + imgHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Analyzed Design", margin, y);
        y += 5;
        
        doc.addImage(image, 'PNG', margin, y, imgWidth, imgHeight);
        y += imgHeight + 15;
      } catch (e) {
        console.warn("Could not add image to PDF", e);
        doc.text("[Image could not be rendered]", margin, y);
        y += 15;
      }

      // 3. Critique
      if (y > pageHeight - margin) { doc.addPage(); y = margin + 10; }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("AI Critique", margin, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const splitCritique = doc.splitTextToSize(analysis.critique, pageWidth - (margin * 2));
      doc.text(splitCritique, margin, y);
      y += (splitCritique.length * 5) + 15;

      // 4. Layout Analysis
      if (y > pageHeight - margin) { doc.addPage(); y = margin + 10; }
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Layout Analysis", margin, y);
      y += 8;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      const splitLayout = doc.splitTextToSize(analysis.layoutAnalysis, pageWidth - (margin * 2));
      doc.text(splitLayout, margin, y);
      y += (splitLayout.length * 5) + 15;

      // 5. Colors & Typography
      if (y + 60 > pageHeight - margin) { doc.addPage(); y = margin + 10; }

      // Colors
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Color Palette", margin, y);
      y += 10;
      
      let colorX = margin;
      analysis.colors.forEach((color) => {
          doc.setFillColor(color.hex);
          doc.rect(colorX, y, 12, 12, 'F');
          doc.setDrawColor(220, 220, 220);
          doc.rect(colorX, y, 12, 12, 'S');
          
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text(color.hex, colorX, y + 17);
          
          colorX += 30;
          if (colorX > pageWidth - margin) {
            colorX = margin;
            y += 25;
          }
      });
      if (colorX !== margin) y += 25;
      
      y += 10;

      // Typography
      if (y + 40 > pageHeight - margin) { doc.addPage(); y = margin + 10; }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Typography", margin, y);
      y += 10;
      
      analysis.typography.forEach((font) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${font.family} (${font.weight})`, margin, y);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 100, 100);
        doc.text(font.role, margin + 80, y);
        doc.setTextColor(0, 0, 0);
        y += 7;
      });
      
      y += 15;

      // Improvements
      if (y + 40 > pageHeight - margin) { doc.addPage(); y = margin + 10; }

      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Suggested Improvements", margin, y);
      y += 10;
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      analysis.improvements.forEach((imp, i) => {
          const text = `${i + 1}. ${imp}`;
          const splitImp = doc.splitTextToSize(text, pageWidth - (margin * 2));
          doc.text(splitImp, margin, y);
          y += (splitImp.length * 5) + 3;
      });

      // Asset Alternatives (New Page)
      if (analysis.alternatives && analysis.alternatives.length > 0) {
        doc.addPage();
        y = margin;
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Asset Recommendations", margin, y);
        y += 10;

        doc.setLineWidth(0.1);
        doc.setDrawColor(200, 200, 200);

        analysis.alternatives.forEach((alt) => {
           if (y + 35 > pageHeight - margin) {
              doc.addPage();
              y = margin;
           }

           doc.setFillColor(249, 250, 251); // Gray 50
           doc.rect(margin, y, pageWidth - (margin * 2), 30, 'F');
           doc.rect(margin, y, pageWidth - (margin * 2), 30, 'S');

           // Type Badge
           doc.setFontSize(8);
           doc.setFont("helvetica", "bold");
           doc.setTextColor(100, 100, 100);
           doc.text(alt.type.toUpperCase(), margin + 5, y + 8);

           // Current -> Recommendation
           doc.setFontSize(10);
           doc.setTextColor(0, 0, 0);
           doc.text(`${alt.currentDescription}`, margin + 5, y + 16);
           
           doc.setFont("helvetica", "normal");
           doc.text(" → ", margin + 60, y + 16); // Arrow simplified

           doc.setFont("helvetica", "bold");
           doc.setTextColor(37, 99, 235); // Blue 600
           doc.text(`${alt.suggestion}`, margin + 70, y + 16);

           // Reason
           doc.setFont("helvetica", "normal");
           doc.setTextColor(80, 80, 80);
           doc.setFontSize(9);
           const splitReason = doc.splitTextToSize(alt.reasoning, pageWidth - (margin * 2) - 10);
           doc.text(splitReason, margin + 5, y + 24);

           y += 35;
        });
      }

      doc.save("DesignAnalyzer_Report.pdf");
    } catch (e) {
      console.error("PDF generation failed", e);
    } finally {
      setIsExporting(false);
    }
  };

  if (!analysis) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50 animate-in fade-in duration-700">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center z-10 shrink-0">
            <div className="flex items-center gap-4">
                <button onClick={resetApp} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Analysis Report</h1>
                    <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full w-fit mt-1">
                        <CheckCircle size={12} />
                        Analysis Complete
                    </div>
                </div>
            </div>
            <div className="flex gap-3">
                <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                    <Share2 size={16} /> Share
                </button>
                <button 
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isExporting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Download size={16} /> Export PDF
                      </>
                    )}
                </button>
            </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8">
                
                {/* Main Content Area */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                    {/* Image */}
                    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
                        <div className="bg-gray-100 rounded-xl overflow-hidden relative group">
                             {image && <img src={image} className="w-full h-auto" alt="Analyzed Design" />}
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                        </div>
                    </div>

                    {/* Layout */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold font-display text-gray-900 mb-4">Layout Analysis</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">
                            {analysis.layoutAnalysis}
                        </p>
                    </div>

                    {/* Improvements */}
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                         <h3 className="text-blue-900 font-bold mb-4 flex items-center gap-2">
                            <Zap size={18} className="text-blue-600" />
                            Suggested Improvements
                         </h3>
                         <ul className="space-y-3">
                            {analysis.improvements.map((imp, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-blue-800">
                                    <span className="font-bold text-blue-400 font-mono">0{idx + 1}</span>
                                    {imp}
                                </li>
                            ))}
                         </ul>
                    </div>

                    {/* Asset Alternatives (New Section) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="p-6 border-b border-gray-100 rounded-t-xl">
                          <h3 className="text-lg font-bold font-display text-gray-900 flex items-center gap-2">
                             <Palette size={20} className="text-indigo-500" />
                             Asset Recommendations
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">Alternative components, icons, and assets detected in your design.</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {analysis.alternatives?.map((alt, idx) => (
                              <Tooltip key={idx} content={alt.reasoning}>
                                <div className={`p-6 hover:bg-gray-50 transition-colors cursor-help ${idx === (analysis.alternatives?.length || 0) - 1 ? 'rounded-b-xl' : ''}`}>
                                    <div className="flex items-start gap-4">
                                      <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border
                                        ${alt.type === 'Component' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : ''}
                                        ${alt.type === 'Icon' ? 'bg-orange-50 border-orange-100 text-orange-600' : ''}
                                        ${alt.type === 'Logo' ? 'bg-pink-50 border-pink-100 text-pink-600' : ''}
                                        ${alt.type === 'Image' ? 'bg-teal-50 border-teal-100 text-teal-600' : ''}
                                      `}>
                                        {getIconForType(alt.type)}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-gray-900">{alt.currentDescription}</span>
                                            <ArrowRight size={14} className="text-gray-400 hidden md:block" />
                                            <div className="flex items-center gap-2">
                                                {alt.url ? (
                                                  <a 
                                                    href={alt.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="group/link flex items-center gap-1.5 text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all cursor-pointer"
                                                    onClick={(e) => e.stopPropagation()}
                                                  >
                                                    {alt.suggestion}
                                                    <ExternalLink size={10} className="opacity-50 group-hover/link:opacity-100 transition-opacity" />
                                                  </a>
                                                ) : (
                                                  <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 inline-block w-fit">
                                                    {alt.suggestion}
                                                  </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{alt.reasoning}</p>
                                      </div>
                                    </div>
                                  </div>
                              </Tooltip>
                            ))}
                            {(!analysis.alternatives || analysis.alternatives.length === 0) && (
                               <div className="p-8 text-center text-gray-500 text-sm">
                                 No specific asset alternatives found.
                               </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar Analysis Details */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                    {/* Score Card */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Design Score</p>
                            <h2 className="text-3xl font-bold text-gray-900">{analysis.score} <span className="text-lg text-gray-400 font-normal">/ 100</span></h2>
                            <p className="text-xs text-gray-400 mt-2">Based on Gemini Vision Metrics</p>
                        </div>
                        <RadialProgress score={analysis.score || 0} />
                    </div>

                    {/* Critique */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Wand2 size={18} className="text-purple-500" />
                            AI Critique
                        </h3>
                        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                            {analysis.critique}
                        </p>
                    </div>

                    {/* Colors */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-900">Color Palette</h3>
                            <button className="text-xs font-medium text-blue-600 hover:text-blue-800">COPY ALL</button>
                        </div>
                        <div className="space-y-3">
                            {analysis.colors.map((color, i) => (
                                <div key={i} className="flex items-center justify-between group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full shadow-inner ring-1 ring-black/5" style={{ backgroundColor: color.hex }}></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{color.hex}</p>
                                            <p className="text-xs text-gray-500">{color.name}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                        {color.usage}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                     {/* Typography */}
                     <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <h3 className="font-bold text-gray-900 mb-4">Typography</h3>
                        <div className="space-y-4">
                            {analysis.typography.map((font, i) => (
                                <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                                    <p className="text-xs font-medium text-gray-500 uppercase mb-1">{font.role}</p>
                                    <p className="text-xl text-gray-900" style={{ 
                                        fontFamily: font.family.includes('Inter') ? 'Inter, sans-serif' : 'serif',
                                        fontWeight: font.weight === 'Bold' ? 700 : 400 
                                    }}>
                                        {font.family} {font.weight}
                                    </p>
                                    <div className="flex gap-4 mt-2">
                                        <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Weight: {font.weight}</span>
                                        {font.size && <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">Size: {font.size}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<AppView>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DesignAnalysis | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        setError("File size too large. Max 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        setImage(base64);
        setView('analyzing');
        setError(null);
        await runAnalysis(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const runAnalysis = async (base64: string) => {
    try {
      // Step 1: Ingestion
      setStepIndex(0);
      await new Promise(r => setTimeout(r, 1500)); 

      // Step 2: Layout
      setStepIndex(1);
      
      // Start API call in background while showing fake progress for UX
      const apiPromise = analyzeDesignImage(base64);
      
      // Artificial delay for layout step to let user read logs
      await new Promise(r => setTimeout(r, 3500)); 
      
      // Step 3: Semantic
      setStepIndex(2);
      await new Promise(r => setTimeout(r, 2500)); 

      // Step 4: Critique & Finalize
      setStepIndex(3);
      const result = await apiPromise;
      
      setAnalysis(result);
      setView('results');
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
      setView('upload');
    }
  };

  const resetApp = () => {
    setImage(null);
    setAnalysis(null);
    setView('upload');
    setStepIndex(0);
  };

  // --- Views ---

  const UploadView = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-6 h-full animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-display font-bold text-gray-900">Upload Design</h2>
          <button className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <MoreHorizontal size={20} />
          </button>
        </div>
        
        <div className="p-10">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-gray-200 rounded-xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-300"
          >
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <UploadCloud size={32} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Drag and drop files here</h3>
            <p className="text-gray-500 mb-6">or click to browse from your computer</p>
            
            <button className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:shadow-blue-600/30 transition-all">
              Browse Files
            </button>
            <p className="mt-6 text-xs text-gray-400 uppercase tracking-wide">Supports JPG, PNG, WEBP (Max 5MB)</p>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden" 
            />
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button className="text-gray-600 font-medium px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button className="bg-blue-600 text-white font-medium px-4 py-2 rounded-lg opacity-50 cursor-not-allowed">Upload Design</button>
        </div>
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 animate-in slide-in-from-bottom-2">
            <AlertCircle size={20} />
            {error}
        </div>
      )}
    </div>
  );

  const AnalyzingView = () => (
    <div className="flex-1 p-8 overflow-y-auto h-full">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">Analyzing Design...</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <ImageIcon size={16} />
              <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-sm text-gray-700">uploaded_design.png</span>
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={resetApp} className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
             <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm flex items-center gap-2">
               <Zap size={16} /> Notify me
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Preview */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
              <div className="relative aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden group">
                {image && (
                    <img src={image} className="w-full h-full object-cover blur-sm opacity-80 scale-105" alt="Analyzing" />
                )}
                {/* Scanner effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/10 to-transparent w-full h-full animate-pulse pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.6)] animate-[scan_3s_ease-in-out_infinite]" style={{ animationName: 'scan' }} />
                
                <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/10 font-medium">
                  PREVIEW MODE
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
               <div className="flex justify-between items-end mb-4">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Progress</p>
                    <p className="text-3xl font-display font-bold text-gray-900">{Math.min((stepIndex + 1) * 25, 95)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Est. time</p>
                    <p className="font-mono text-sm font-semibold text-gray-700">~12s</p>
                  </div>
               </div>
               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-700 ease-out relative overflow-hidden" 
                    style={{ width: `${(stepIndex + 1) * 25}%` }}
                 >
                    <div className="absolute inset-0 bg-white/30 w-full h-full animate-[shimmer_2s_infinite]" />
                 </div>
               </div>
            </div>
          </div>

          {/* Right: Pipeline */}
          <div className="lg:col-span-7">
            <AnalysisSteps currentStepIndex={stepIndex} />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900">
      <Sidebar />
      <main className="flex-1 lg:ml-64 relative flex flex-col">
        {view === 'upload' && <UploadView />}
        {view === 'analyzing' && <AnalyzingView />}
        {view === 'results' && <ResultsView analysis={analysis} image={image} resetApp={resetApp} />}
      </main>
    </div>
  );
}