import React, { useState } from 'react';
import { AuditLog } from '../types';
import { History, Shield, Search, Filter } from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLog[];
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredLogs = logs.filter((log) => {
    const matchesCat = selectedCategory === 'ALL' || log.category === selectedCategory;
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900">ERP System Audit & Security Activity Logs</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Immutable tracking of user logins, attendance modifications, leave approvals, and admin updates.
          </p>
        </div>

        <div className="flex space-x-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search audit logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 p-2 rounded-xl w-full md:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs font-bold text-slate-700">
          <span>Audit Log Activity History ({filteredLogs.length} Records)</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border p-1 rounded font-semibold text-slate-800"
          >
            <option value="ALL">All Categories</option>
            <option value="LOGIN">Logins</option>
            <option value="ATTENDANCE_CHANGE">Attendance Edits</option>
            <option value="USER_MGMT">User Management</option>
            <option value="LEAVE">Leaves</option>
            <option value="SYSTEM">System Settings</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b">
                <th className="p-3 pl-4">Timestamp</th>
                <th className="p-3">Actor Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
                <th className="p-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 pl-4 font-mono text-slate-500">{log.timestamp}</td>
                  <td className="p-3 font-semibold text-slate-800">{log.actorName}</td>
                  <td className="p-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-slate-900">{log.action}</td>
                  <td className="p-3 text-slate-600 max-w-md truncate">{log.details}</td>
                  <td className="p-3 font-mono text-slate-400">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
