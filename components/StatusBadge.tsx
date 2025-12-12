import React from 'react';
import { LoanStatus, ItemCondition } from '../types';

export const LoanStatusBadge = ({ status }: { status: LoanStatus }) => {
  const styles = {
    [LoanStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    [LoanStatus.APPROVED]: 'bg-blue-100 text-blue-800 border-blue-200',
    [LoanStatus.REJECTED]: 'bg-red-100 text-red-800 border-red-200',
    [LoanStatus.RETURNED]: 'bg-green-100 text-green-800 border-green-200',
  };

  const labels = {
    [LoanStatus.PENDING]: 'Menunggu',
    [LoanStatus.APPROVED]: 'Dipinjam',
    [LoanStatus.REJECTED]: 'Ditolak',
    [LoanStatus.RETURNED]: 'Dikembalikan',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export const ConditionBadge = ({ condition }: { condition: ItemCondition }) => {
  return condition === ItemCondition.BAIK ? (
    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium border border-green-200">Baik</span>
  ) : (
    <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-medium border border-red-200">Rusak</span>
  );
};