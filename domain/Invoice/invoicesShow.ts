export interface InvoiceShow {
  id: number;
  issuanceDate: Date;
  dueDate: Date;
  value: number;
  status: number;
  description: string;
  patientId: number;
  doctorId: number;
  appointmentId: number;
}
