
import React, { useState, useMemo, useRef, useEffect } from 'react';
import QRCodeStyling, { 
  DrawType, TypeNumber, Mode, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType 
} from 'qr-code-styling';
import { 
  Download, Share2, Type, Link as LinkIcon, Wifi, User, 
  Mail, Palette, ChevronDown, ChevronUp, Sparkles,
  Image as ImageIcon, ShieldCheck, Upload, Grid3X3, Circle,
  Check
} from 'lucide-react';

type GenType = 'URL' | 'TEXT' | 'WIFI' | 'CONTACT' | 'EMAIL';
type EcLevel = 'L' | 'M' | 'Q' | 'H';

const COLOR_PALETTES = [
  { name: 'Classic', fg: '#000000', bg: '#ffffff' },
  { name: 'Indigo', fg: '#4f46e5', bg: '#ffffff' },
  { name: 'Emerald', fg: '#059669', bg: '#ecfdf5' },
  { name: 'Sunset', fg: '#ea580c', bg: '#fff7ed' },
  { name: 'Royal', fg: '#1e3a8a', bg: '#dbeafe' },
  { name: 'Rose', fg: '#e11d48', bg: '#fff1f2' },
  { name: 'Dark', fg: '#f8fafc', bg: '#1e293b' },
  { name: 'Violet', fg: '#7c3aed', bg: '#f5f3ff' },
];

