import React from 'react';
import { 
  Search, 
  Filter, 
  AlertCircle,
  Plus,
  ArrowRight,
  Edit2,
  Trash2,
  FileText,
  Clock,
  ExternalLink,
  Users
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const words = [
  { id: 1, text: 'Serendipity', type: 'Noun', translations: 12, usersAdded: 843, difficulty: 'Hard' },
  { id: 2, text: 'Melancholy', type: 'Noun', translations: 5, usersAdded: 620, difficulty: 'Medium' },
  { id: 3, text: 'Enthusiasm', type: 'Noun', translations: 8, usersAdded: 1540, difficulty: 'Easy' },
  { id: 4, text: 'Resilient', type: 'Adj', translations: 4, usersAdded: 932, difficulty: 'Medium' },
];

const WordLibraryPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-[#181c32]">Registry Library</h1>
          <p className="text-xs font-semibold text-[#a1a5b7] mt-1">Audit and curate linguistic data blocks.</p>
        </div>
        <Button className="bg-[#009ef7] hover:bg-[#0086d1] text-white"><Plus size={16} className="mr-1.5" /> Batch Node Import</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Controls */}
        <div className="lg:col-span-1 flex flex-col gap-6">
           <Card className="border-[#eff2f5] shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-[10px] font-bold text-[#181c32] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#009ef7]"></div> Search Probe
                </h3>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a1a5b7] group-focus-within:text-[#009ef7]" size={14} />
                  <Input 
                    type="text" 
                    placeholder="Query Core..." 
                    className="bg-[#f5f8fa] border-none rounded-lg h-9 pl-9 pr-3 text-[11px] font-bold focus-visible:ring-2 focus-visible:ring-[#009ef7] transition-all"
                  />
                </div>
              </CardContent>
           </Card>

           <Card className="border-[#eff2f5] shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-[10px] font-bold text-[#181c32] mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#50cd89]"></div> Classification
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {['All', 'Noun', 'Verb', 'Adj', 'Phrase'].map((type, i) => (
                    <button key={type} className={`w-full text-left px-3 py-2.5 rounded-lg text-[11px] font-bold transition-all ${
                      i === 0 ? 'bg-[#f1faff] text-[#009ef7]' : 'text-[#7e8299] hover:bg-[#f9fafb] hover:text-[#3f4254]'
                    }`}>
                      {type}
                    </button>
                  ))}
                </div>
              </CardContent>
           </Card>

           <div className="border border-[#e1e3ea] border-dashed p-5 rounded-2xl bg-[#fcfcfd]">
              <div className="flex items-center gap-3 text-[#ffc700] mb-3">
                 <AlertCircle size={20} />
                 <span className="text-[11px] font-bold tracking-tight">Integrity Faults</span>
              </div>
              <p className="text-[11px] font-medium text-[#7e8299] leading-relaxed">
                Found <span className="text-[#f1416c] font-black">154 nodes</span> without a valid translation schema. Fix recommended.
              </p>
           </div>
        </div>

        {/* Word Grid View */}
        <div className="lg:col-span-3">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {words.map((word) => (
                <Card key={word.id} className="border-[#eff2f5] shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-[#009ef7]/30 transition-all cursor-pointer group">
                   <CardContent className="p-6">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex flex-col">
                          <h3 className="text-lg font-black text-[#181c32] group-hover:text-[#009ef7] transition-colors">{word.text}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="bg-[#f5f8fa] text-[#7e8299] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded">{word.type}</span>
                             <span className="text-[#a1a5b7] px-2">•</span>
                             <div className="flex items-center gap-1 text-[9px] font-bold text-[#a1a5b7]">
                                <Clock size={10} /> 2h ago
                             </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#f5f8fa] text-[#7e8299] hover:bg-[#f1faff] hover:text-[#009ef7] rounded-lg transition-all"><Edit2 size={13}/></Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 bg-[#f5f8fa] text-[#7e8299] hover:bg-[#fff5f8] hover:text-[#f1416c] rounded-lg transition-all"><Trash2 size={13}/></Button>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-[#f5f8fa] p-4 rounded-xl border border-[#eff2f5]">
                           <div className="flex items-center gap-2 text-[#a1a5b7] mb-1.5">
                              <FileText size={12} />
                              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Translations</span>
                           </div>
                           <p className="text-xl font-bold text-[#3f4254] font-mono leading-none">{word.translations.toString().padStart(2, '0')}</p>
                        </div>
                        <div className="bg-[#f5f8fa] p-4 rounded-xl border border-[#eff2f5]">
                           <div className="flex items-center gap-2 text-[#a1a5b7] mb-1.5">
                              <Users size={12} />
                              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Data Hits</span>
                           </div>
                           <p className="text-xl font-bold text-[#3f4254] font-mono leading-none">{word.usersAdded.toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-4 border-t border-[#eff2f5]">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold italic ${
                          word.difficulty === 'Easy' ? 'bg-[#e8fff3] text-[#50cd89]' : 
                          word.difficulty === 'Medium' ? 'bg-[#fff8dd] text-[#ffc700]' : 'bg-[#fff5f8] text-[#f1416c]'
                        }`}>
                           <div className={`w-1.5 h-1.5 rounded-full ${
                             word.difficulty === 'Easy' ? 'bg-[#50cd89]' : 
                             word.difficulty === 'Medium' ? 'bg-[#ffc700]' : 'bg-[#f1416c]'
                           }`}></div>
                           SCHEMATIC: {word.difficulty.toUpperCase()}
                        </div>
                        <button className="flex items-center gap-1.5 text-[10px] font-black text-[#009ef7] uppercase group/btn px-3 py-1.5 hover:bg-[#f1faff] rounded-lg transition-all">
                          Execute Probe <ExternalLink size={12} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                        </button>
                     </div>
                   </CardContent>
                </Card>
              ))}
           </div>
           
           <div className="mt-8 flex justify-center">
              <Button variant="outline" className="h-11 px-8 rounded-xl text-xs font-bold text-[#7e8299] hover:text-[#009ef7] border-[#eff2f5] hover:border-[#009ef7]/20 hover:shadow-sm hover:bg-transparent shadow-sm">
                Synchronize More Shards
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WordLibraryPage;
