import React, { useState } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { TrainingSession, TrainingStatus } from './types';
// On importe la fonction qu'on a créée dans le service
import { parseConventionDocument } from './geminiService';

interface NewTrainingModalProps {
  onClose: () => void;
  onCreate: (sessions: TrainingSession[]) => void;
}

const NewTrainingModal: React.FC<NewTrainingModalProps> = ({ onClose, onCreate }) => {
  // États du formulaire
  const [companyName, setCompanyName] = useState('');
  const [trainingName, setTrainingName] = useState('');
  const [date, setDate] = useState('');
  const [trainerName, setTrainerName] = useState('Rali El kohen');
  
  // États pour la gestion du fichier et de l'IA
  const [fileName, setFileName] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pdfContent, setPdfContent] = useState<string | undefined>(undefined);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. On garde le nom et le contenu pour plus tard
    setFileName(file.name);
    setIsAnalyzing(true);

    // 2. Lecture du fichier
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setPdfContent(base64String); // On sauvegarde le PDF

      try {
        // 3. Appel à Gemini pour l'analyse
        console.log("Envoi à Gemini...");
        const data = await parseConventionDocument(base64String, file.type);
        
        console.log("Réponse Gemini:", data);

        // 4. Remplissage automatique des champs
        if (data) {
          if (data.companyName) setCompanyName(data.companyName);
          if (data.trainingName) setTrainingName(data.trainingName);
          if (data.participants && data.participants.length > 0) {
             // Ici on pourrait gérer les participants, pour l'instant on remplit le reste
          }
          // Gestion intelligente de la date (prend la première date trouvée)
          if (data.dates && data.dates.length > 0) {
            setDate(data.dates[0]);
          }
        }
      } catch (error) {
        console.error("Erreur analyse:", error);
        alert("Erreur lors de l'analyse du document. Vérifiez votre clé API.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    
    // Lecture en tant qu'URL de données (Base64)
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSession: TrainingSession = {
      id: Date.now().toString(),
      companyName,
      trainingName,
      date,
      status: TrainingStatus.SCHEDULED,
      trainerName,
      participants: [],
      pdfContent: pdfContent // On attache le PDF à la session créée
    };

    onCreate([newSession]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        {/* En-tête */}
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Nouvelle Formation</h2>
          <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* --- ZONE D'UPLOAD INTELLIGENTE --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Convention / Programme (PDF)
            </label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors relative cursor-pointer
              ${isAnalyzing ? 'bg-indigo-50 border-indigo-300' : 'border-gray-300 hover:bg-gray-50'}`}>
              
              <input 
                type="file" 
                accept=".pdf,image/*" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-wait" 
                onChange={handleFileChange}
                disabled={isAnalyzing}
              />
              
              <div className="space-y-1 text-center">
                {isAnalyzing ? (
                  <div className="flex flex-col items-center text-indigo-600">
                    <Loader2 className="animate-spin h-8 w-8 mb-2" />
                    <p className="text-sm font-semibold">Gemini analyse votre document...</p>
                    <p className="text-xs text-indigo-400">Remplissage automatique en cours</p>
                  </div>
                ) : fileName ? (
                  <div className="flex flex-col items-center text-green-600">
                    <CheckCircle className="h-8 w-8 mb-2" />
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-green-600">Analyse terminée !</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative font-medium text-indigo-600 hover:text-indigo-500">
                        Téléverser un fichier
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">PDF ou Image (Max 10MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* ---------------------------------- */}

          {/* Champs classiques (qui seront remplis par l'IA) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: TotalEnergies"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intitulé</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              placeholder="Ex: Sécurité Incendie"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Formateur</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                value={trainerName}
                onChange={(e) => setTrainerName(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyse...' : 'Créer la session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTrainingModal;
