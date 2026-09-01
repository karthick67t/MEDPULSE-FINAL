export const patientLabel = (patientId) => {
  const rawId = String(patientId ?? '');
  const suffix = rawId.split('_').pop()?.replace(/\D/g, '');
  return suffix ? `Patient #${suffix.slice(-6)}` : 'Patient record';
};

export const patientRecordId = (patientId) => `Record ${String(patientId ?? '').replace(/\.0_/g, '-')}`;
