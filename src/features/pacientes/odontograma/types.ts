// FDI adulto (permanentes)
export const FDI_TOP = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28] as const;
export const FDI_BOTTOM = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38] as const;
export type ToothNumber = (typeof FDI_TOP[number]) | (typeof FDI_BOTTOM[number]);

export type Surface = "M" | "D" | "B" | "L" | "O"; // mesial, distal, vestibular, lingual/palatina, oclusal/incisal

export type Condition =
  | "SANO"
  | "Careado"
  | "restoration"
  | "endodontics"
  | "crown"
  | "implant"
  | "missing"
  | "extraction-indicated";

export type ToothRecord = {
  tooth: ToothNumber;
  surfaces: Partial<Record<Surface, Condition>>;
  notes?: string;
  updatedAt: string; // ISO
};

export type Odontogram = {
  id: string;          
  patientId: string;   
  records: Record<ToothNumber, ToothRecord>; 
  createdAt: string;
  updatedAt: string;
};