const Generator: React.FC = () => {
  const [activeType, setActiveType] = useState<GenType>('URL');
  
  // Data States
  const [text, setText] = useState('');
  const [wifi, setWifi] = useState({ ssid: '', password: '', encryption: 'WPA', hidden: false });
  const [contact, setContact] = useState({ firstName: '', lastName: '', phone: '', email: '', org: '' });
  const [emailData, setEmailData] = useState({ to: '', subject: '', body: '' });

  // Customization States
  const [fgColor, setFgColor] = useState('#4f46e5'); // Default Indigo-600
  const [bgColor, setBgColor] = useState('#ffffff');
  const [ecLevel, setEcLevel] = useState<EcLevel>('H');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.4); // Scale 0.1 to 0.5
  
  // Advanced Style States
  const [dotType, setDotType] = useState<DotType>('rounded');
  const [cornerType, setCornerType] = useState<CornerSquareType>('extra-rounded');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('dot');

  const [showCustomization, setShowCustomization] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling>(new QRCodeStyling({
    width: 300,
    height: 300,
    margin: 10,
  }));
  const fileInputRef = useRef<HTMLInputElement>(null);

  const qrValue = useMemo(() => {
    try {
      switch (activeType) {
        case 'URL':
        case 'TEXT':
          return text;
        case 'WIFI':
          const esc = (v: string) => v.replace(/([\\;:])/g, '\\$1');
          return `WIFI:S:${esc(wifi.ssid)};T:${wifi.encryption};P:${esc(wifi.password)};H:${wifi.hidden};;`;
        case 'CONTACT':
          return `BEGIN:VCARD\nVERSION:3.0\nN:${contact.lastName};${contact.firstName};;;\nFN:${contact.firstName} ${contact.lastName}\nORG:${contact.org}\nTEL;TYPE=CELL:${contact.phone}\nEMAIL:${contact.email}\nEND:VCARD`;
        case 'EMAIL':
          return `mailto:${emailData.to}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
        default:
          return '';
      }
    } catch (e) {
      return '';
    }
  }, [activeType, text, wifi, contact, emailData]);

  const hasContent = useMemo(() => {
    switch (activeType) {
      case 'URL':
      case 'TEXT': return text.trim().length > 0;
      case 'WIFI': return wifi.ssid.trim().length > 0;
      case 'CONTACT': return contact.firstName.trim().length > 0 || contact.org.trim().length > 0;
      case 'EMAIL': return emailData.to.trim().length > 0;
      default: return false;
    }
  }, [activeType, text, wifi, contact, emailData]);

  // Update QR Code whenever settings change
  useEffect(() => {
    if (qrContainerRef.current) {
      qrCodeInstance.current.update({
        data: qrValue || " ",
        dotsOptions: { color: fgColor, type: dotType },
        backgroundOptions: { color: bgColor },
        image: logo || undefined,
        imageOptions: { 
          crossOrigin: 'anonymous', 
          margin: 5,
          imageSize: logoSize
        },
        cornersSquareOptions: { type: cornerType, color: fgColor },
        cornersDotOptions: { type: cornerDotType, color: fgColor },
        qrOptions: { errorCorrectionLevel: ecLevel as ErrorCorrectionLevel }
      });

      // Clear previous and append
      qrContainerRef.current.innerHTML = '';
      qrCodeInstance.current.append(qrContainerRef.current);
    }
  }, [qrValue, fgColor, bgColor, dotType, cornerType, cornerDotType, ecLevel, logo, logoSize]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          setLogo(evt.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const applyPalette = (fg: string, bg: string) => {
    setFgColor(fg);
    setBgColor(bg);
  };

  const downloadQR = () => {
    qrCodeInstance.current.download({
      name: `qrcode-${activeType.toLowerCase()}`,
      extension: 'png'
    });
  };

  const shareQR = async () => {
    if (!hasContent) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'QR Code',
          text: 'Here is a custom QR code I generated',
          url: window.location.href
        });
      } else {
        alert('Sharing is not supported on this device/browser');
      }
    } catch (error) {
      console.log('Error sharing', error);
    }
  };

  const renderTypeButton = (type: GenType, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => setActiveType(type)}
      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all border ${
        activeType === type 
          ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
          : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:bg-slate-50'
      }`}
    >
      <div className={activeType === type ? 'text-white' : 'text-slate-400'}>{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );

  return (
    <div className="px-4 pb-24 max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          Generator
        </h2>
        
        {/* Type Selector */}
        <div className="grid grid-cols-5 gap-2 mb-8">
          {renderTypeButton('URL', <LinkIcon className="w-5 h-5" />, 'URL')}
          {renderTypeButton('TEXT', <Type className="w-5 h-5" />, 'Text')}
          {renderTypeButton('WIFI', <Wifi className="w-5 h-5" />, 'WiFi')}
          {renderTypeButton('CONTACT', <User className="w-5 h-5" />, 'VCard')}
          {renderTypeButton('EMAIL', <Mail className="w-5 h-5" />, 'Email')}
        </div>

        {/* Input Forms */}
        <div className="space-y-4 mb-8">
          {(activeType === 'URL' || activeType === 'TEXT') && (
             <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">
                {activeType === 'URL' ? 'Website Link' : 'Plain Text'}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={activeType === 'URL' ? "https://example.com" : "Enter your message here..."}
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all resize-none outline-none text-slate-700 font-medium"
              />
            </div>
          )}

          {activeType === 'WIFI' && (
            <div className="space-y-4">
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) => setWifi({...wifi, ssid: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Network Name (SSID)"
              />
              <input
                type="text"
                value={wifi.password}
                onChange={(e) => setWifi({...wifi, password: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Password"
              />
              <select 
                value={wifi.encryption}
                onChange={(e) => setWifi({...wifi, encryption: e.target.value})}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              >
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None</option>
              </select>
            </div>
          )}

          {activeType === 'CONTACT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={contact.firstName} onChange={(e) => setContact({...contact, firstName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="First Name" />
                <input type="text" value={contact.lastName} onChange={(e) => setContact({...contact, lastName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Last Name" />
              </div>
              <input type="tel" value={contact.phone} onChange={(e) => setContact({...contact, phone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Phone Number" />
              <input type="email" value={contact.email} onChange={(e) => setContact({...contact, email: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Email Address" />
            </div>
          )}

          {activeType === 'EMAIL' && (
            <div className="space-y-4">
              <input type="email" value={emailData.to} onChange={(e) => setEmailData({...emailData, to: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="To: (email address)" />
              <input type="text" value={emailData.subject} onChange={(e) => setEmailData({...emailData, subject: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Subject" />
              <textarea value={emailData.body} onChange={(e) => setEmailData({...emailData, body: e.target.value})} className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none" placeholder="Message body" />
            </div>
          )}
        </div>

        {/* Customization Toggle */}
        <div className="border-t border-slate-100 pt-4">
          <button 
            onClick={() => setShowCustomization(!showCustomization)}
            className="flex items-center justify-between w-full text-left group hover:bg-slate-50 p-2 -mx-2 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-slate-700">Customization & Styles</span>
            </div>
            {showCustomization ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showCustomization && (
            <div className="mt-6 space-y-8 animate-in slide-in-from-top-2 duration-200 max-h-[400px] overflow-y-auto no-scrollbar pr-2 pb-4">
              {/* Color Palettes Section */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Quick Palettes
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {COLOR_PALETTES.map((palette) => (
                    <button
                      key={palette.name}
                      onClick={() => applyPalette(palette.fg, palette.bg)}
                      className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    >
                      <div 
                        className={`w-full aspect-square rounded-xl border-2 transition-all flex items-center justify-center ${
                          fgColor === palette.fg && bgColor === palette.bg 
                            ? 'border-indigo-600 ring-2 ring-indigo-200' 
                            : 'border-slate-100 hover:border-slate-300'
                        }`}
                        style={{ background: palette.bg }}
                      >
                        <div 
                          className="w-1/2 h-1/2 rounded-md shadow-sm"
                          style={{ background: palette.fg }}
                        />
                        {fgColor === palette.fg && bgColor === palette.bg && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check className={`w-4 h-4 ${palette.bg === '#1e293b' ? 'text-white' : 'text-slate-900'}`} />
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter line-clamp-1">{palette.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Shapes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Circle className="w-3 h-3" /> Shape & Geometry
                </label>
                
                <div className="space-y-4">
                   {/* Module (Dot) Type */}
                   <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Módulos (Dots)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['square', 'dots', 'rounded', 'extra-rounded', 'classy', 'classy-rounded'] as DotType[]).map(t => (
                        <button key={t} onClick={() => setDotType(t)} className={`px-2 py-2 text-[10px] font-bold rounded-lg border capitalize transition-all ${dotType === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Eye (Corner) Square Type */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Moldura do Olho (Corner Square)</span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['square', 'dot', 'extra-rounded'] as CornerSquareType[]).map(t => (
                        <button key={t} onClick={() => setCornerType(t)} className={`px-2 py-2 text-[10px] font-bold rounded-lg border capitalize transition-all ${cornerType === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{t}</button>
                      ))}
                    </div>
                  </div>

                  {/* Eye (Corner) Dot Type */}
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mb-2 block tracking-wider">Ponto do Olho (Corner Dot)</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['square', 'dot'] as CornerDotType[]).map(t => (
                        <button key={t} onClick={() => setCornerDotType(t)} className={`px-2 py-2 text-[10px] font-bold rounded-lg border capitalize transition-all ${cornerDotType === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Manual Colors */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Custom FG</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                    <span className="text-xs font-mono text-slate-600 flex-1">{fgColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Custom BG</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0" />
                    <span className="text-xs font-mono text-slate-600 flex-1">{bgColor}</span>
                  </div>
                </div>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Logo & Size
                </label>
                {!logo ? (
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group">
                    <Upload className="w-6 h-6 text-slate-300 group-hover:text-indigo-400 mb-2" />
                    <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-600">Click to upload logo</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img src={logo} className="w-12 h-12 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                      <button onClick={removeLogo} className="text-xs font-bold text-rose-500 hover:underline">Remove logo</button>
                    </div>
                    <input type="range" min="0.1" max="0.5" step="0.05" value={logoSize} onChange={(e) => setLogoSize(Number(e.target.value))} className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Result Card */}
      <div className={`transition-all duration-500 ${hasContent ? 'opacity-100 translate-y-0' : 'opacity-50 translate-y-4 grayscale pointer-events-none'}`}>
        <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-indigo-100 flex flex-col items-center">
          <div className="p-4 bg-white rounded-3xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] border border-slate-100 mb-8 overflow-hidden" style={{ backgroundColor: bgColor }}>
            <div ref={qrContainerRef} className="flex items-center justify-center min-w-[300px] min-h-[300px]">
              {!hasContent && (
                <div className="text-slate-300">
                  <Sparkles className="w-12 h-12 opacity-50" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 w-full">
            <button onClick={downloadQR} disabled={!hasContent} className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm shadow-lg hover:bg-black transition-all hover:scale-[1.02]">
              <Download className="w-4 h-4" /> Save Image
            </button>
            <button onClick={shareQR} disabled={!hasContent} className="flex-1 flex items-center justify-center gap-2 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-2xl font-bold text-sm hover:border-indigo-200 transition-all hover:scale-[1.02]">
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Generator;
