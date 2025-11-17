import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Facebook, GitBranch as BrandTiktok, ArrowRight, Sparkles } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { supabase } from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { useNavigate } from 'react-router-dom';

interface FormData {
  step: number;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  projectName: string;
  projectDescription: string;
  businessGoals: string[];
  mainChallenges: string[];
  otherChallenge: string;
  marketResearch: 'yes' | 'no' | '';
  businessStage: string;
  hasBusinessPlan: 'yes' | 'no' | '';
  wantsBusinessPlan: boolean;
  businessPlanFile: File | null;
  targetAudience: string;
  budget: string;
  timeline: string;
  projectFile: File | null;
  followFacebook: boolean;
  followTiktok: boolean;
  lastInteractionTime: number;
  formStartTime: number;
  stepDurations: Record<number, number>;
  fieldFocusDurations: Record<string, number>;
}

const businessGoalsOptions = [
  "Augmenter mon chiffre d'affaires",
  "Développer ma présence en ligne",
  "Lancer un nouveau produit/service",
  "Atteindre de nouveaux marchés",
  "Optimiser mes processus internes",
  "Construire une équipe performante",
  "Créer une marque forte",
  "Obtenir des financements"
];

const challengesOptions = [
  "Difficulté à trouver des clients",
  "Manque de visibilité",
  "Gestion du temps",
  "Problèmes de trésorerie",
  "Recrutement et gestion d'équipe",
  "Concurrence intense",
  "Définition de la stratégie",
  "Développement commercial"
];

const businessStages = [
  "Idée / Concept",
  "En phase de création",
  "Moins d'un an d'activité",
  "1-3 ans d'activité",
  "Plus de 3 ans d'activité",
  "En phase de croissance",
  "En phase de transformation"
];

const CampaignPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    step: 1,
    fullName: '',
    email: '',
    phone: '',
    location: '',
    projectName: '',
    projectDescription: '',
    businessGoals: [],
    mainChallenges: [],
    otherChallenge: '',
    marketResearch: '',
    businessStage: '',
    hasBusinessPlan: '',
    wantsBusinessPlan: false,
    businessPlanFile: null,
    targetAudience: '',
    budget: '',
    timeline: '',
    projectFile: null,
    followFacebook: false,
    followTiktok: false,
    lastInteractionTime: Date.now(),
    formStartTime: Date.now(),
    stepDurations: {},
    fieldFocusDurations: {},
  });

  const [focusStartTime, setFocusStartTime] = useState<number>(0);
  const [currentFocusedField, setCurrentFocusedField] = useState<string>('');
  const MAX_DESCRIPTION_LENGTH = 500;

  const handleFieldFocus = (fieldName: string) => {
    setFocusStartTime(Date.now());
    setCurrentFocusedField(fieldName);
  };

  const handleFieldBlur = () => {
    if (currentFocusedField) {
      const focusDuration = Date.now() - focusStartTime;
      setFormData(prev => ({
        ...prev,
        fieldFocusDurations: {
          ...prev.fieldFocusDurations,
          [currentFocusedField]: (prev.fieldFocusDurations[currentFocusedField] || 0) + focusDuration
        }
      }));
    }
    setCurrentFocusedField('');
  };

  const handleStepChange = (newStep: number) => {
    const currentTime = Date.now();
    setFormData(prev => ({
      ...prev,
      step: newStep,
      stepDurations: {
        ...prev.stepDurations,
        [prev.step]: (prev.stepDurations[prev.step] || 0) + (currentTime - prev.lastInteractionTime)
      },
      lastInteractionTime: currentTime
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, projectFile: e.target.files[0] });
    }
  };

  const handleGoalChange = (goal: string) => {
    const newGoals = formData.businessGoals.includes(goal)
      ? formData.businessGoals.filter(g => g !== goal)
      : [...formData.businessGoals, goal];
    setFormData({ ...formData, businessGoals: newGoals });
  };

  const handleChallengeChange = (challenge: string) => {
    const newChallenges = formData.mainChallenges.includes(challenge)
      ? formData.mainChallenges.filter(c => c !== challenge)
      : [...formData.mainChallenges, challenge];
    setFormData({ ...formData, mainChallenges: newChallenges });
  };

  const nextStep = () => {
    handleStepChange(formData.step + 1);
  };

  const prevStep = () => {
    handleStepChange(formData.step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalTime = Date.now() - formData.formStartTime;
    
    const analyticsData = {
      totalTimeSpent: totalTime,
      stepDurations: formData.stepDurations,
      fieldFocusDurations: formData.fieldFocusDurations,
      formData: {
        ...formData,
        businessPlanFile: null,
        projectFile: null
      }
    };

    try {
      // Save submission to campaign_submissions
      const { data: submission, error: submissionError } = await supabase
        .from('campaign_submissions')
        .insert([
          {
            user_id: user?.id,
            form_data: formData,
            analytics_data: analyticsData,
            status: 'pending'
          }
        ])
        .select()
        .single();

      if (submissionError) throw submissionError;

      // Track analytics
      await supabase.from('campaign_analytics').insert([
        {
          campaign_id: submission.id,
          event_type: 'form_submission',
          event_data: analyticsData
        }
      ]);

      // Show success message
      alert('Votre projet a été soumis avec succès ! Nous vous contacterons bientôt.');
      
      // Reset form
      setFormData({
        ...formData,
        step: 1
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Une erreur est survenue lors de la soumission du formulaire.');
    }
  };

  const renderStep = () => {
    switch (formData.step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Parlons de toi !
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quel est ton prénom et ton nom ?
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                placeholder="Ex: Marie Dupont"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ton adresse e-mail pour te répondre :
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                placeholder="Ex: marie@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ton numéro de téléphone (facultatif) :
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                placeholder="Ex: +33 6 12 34 56 78"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Où es-tu basé(e) ? (Pays, ville)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                placeholder="Ex: France, Paris"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Ton projet en quelques mots !
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quel est le nom de ton projet ou de ton entreprise ?
              </label>
              <input
                type="text"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                placeholder="Ex: EcoStyle Fashion"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                À quel niveau es-tu de ton business ?
              </label>
              <select
                value={formData.businessStage}
                onChange={(e) => setFormData({ ...formData, businessStage: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              >
                <option value="">Sélectionner une étape</option>
                {businessStages.map((stage) => (
                  <option key={stage} value={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Décris-moi ton projet ou ton idée :
                <span className="text-sm text-gray-500 ml-2">
                  ({formData.projectDescription.length}/{MAX_DESCRIPTION_LENGTH} caractères)
                </span>
              </label>
              <textarea
                value={formData.projectDescription}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= MAX_DESCRIPTION_LENGTH) {
                    setFormData({ ...formData, projectDescription: value });
                  }
                }}
                onFocus={() => handleFieldFocus('projectDescription')}
                onBlur={handleFieldBlur}
                rows={4}
                maxLength={MAX_DESCRIPTION_LENGTH}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                placeholder="Ex: Je souhaite créer une marque de vêtements éco-responsables..."
              />
              <p className="mt-2 text-sm text-gray-500">
                Décrivez votre projet de manière concise et précise.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quels sont tes objectifs business ? (Plusieurs choix possibles)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {businessGoalsOptions.map((goal) => (
                  <label key={goal} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.businessGoals.includes(goal)}
                      onChange={() => handleGoalChange(goal)}
                      className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{goal}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Approfondissons ton projet !
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quel est le principal défi que tu rencontres actuellement ? (Plusieurs choix possibles)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {challengesOptions.map((challenge) => (
                  <label key={challenge} className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mainChallenges.includes(challenge)}
                      onChange={() => handleChallengeChange(challenge)}
                      className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{challenge}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autre défi (préciser) :
                </label>
                <input
                  type="text"
                  value={formData.otherChallenge}
                  onChange={(e) => setFormData({ ...formData, otherChallenge: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
                  placeholder="Ex: Un autre défi spécifique..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                As-tu fait une étude de marché ?
              </label>
              <div className="space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    checked={formData.marketResearch === 'yes'}
                    onChange={(e) => setFormData({ ...formData, marketResearch: e.target.value as 'yes' | 'no' })}
                    className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Oui</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="no"
                    checked={formData.marketResearch === 'no'}
                    onChange={(e) => setFormData({ ...formData, marketResearch: e.target.value as 'yes' | 'no' })}
                    className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Non</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quel est ton budget prévisionnel ?
              </label>
              <select
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-coaching-primary focus:border-transparent"
              >
                <option value="">Sélectionner un budget</option>
                <option value="0-5000">0 - 5 000 €</option>
                <option value="5000-15000">5 000 - 15 000 €</option>
                <option value="15000-50000">15 000 - 50 000 €</option>
                <option value="50000+">Plus de 50 000 €</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                As-tu un business plan ?
              </label>
              <div className="space-y-4">
                <div className="space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="yes"
                      checked={formData.hasBusinessPlan === 'yes'}
                      onChange={(e) => setFormData({ ...formData, hasBusinessPlan: e.target.value as 'yes' | 'no' })}
                      className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Oui</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      value="no"
                      checked={formData.hasBusinessPlan === 'no'}
                      onChange={(e) => setFormData({ ...formData, hasBusinessPlan: e.target.value as 'yes' | 'no' })}
                      className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">Non</span>
                  </label>
                </div>

                {formData.hasBusinessPlan === 'yes' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Super ! Tu peux le télécharger ici :
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                      <div className="space-y-1 text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="business-plan-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-coaching-primary hover:text-coaching-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-coaching-primary"
                          >
                            <span>Télécharger le business plan</span>
                            <input
                              id="business-plan-upload"
                              name="business-plan-upload"
                              type="file"
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setFormData({ ...formData, businessPlanFile: e.target.files[0] });
                                }
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC, DOCX jusqu'à 10MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {formData.hasBusinessPlan === 'no' && (
                  <div className="mt-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.wantsBusinessPlan}
                        onChange={(e) => setFormData({ ...formData, wantsBusinessPlan: e.target.checked })}
                        className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        Je souhaiterais être accompagné(e) dans la création de mon business plan
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Partage ton projet !
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document de projet ou business plan (format Word ou PDF) :
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-coaching-primary hover:text-coaching-secondary focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-coaching-primary"
                    >
                      <span>Télécharger un fichier</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX jusqu'à 10MB
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">
                Pour bénéficier de l'étude de ton projet, suis-moi sur mes réseaux sociaux :
              </h4>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="facebook"
                  checked={formData.followFacebook}
                  onChange={(e) => setFormData({ ...formData, followFacebook: e.target.checked })}
                  className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300 rounded"
                />
                <label htmlFor="facebook" className="flex items-center text-sm text-gray-700">
                  <Facebook className="w-5 h-5 mr-2" />
                  J'aime déjà la page Facebook de Mazarine Djivédé !
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="tiktok"
                  checked={formData.followTiktok}
                  onChange={(e) => setFormData({ ...formData, followTiktok: e.target.checked })}
                  className="h-4 w-4 text-coaching-primary focus:ring-coaching-primary border-gray-300 rounded"
                />
                <label htmlFor="tiktok" className="flex items-center text-sm text-gray-700">
                  <BrandTiktok className="w-5 h-5 mr-2" />
                  Je suis déjà abonné(e) au compte TikTok de Mazarine Djivédé !
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="pt-16">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-[60vh] bg-gradient-to-r from-coaching-primary to-music-primary flex items-center"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Propulsez Votre Projet avec Mazarine Djivédé !
            </h1>
            <p className="text-xl text-gray-200 mb-4">
              Hello ! Je suis Mazarine Djivédé, et toi ?
            </p>
            <p className="text-lg text-gray-200 mb-8">
              Je lance une campagne spéciale pour offrir des études de projets et des conseils personnalisés aux entrepreneurs ambitieux comme toi.
            </p>
            <div className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-coaching-primary bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coaching-primary">
              <Sparkles className="w-5 h-5 mr-2" />
              Prêt(e) à donner vie à tes idées ?
            </div>
          </motion.div>
        </div>
      </motion.div>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`w-3 h-3 rounded-full ${
                          step === formData.step
                            ? 'bg-coaching-primary'
                            : step < formData.step
                            ? 'bg-coaching-primary/50'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">
                    Étape {formData.step} sur 4
                  </p>
                </div>

                <form onSubmit={handleSubmit}>
                  {renderStep()}

                  <div className="mt-8 flex justify-between">
                    {formData.step > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coaching-primary"
                      >
                        Retour
                      </button>
                    )}
                    {formData.step < 4 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-coaching-primary hover:bg-coaching-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coaching-primary ml-auto"
                      >
                        Suivant
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-coaching-primary hover:bg-coaching-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coaching-primary ml-auto"
                      >
                        Soumettre mon projet
                        <Sparkles className="ml-2 w-5 h-5" />
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default CampaignPage;