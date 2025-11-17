import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Eye, Mail, Download, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Submission {
  id: string;
  user_id: string;
  form_data: any;
  analytics_data: any;
  status: string;
  created_at: string;
}

const CampaignSubmissions = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('campaign_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewSubmission = (submission: Submission) => {
    setSelectedSubmission(submission);
  };

  const handleSendEmail = async (submission: Submission) => {
    // Implement email sending functionality
    console.log('Sending email for submission:', submission);
  };

  const handleExportCSV = () => {
    // Implement CSV export functionality
    console.log('Exporting submissions to CSV');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-coaching-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Soumissions de campagne</h3>
        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
        >
          <Download size={20} className="mr-2" />
          Exporter CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(submission.created_at), 'Pp', { locale: fr })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {submission.form_data.projectName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {submission.form_data.fullName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      submission.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : submission.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewSubmission(submission)}
                      className="text-coaching-primary hover:text-coaching-secondary mr-3"
                      title="Voir les détails"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleSendEmail(submission)}
                      className="text-coaching-primary hover:text-coaching-secondary"
                      title="Envoyer un email"
                    >
                      <Mail size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {submissions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    Aucune soumission trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Détails de la soumission</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">Projet</h4>
                <p>{selectedSubmission.form_data.projectName}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Contact</h4>
                <p>{selectedSubmission.form_data.fullName}</p>
                <p>{selectedSubmission.form_data.email}</p>
                <p>{selectedSubmission.form_data.phone}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Description du projet</h4>
                <p>{selectedSubmission.form_data.projectDescription}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Objectifs</h4>
                <ul className="list-disc list-inside">
                  {selectedSubmission.form_data.businessGoals.map((goal: string, index: number) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-700">Analytics</h4>
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(selectedSubmission.analytics_data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => handleSendEmail(selectedSubmission)}
                className="flex items-center px-4 py-2 bg-coaching-primary text-white rounded-lg hover:bg-coaching-secondary transition-colors"
              >
                <Mail size={20} className="mr-2" />
                Envoyer un email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignSubmissions;