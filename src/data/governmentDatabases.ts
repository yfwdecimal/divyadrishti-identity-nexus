
import { IdentityRecord } from '@/types/divyadrishti';

// Real Indian Government Database (empty initially, populated via imports)
export const indianGovernmentDatabase: IdentityRecord[] = [];

// Imported records storage
let importedRecords: IdentityRecord[] = [];

export const addImportedRecords = (records: IdentityRecord[]) => {
  console.log(`Adding ${records.length} records to imported database`);
  importedRecords = [...importedRecords, ...records];
  console.log(`Total imported records: ${importedRecords.length}`);
};

export const getImportedRecords = (): IdentityRecord[] => {
  return importedRecords;
};

export const getAllDatabases = (): { [key: string]: IdentityRecord[] } => {
  const databases: { [key: string]: IdentityRecord[] } = {};
  
  if (importedRecords.length > 0) {
    databases['Imported Data'] = importedRecords;
  }
  
  if (indianGovernmentDatabase.length > 0) {
    databases['Indian Government'] = indianGovernmentDatabase;
  }
  
  return databases;
};

export const clearImportedRecords = () => {
  importedRecords = [];
  console.log('Imported records cleared');
};

export const getTotalRecordCount = (): number => {
  return indianGovernmentDatabase.length + importedRecords.length;
};
