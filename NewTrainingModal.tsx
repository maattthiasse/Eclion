import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { TrainingSession, TrainingStatus } from './types';

interface NewTrainingModalProps {
  onClose: () => void;
  onCreate: (sessions: TrainingSession[]) => void;
}

const NewTrainingModal: React.FC<NewTrainingModalProps> = ({ onClose, onCreate }) => {
  const [companyName, setCompanyName] = useState('');
  const [trainingName, setTrainingName] = useState('');
  const [date, setDate] = useState('');
  const [trainerName, setTrainerName] = useState('Rali El kohen');
  const [pdfContent, setPdfContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      
      // Convertir le PDF en Base64 pour le stocker localement
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPdfContent(base64String);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Veuillez sélectionner un fichier PDF valide.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Création de la nouvelle session avec le PDF
    const newSession: TrainingSession = {
      id: Date.now().toString(),
      companyName,
      trainingName,
      date,
      status: TrainingStatus.SCHEDULED,
      trainerName,
      participants: [],
      pdfContent: pdfContent || undefined // On ajoute le PDF ici
    };

    onCreate([newSession]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Nouvelle Formation</h2>
          <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entreprise</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ex: TotalEnergies"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intitulé de la formation</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={trainingName}
              onChange={(e) => setTrainingName(e.target.value)}
              placeholder="Ex: Sécurité Incendie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Formateur</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
            />
          </div>

          {/* Zone d'upload PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Programme / Support (PDF)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors relative cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="space-y-1 text-center">
                {fileName ? (
                  <div className="flex flex-col items-center text-indigo-600">
                    <FileText size={32} />
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="text-xs text-green-600">Fichier prêt à l'envoi</p>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <span className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                        Téléverser un fichier
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">PDF jusqu'à 5MB</p>
                  </>
                )}
              </div>
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
              className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            >
              Créer la session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTrainingModal;
