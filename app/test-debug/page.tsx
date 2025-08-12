'use client';

import { useState } from 'react';

export default function TestDebugPage() {
  const [ownerResult, setOwnerResult] = useState<any>(null);
  const [clientResult, setClientResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testOwnerAPI = async () => {
    setLoading(true);
    try {
      // Replace with a real owner ID from your database
      const response = await fetch('/api/bookings/owner?ownerId=test-owner-id');
      const result = await response.json();
      setOwnerResult(result);
      console.log('Owner API Result:', result);
    } catch (error) {
      console.error('Owner API Error:', error);
      setOwnerResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testClientAPI = async () => {
    setLoading(true);
    try {
      // Replace with a real client ID from your database
      const response = await fetch('/api/bookings/client?clientId=test-client-id');
      const result = await response.json();
      setClientResult(result);
      console.log('Client API Result:', result);
    } catch (error) {
      console.error('Client API Error:', error);
      setClientResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔍 API Debug Test Page</h1>
      
      <div className="space-y-8">
        {/* Owner API Test */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            🏠 Test Owner Bookings API
          </h2>
          <p className="text-blue-700 mb-4">
            This will test the owner API and show debug output in your terminal
          </p>
          <button
            onClick={testOwnerAPI}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Owner API'}
          </button>
          
          {ownerResult && (
            <div className="mt-4 p-4 bg-white rounded border">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(ownerResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Client API Test */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-4 text-green-800">
            👤 Test Client Bookings API
          </h2>
          <p className="text-green-700 mb-4">
            This will test the client API and show debug output in your terminal
          </p>
          <button
            onClick={testClientAPI}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Client API'}
          </button>
          
          {clientResult && (
            <div className="mt-4 p-4 bg-white rounded border">
              <h3 className="font-semibold mb-2">Result:</h3>
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(clientResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">
            📋 How to See Debug Output
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-800">
            <li>Open your terminal where <code className="bg-yellow-100 px-1 rounded">npm run dev</code> is running</li>
            <li>Click the test buttons above</li>
            <li>Watch the terminal for debug messages starting with 🔍, 🚨, ❌, or ⚠️</li>
            <li>The debug output will show exactly what's happening in each step</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 