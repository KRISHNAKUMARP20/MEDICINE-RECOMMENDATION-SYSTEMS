import { MEDICINES_DATA } from '../data/medicines';
import { checkDrugInteractions } from '../data/drugInteractions';
import { ExtractedPrescriptionMedication, PrescriptionScanResult } from '../types';

export async function processPrescriptionOCR(
  imageDataOrText: { base64Image?: string; text?: string },
  patientMedications: string[] = []
): Promise<PrescriptionScanResult> {
  let rawText = imageDataOrText.text || '';
  let doctorName = 'Dr. Attending Physician, MD';
  let clinicName = 'Healthcare Center';
  let patientName = 'Patient';
  let diagnosisNotes = 'Clinical Assessment & Prescription';

  // Attempt backend API call if image or text provided
  if (imageDataOrText.base64Image) {
    try {
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: imageDataOrText.base64Image })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.rawText) rawText = data.rawText;
        if (data.doctorName) doctorName = data.doctorName;
        if (data.clinicName) clinicName = data.clinicName;
        if (data.patientName) patientName = data.patientName;
        if (data.diagnosisNotes) diagnosisNotes = data.diagnosisNotes;
      }
    } catch {
      // Fallback to local parsing
    }
  }

  // Fallback extraction parser using clinical regex & dictionary matching
  const extractedMedications = parsePrescriptionText(rawText);

  // Cross check with current patient medications for interaction warnings
  const scannedDrugIds = extractedMedications
    .map(m => m.matchedMedicine?.id)
    .filter((id): id is string => Boolean(id));

  const allMeds = [...scannedDrugIds, ...patientMedications];
  const interactions = checkDrugInteractions(allMeds);

  extractedMedications.forEach(med => {
    if (med.matchedMedicine) {
      const medId = med.matchedMedicine.id;
      const relevant = interactions.filter(
        i => i.drugA.toLowerCase() === medId.toLowerCase() || i.drugB.toLowerCase() === medId.toLowerCase()
      );
      if (relevant.length > 0) {
        med.potentialInteractions = relevant.map(
          r => `Warning: Potential interaction with ${r.drugA.toLowerCase() === medId ? r.drugB : r.drugA} (${r.severity}) - ${r.clinicalEffect}`
        );
      }
    }
  });

  const warnings: string[] = [];
  if (extractedMedications.length === 0) {
    warnings.push('Could not detect specific medications with high confidence. Please verify manual entry.');
  }

  return {
    id: `scan_${Date.now()}`,
    timestamp: new Date().toISOString(),
    doctorName,
    clinicName,
    patientName,
    date: new Date().toLocaleDateString(),
    diagnosisNotes,
    medications: extractedMedications,
    rawText,
    warnings
  };
}

function parsePrescriptionText(text: string): ExtractedPrescriptionMedication[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const medications: ExtractedPrescriptionMedication[] = [];

  for (const line of lines) {
    // Check if line contains a known medication
    for (const med of MEDICINES_DATA) {
      const namesToSearch = [med.name, med.genericName, ...med.brandNames];
      const foundMatch = namesToSearch.some(n =>
        new RegExp(`\\b${escapeRegExp(n)}\\b`, 'i').test(line)
      );

      if (foundMatch) {
        // Extract dosage like 500mg, 10mg, 2 puffs, 1 sachet
        const doseMatch = line.match(/(\d+\s*(?:mg|g|mcg|ml|puffs?|sachet|units?))/i);
        const dosage = doseMatch ? doseMatch[0] : med.standardDosage.adult.split(' ')[0] || '1 unit';

        // Extract frequency (TID, BID, OD, QID, 1-0-1, once daily, twice daily)
        let frequency = 'Once daily';
        if (/TID|3 times daily|1-1-1/i.test(line)) frequency = '3 times daily (TID)';
        else if (/BID|twice daily|1-0-1/i.test(line)) frequency = 'Twice daily (BID)';
        else if (/QID|4 times daily/i.test(line)) frequency = '4 times daily (QID)';
        else if (/HS|bedtime|0-0-1/i.test(line)) frequency = 'At bedtime (HS)';
        else if (/PRN|SOS|as needed/i.test(line)) frequency = 'As needed (PRN)';
        else if (/OD|once daily|1-0-0/i.test(line)) frequency = 'Once daily (OD)';

        // Extract duration (7 days, 10 days, 1 month, 2 weeks)
        const durationMatch = line.match(/(\d+\s*(?:days?|weeks?|months?))/i);
        const duration = durationMatch ? durationMatch[0] : '7 Days';

        // Instructions (before food, after meals, with water)
        let timing = med.standardDosage.timing;
        if (/a\.?c\.?|before (?:food|meals|breakfast)/i.test(line)) timing = 'Before meals';
        if (/p\.?c\.?|after (?:food|meals)/i.test(line)) timing = 'After meals';
        if (/with (?:food|meals)/i.test(line)) timing = 'With food';

        medications.push({
          medicineName: med.name,
          matchedMedicine: med,
          dosage,
          frequency,
          duration,
          instructions: `Take ${dosage} ${frequency}. Timing: ${timing}.`,
          timing,
          confidence: 0.94
        });
        break; // Match first per line
      }
    }
  }

  // If no lines matched directly from MEDICINES_DATA, look for generic patterns like "Tab. [Name] 500mg"
  if (medications.length === 0) {
    const rxPattern = /(?:Tab\.?|Cap\.?|Syr\.?|Inj\.?|Rx\.?)\s*([A-Za-z]+)\s*(\d+\s*(?:mg|mcg|ml)?)/gi;
    let match;
    while ((match = rxPattern.exec(text)) !== null) {
      const name = match[1];
      const dose = match[2] || 'Standard dose';
      medications.push({
        medicineName: name,
        dosage: dose,
        frequency: 'Twice daily',
        duration: '5 Days',
        instructions: `Take ${dose} as directed by prescribing physician.`,
        timing: 'After meals',
        confidence: 0.78
      });
    }
  }

  return medications;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
