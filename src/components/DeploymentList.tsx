import React from 'react';
import { useFormStore } from '../store/formStore';
import { Link2, Eye, EyeOff, Loader2 } from 'lucide-react';

export function DeploymentList() {
  const { deployments, loading, toggleDeploymentStatus } = useFormStore();

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!deployments.length) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Form Deployments</h2>
      <div className="space-y-4">
        {deployments.map((deployment) => (
          <div
            key={deployment.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Link2 className="w-5 h-5 text-gray-400" />
              <div>
                <a
                  href={`/forms/${deployment.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Form: {deployment.slug}
                </a>
                <div className="text-sm text-gray-500">
                  {deployment.responses} responses • Created{' '}
                  {new Date(deployment.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`px-2 py-1 text-sm rounded-full ${
                  deployment.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {deployment.status}
              </span>
              <button
                onClick={() => toggleDeploymentStatus(deployment.id)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                {deployment.status === 'active' ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}