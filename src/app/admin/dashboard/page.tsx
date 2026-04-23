'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface DepartmentPerformance {
  id: string;
  name: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

interface EmployeePerformance {
  userId: string;
  name: string;
  avatar?: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [departments, setDepartments] = useState<DepartmentPerformance[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [employees, setEmployees] = useState<EmployeePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerformance();
  }, []);

  const fetchPerformance = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        router.push('/login');
        return;
      }

      const res = await fetch('/api/performance');
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to load performance data');
        return;
      }

      setDepartments(data.departments);
    } catch (err) {
      setError('Error loading performance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeptClick = async (deptId: string) => {
    setSelectedDept(deptId);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/performance?departmentId=${deptId}`);
      const data = await res.json();

      if (res.ok && data.employeePerformance) {
        setEmployees(data.employeePerformance);
      }
    } catch (err) {
      setError('Error loading employee data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedDept(null);
    setEmployees([]);
  };

  if (isLoading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Performance Dashboard</h1>
          <p className="text-slate-600">
            {selectedDept ? 'Employee Performance' : 'Department Performance Overview'}
          </p>
        </div>

        {/* Back Button */}
        {selectedDept && (
          <button
            onClick={handleBack}
            className="mb-6 px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition"
          >
            ← Back to Departments
          </button>
        )}

        {!selectedDept ? (
          // Department Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <button
                key={dept.id}
                onClick={() => handleDeptClick(dept.id)}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      ></div>
                      <h3 className="font-semibold text-slate-900">{dept.name}</h3>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{dept.completionRate}%</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${dept.completionRate}%` }}
                  ></div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Completed</p>
                    <p className="text-xl font-bold text-slate-900">
                      {dept.completedTasks}/{dept.totalTasks}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Completion Rate</p>
                    <p className="text-xl font-bold text-slate-900">{dept.completionRate}%</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">Click to view employees</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Employee Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-600">No employees in this department</p>
              </div>
            ) : (
              employees.map((emp) => (
                <div key={emp.userId} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {emp.avatar ? (
                      <img
                        src={emp.avatar}
                        alt={emp.name}
                        className="w-12 h-12 rounded-full bg-slate-200"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold">
                        {emp.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{emp.name}</h3>
                      <p className="text-sm text-slate-600">{emp.completionRate}% Complete</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all"
                      style={{ width: `${emp.completionRate}%` }}
                    ></div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600 mb-1">Assigned Tasks</p>
                      <p className="text-lg font-bold text-slate-900">{emp.totalTasks}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 mb-1">Completed</p>
                      <p className="text-lg font-bold text-green-600">{emp.completedTasks}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      Pending: {emp.totalTasks - emp.completedTasks}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
